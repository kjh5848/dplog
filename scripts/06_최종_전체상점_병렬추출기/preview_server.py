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
from database import add_target_store, add_tracked_keyword, get_rank_history, get_all_target_stores
from scheduler import run_scheduled_extraction
from keyword_scoring_engine import generate_scored_keywords

app = FastAPI(title="Naver Map Scraper Observer MVP")

# --- 6시간 자동 모니터링 스케줄러 ---
async def continuous_scheduler():
    while True:
        try:
            print("🚀 [Auto Schedule] 정기 백그라운드 랭킹 수집을 시작합니다. (6시간 간격)")
            await run_scheduled_extraction()
        except Exception as e:
            print(f"❌ [Auto Schedule] 스케줄러 구동 중 오류: {e}")
        
        # 다음 실행까지 6시간 대기 (6시간 = 60분 * 60초 * 6 = 21600초)
        await asyncio.sleep(6 * 60 * 60)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(continuous_scheduler())
    print("✅ 자동 모니터링 스케줄러 커널이 백그라운드에 마운트되었습니다 (6H Interval)")
# ------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

# Jinja2 템플릿 설정
templates = Jinja2Templates(directory=TEMPLATES_DIR)

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

class JourneyRequest(BaseModel):
    keyword: str
    target_store_name: Optional[str] = None

class DeepRegisterRequest(BaseModel):
    url: str
    lat: float = 0.0
    lon: float = 0.0

@app.get("/", response_class=HTMLResponse)
async def serve_ui(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# --------------- CORE EXTRACTION ---------------
@app.post("/api/extract")
async def extract_data(req: ExtractRequest):
    print(f"🔥 [API 호출] 키워드: {req.keywords}, 스레드: {req.concurrency}, 좌표: {req.lat}, {req.lon}")
    try:
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

# --------------- STORE MONITORING & DB ---------------
@app.post("/api/store/register")
async def register_store_full(req: DeepRegisterRequest):
    """(SaaS UX) URL을 입력받아 상점을 딥 스크랩하고 DB에 저장한 뒤, 추출된 추천 키워드와 통합 지표를 반환합니다."""
    from naver_ads_client import get_keyword_stats
    try:
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
            lon=req.lon
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
    
    background_tasks.add_task(run_scheduled_extraction)
    return {"status": "success", "message": "키워드가 등록되었으며 백그라운드 수집이 즉시 시작되었습니다."}

@app.get("/api/store/all")
async def get_all_stores():
    stores = get_all_target_stores()
    return {"status": "success", "data": stores}

@app.get("/api/store/history/{store_id}")
async def fetch_history(store_id: int):
    history = get_rank_history(store_id)
    return {"status": "success", "data": history}

@app.post("/api/scheduler/run-now")
async def trigger_scheduler(background_tasks: BackgroundTasks):
    """트래커 수동 즉시 실행 (백그라운드 비동기)"""
    background_tasks.add_task(run_scheduled_extraction)
    return {"status": "success", "message": "Rank polling scheduler has been dispatched in the background."}

@app.post("/api/store/discover-keywords")
async def discover_customer_journey_keywords(req: JourneyRequest):
    """(신규) 메인 키워드 1개를 주면 자동완성/연관 다단계 크롤링으로 상중하 타겟 키워드 맵 반환 + 모바일 노출 검사"""
    try:
        result = await generate_scored_keywords(req.keyword, req.target_store_name)
        return {"status": "success", "data": result}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# --------------- DEEP SCRAPING ---------------
@app.post("/api/store/deep-scrape")
async def auto_diagnose(req: DeepScrapeRequest):
    """상점 고유 ID를 주면, 해당 상세페이지에서 데이터 추출 및 자동 키워드 추천을 수행합니다."""
    place_id_clean = await extract_place_id(req.place_id)
    print(f"🔍 [Deep Scrape] 대상: {place_id_clean}")
    try:
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

if __name__ == "__main__":
    import uvicorn
    # 터미널에서 python preview_server.py 로도 구동할 수 있게 지원
    uvicorn.run("preview_server:app", host="0.0.0.0", port=8000, reload=True)
