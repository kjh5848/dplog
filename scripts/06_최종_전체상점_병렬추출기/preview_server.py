from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import os
import httpx
import asyncio

# 1. Custom modules
from full_list_extractor_8_threads import run_engine
from place_detail_extractor import scrape_place_details, extract_place_id
from database import add_target_store, add_tracked_keyword, get_rank_history, get_all_target_stores, get_latest_snapshot, delete_target_store, delete_tracked_keyword, get_target_store
from scheduler import run_scheduled_extraction
from keyword_scoring_engine import generate_scored_keywords
from v1_router import v1_router

app = FastAPI(title="Naver Map Scraper Observer MVP")
app.include_router(v1_router)

# 전역 잠금장치 (Global Semaphore)
# M1 16GB의 메모리 한계(최대 15탭)를 방어하기 위해 서버 전체에서 
# Playwright 엔진을 동시에 딱 1명(1그룹)만 구동하게 만드는 "대기열(Queue)"입니다.
GLOBAL_BROWSER_SEMAPHORE = None

# --- 자동 모니터링 스케줄러 ---
async def continuous_scheduler():
    while True:
        try:
            print("🚀 [Auto Schedule] 정기 백그라운드 랭킹 수집 대기열 참가 중...")
            async with GLOBAL_BROWSER_SEMAPHORE:
                await run_scheduled_extraction()

        except Exception as e:
            print(f"❌ [Auto Schedule] 스케줄러 구동 중 오류: {e}")
        
        # 다음 폴링까지 5분 대기 (DB의 next_scrape_at 시간에 도달한 것들을 지속적으로 15개씩 소화하기 위함)
        await asyncio.sleep(5 * 60)

async def locked_run_scheduled_extraction():
    """백그라운드 Task로 호출될 때 OOM을 방어하기 위한 락 래퍼 함수"""
    async with GLOBAL_BROWSER_SEMAPHORE:
        print("[대기열 진입 성공] 비동기 백그라운드 스케줄러 가동 시작!")
        await run_scheduled_extraction()

@app.on_event("startup")
async def startup_event():
    global GLOBAL_BROWSER_SEMAPHORE
    # 네이버 안티봇(WAF)의 동시 접속 DDoS 방어를 위해,
    # 서버 전체 구동을 완벽하게 '1명(단일 그룹)'으로 직렬화(Serialize) 합니다.
    # 이렇게 해야 각 스레드 간의 0.5초 Stagger Jitter 가 겹치지 않고 보장됩니다.
    GLOBAL_BROWSER_SEMAPHORE = asyncio.Semaphore(1)
    
    asyncio.create_task(continuous_scheduler())
    print("✅ 자동 모니터링 스케줄러 및 글로벌 대기열(Max 2) 커널이 마운트되었습니다.")
# ------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# UI 디렉토리 마운트 설정 (마지막에 catch-all 라우터로 적용)
UI_DIR = os.path.join(BASE_DIR, "ui")
class ExtractRequest(BaseModel):
    keywords: list[str]
    concurrency: int = 8
    lat: float = 35.1631139
    lon: float = 129.1586925

class RegisterStoreRequest(BaseModel):
    place_id: str
    name: str
    lat: float = 0.0
    lon: float = 0.0
    keywords: list[str] = []

class GeoSearchRequest(BaseModel):
    query: str

class DeepScrapeRequest(BaseModel):
    place_id: str

from pydantic import BaseModel
from typing import Optional

class JourneyRequest(BaseModel):
    keyword: str
    target_store_name: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

class DeepRegisterRequest(BaseModel):
    url: str
    lat: float = 0.0
    lon: float = 0.0

# (이전의 GET / 라우트는 최하단의 Next.js 마운트가 대신 처리합니다.)

# --------------- CORE EXTRACTION ---------------
@app.post("/api/extract")
async def extract_data(req: ExtractRequest):
    print(f"🔥 [API 호출] 키워드: {req.keywords}, 스레드: {req.concurrency}, 좌표: {req.lat}, {req.lon}")
    try:
        async with GLOBAL_BROWSER_SEMAPHORE:
            print("[대기열 진입 성공] Core 추출 엔진 가동 시작!")
            results = await run_engine(
                keywords_list=req.keywords,
                concurrency=req.concurrency,
                target_lat=req.lat,
                target_lon=req.lon
            )
        return {"status": "success", "data": results}
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        return {"status": "error", "message": str(e)}

# --------------- GEO SEARCH API ---------------
@app.get("/api/geo/search")
async def geo_search(query: str):
    """오픈소스 Nominatim API를 통해 평문(부산광역시 해운대구 등)을 위경도로 변환합니다."""
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={query}&limit=1"
    headers = {'User-Agent': 'D-PLOG-App/1.0'}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return {"status": "success", "lat": data["lat"], "lon": data["lon"], "display_name": data["display_name"]}
        return {"status": "error", "message": "Location not found"}

# --------------- STORE SEARCH API (NAVER MAP PROXY) ---------------
@app.get("/api/store/search")
async def search_store_by_name(query: str):
    """네이버 지도 비공식 API를 이용해 상호명 검색 결과를 반환합니다."""
    if not query:
        return {"status": "error", "message": "Query is required"}

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
    
    # 1. 네이버 지도 모바일 (SSR Data) 기반 파싱 (가장 정확하고 안정적)
    url_m = "https://m.map.naver.com/search"
    params = {
        "query": query
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "Referer": "https://m.map.naver.com/"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url_m, params=params, headers=headers, timeout=5.0)
            if resp.status_code == 200:
                import re, json
                html_content = resp.text
                results = []

                # React Query 의 Dehydrated State 에서 items (가게 목록) 추출
                matches = re.findall(r'window\.__RQ_STREAMING_STATE__\.push\((.*?)\);', html_content)
                for json_str in matches:
                    try:
                        data = json.loads(json_str)
                        queries = data.get("queries", [])
                        for q in queries:
                            q_data = q.get("state", {}).get("data", {})
                            if isinstance(q_data, dict) and "items" in q_data:
                                items = q_data["items"]
                                for item in items:
                                    if "id" in item and "name" in item:
                                        results.append({
                                            "id": str(item["id"]),
                                            "name": item.get("name", ""),
                                            "category": item.get("category", ""),
                                            "address": item.get("roadAddress", "") or item.get("address", ""),
                                            "thumUrl": item.get("thumbUrl", ""),
                                            "source": "map_ssr"
                                        })
                    except Exception as e:
                        print(f"[검색 API] JSON 파싱 실패: {e}")

                # 중복 제거 (여러 push에서 겹칠 수 있으므로)
                unique_results = []
                seen = set()
                for r in results:
                    if r['id'] not in seen:
                        seen.add(r['id'])
                        unique_results.append(r)

                return {"status": "success", "results": unique_results}
    except Exception as e:
        print(f"[검색 API] HTML 스크래핑 검색 실패: {e}")
        return {"status": "error", "message": str(e)}

    return {"status": "success", "results": []}

# --------------- STORE MONITORING & DB ---------------
@app.post("/api/store/register")
async def register_store_full(req: DeepRegisterRequest):
    """(SaaS UX) URL을 입력받아 상점을 딥 스크랩하고 DB에 저장한 뒤, 추출된 추천 키워드와 통합 지표를 반환합니다."""
    from naver_ads_client import get_keyword_stats
    try:
        async with GLOBAL_BROWSER_SEMAPHORE:
            print("[대기열 진입 성공] 상점 신규 스크랩 엔진 가동 시작!")
            place_id_clean = await extract_place_id(req.url)
            details = await scrape_place_details(place_id_clean)
        
        if not details.get("name") and details.get("visitor_reviews", 0) == 0:
            return {"status": "error", "message": "상점 데이터 추출에 실패했습니다. (잘못된 URL)"}
            
        # 1. DB에 상점 저장
        store_id = add_target_store(
            place_id=place_id_clean, 
            name=details.get("name", "Unknown"), 
            category=details.get("category", ""), 
            address=details.get("address", ""), 
            lat=req.lat, 
            lon=req.lon,
            visitor_reviews=details.get("visitor_reviews", 0),
            blog_reviews=details.get("blog_reviews", 0),
            saves=details.get("saves", 0),
            rating=details.get("rating", 0.0),
            official_keywords=details.get("official_keywords", [])
        )
        details["store_id"] = store_id
        
        # 2. 추천 키워드의 네이버 광고지표(검색량/클릭률) 연동 합산
        suggested_kws = details.get("suggested_keywords", [])
        ads_stats = get_keyword_stats(suggested_kws)
        
        # 3. 데이터 병합하여 반환
        return {
            "status": "success", 
            "store_data": details,
            "keyword_insights": ads_stats
        }
    except Exception as e:
        print(f"❌ 상점 등록 중 에러 발생: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/store/{store_id}/keywords")
async def add_keywords(store_id: int, keywords: list[str], background_tasks: BackgroundTasks):
    """선택한 키워드들을 DB의 추적 리스트에 일괄 등록하고 즉시 랭킹 수집을 시작합니다."""
    for kw in keywords:
        add_tracked_keyword(store_id=store_id, keyword=kw)
    
    background_tasks.add_task(locked_run_scheduled_extraction)
    return {"status": "success", "message": "키워드가 등록되었으며 백그라운드 수집이 즉시 시작되었습니다."}

@app.get("/api/store/all")
async def get_all_stores():
    stores = get_all_target_stores()
    return {"status": "success", "data": stores}

@app.delete("/api/store/{store_id}")
async def delete_store(store_id: int):
    success = delete_target_store(store_id)
    if success:
        return {"status": "success", "message": "상점이 삭제되었습니다."}
    return {"status": "error", "message": "상점 삭제 중 오류가 발생했습니다."}

@app.delete("/api/store/{store_id}/keywords/{keyword}")
async def delete_keyword(store_id: int, keyword: str):
    success = delete_tracked_keyword(store_id, keyword)
    if success:
        return {"status": "success", "message": f"키워드 '{keyword}' 삭제 완료."}
    return {"status": "error", "message": "키워드 삭제 중 오류가 발생했습니다."}

@app.get("/api/store/{store_id}")
async def get_store_details(store_id: int):
    store = get_target_store(store_id)
    if store:
        return {"status": "success", "data": store}
    return {"status": "error", "message": "상점을 찾을 수 없습니다."}

@app.get("/api/store/history/{store_id}")
async def fetch_history(store_id: int):
    history = get_rank_history(store_id)
    return {"status": "success", "data": history}

@app.get("/api/store/{store_id}/snapshot/{keyword}")
async def fetch_latest_snapshot_by_keyword(store_id: int, keyword: str):
    """(신규) 대시보드에서 뱃지를 클릭했을 때, 특정 키워드의 타임머신 스냅샷(지배력 데이터)을 가져옴"""
    import sqlite3
    from database import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM tracked_keywords WHERE store_id = ? AND keyword = ?", (store_id, keyword))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {"status": "error", "message": "키워드를 찾을 수 없습니다."}
        
    snapshot = get_latest_snapshot(row[0])
    if snapshot:
        return {"status": "success", "data": snapshot}
    return {"status": "error", "message": "해당 키워드의 스냅샷 데이터가 아직 존재하지 않습니다."}

@app.post("/api/scheduler/run-now")
async def trigger_scheduler(background_tasks: BackgroundTasks):
    """트래커 수동 즉시 실행 (백그라운드 비동기)"""
    background_tasks.add_task(locked_run_scheduled_extraction)
    return {"status": "success", "message": "Rank polling scheduler has been dispatched in the background."}

@app.post("/api/store/discover-keywords")
async def discover_customer_journey_keywords(req: JourneyRequest):
    """(신규) 메인 키워드 1개를 주면 자동완성/연관 다단계 크롤링으로 상중하 타겟 키워드 맵 반환 + 모바일 노출 검사"""
    try:
        async with GLOBAL_BROWSER_SEMAPHORE:
            print(f"[대기열 진입 성공] 황금키워드 모바일 검색 및 플레이스 순위 엔진 가동! (위치 오버라이드: {req.lat}, {req.lon})")
            result = await generate_scored_keywords(req.keyword, req.target_store_name, req.lat, req.lon)
        return {"status": "success", "data": result}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# --------------- DEEP SCRAPING ---------------
@app.post("/api/store/deep-scrape")
async def auto_diagnose(req: DeepScrapeRequest):
    """상점 고유 ID를 주면, 해당 상세페이지에서 데이터 추출 및 자동 키워드 추천을 수행합니다."""
    try:
        print(f"🚦 [대기열 줄서기] 👤 유저 '{req.place_id[-6:]}' 님이 시스템 큐에 줄을 섰습니다. (앞 작업 대기 중)")
        async with GLOBAL_BROWSER_SEMAPHORE:
            print(f"🟢 [대기열 입장성공] 👤 유저 '{req.place_id[-6:]}' 님의 딥 스크랩 엔진 가동 시작!")
            place_id_clean = await extract_place_id(req.place_id)
            details = await scrape_place_details(place_id=place_id_clean)
        
        # 완전한 추출 실패 감지 (이름도 없고, 방문자수도 없으면)
        if not details.get("name") and details.get("visitor_reviews", 0) == 0:
            from fastapi import HTTPException
            raise HTTPException(status_code=500, detail="상점 데이터 추출에 실패했습니다. (DOM 구조 변경 또는 존재하지 않는 ID)")
            
        return {"status": "success", "data": details}
    except Exception as e:
        print(f"❌ Deep Scrape 에러: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

# --------------- NEXT.JS UI MOUNT ---------------
from fastapi.templating import Jinja2Templates
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

app.mount("/static", StaticFiles(directory=TEMPLATES_DIR), name="static")

@app.get("/", response_class=HTMLResponse)
async def serve_ui(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

if __name__ == "__main__":
    import uvicorn
    # 터미널에서 python preview_server.py 로도 구동할 수 있게 지원
    uvicorn.run("preview_server:app", host="0.0.0.0", port=8001, reload=True)
