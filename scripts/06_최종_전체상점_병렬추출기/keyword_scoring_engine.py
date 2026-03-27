import asyncio
import httpx
from keyword_discovery_engine import discover_customer_journey
from naver_ads_client import get_keyword_stats

async def check_mobile_exposure(kw_strings: list[str], target_store_name: str) -> dict:
    """네이버 모바일 통합 검색에서 각 키워드별 target_store_name 등장 횟수를 비동기로 조사합니다."""
    exposure_stats = {}
    
    # 세마포어로 동시 요청 수를 15로 제한 (네이버 안티봇 방지)
    sem = asyncio.Semaphore(15)
    
    async def fetch_and_count(client: httpx.AsyncClient, kw: str):
        url = f"https://m.search.naver.com/search.naver?query={kw}"
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        }
        async with sem:
            try:
                resp = await client.get(url, headers=headers, timeout=10.0)
                if resp.status_code == 200:
                    html = resp.text
                    import re
                    # 1. script와 style 태그 내용 전체 제거 (메타데이터, JSON 노이즈 등 방지)
                    cleaned_text = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
                    # 2. 나머지 HTML 태그 껍데기 제거
                    cleaned_text = re.sub(r'<[^>]+>', ' ', cleaned_text)
                    
                    # 3. 화면에 보이는 순수 텍스트(뷰어/블로그/지식인 등)에서만 카운팅
                    count = cleaned_text.count(target_store_name)
                    exposure_stats[kw] = {"is_exposed": count > 0, "exposure_count": count}
                else:
                    exposure_stats[kw] = {"is_exposed": False, "exposure_count": 0}
            except Exception as e:
                print(f"[모바일 노출 검사 실패] {kw} - {e}")
                exposure_stats[kw] = {"is_exposed": False, "exposure_count": 0}

    async with httpx.AsyncClient() as client:
        tasks = [fetch_and_count(client, kw) for kw in kw_strings]
        await asyncio.gather(*tasks)
        
    return exposure_stats

import sqlite3
from database import DB_PATH
from full_list_extractor_8_threads import run_engine

async def check_place_ranking(kw_strings: list[str], target_store_name: str) -> dict:
    """테스트용: 모든 키워드에 대해 Playwright를 가동하여 플레이스 실제 순위를 가져옵니다."""
    # 상점의 좌표 조회 (기본값 설정)
    target_lat, target_lon = 35.1631139, 129.1586925
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT lat, lon FROM target_stores WHERE name = ?", (target_store_name,))
    row = cursor.fetchone()
    conn.close()
    
    if row and row['lat']: 
        target_lat = float(row['lat'])
        target_lon = float(row['lon'])

    print(f"[실험 가동] 🔥 대표님 요청: {len(kw_strings)}개 전체 키워드에 대한 Playwright 랭킹 집적 스크랩핑 시작!")
    # 코어 엔진 가동 (약 3~4분 소요 예상)
    all_results = await run_engine(keywords_list=kw_strings, concurrency=8, target_lat=target_lat, target_lon=target_lon)
    
    # 키워드별 순위 집계 (자연노출, 광고 분리)
    ranking_stats = {kw: {"organic": 0, "ad": 0} for kw in kw_strings}
    for r in all_results:
        if target_store_name in r['상호명']:
            if "N" in r.get('광고여부', "N").upper():
                if ranking_stats[r['키워드']]["organic"] == 0:
                    ranking_stats[r['키워드']]["organic"] = r['순위']
            else:
                if ranking_stats[r['키워드']]["ad"] == 0:
                    ranking_stats[r['키워드']]["ad"] = r['순위']
    
    print("[실험 가동] Playwright 스크래핑 완료!")
    return ranking_stats

async def generate_scored_keywords(base_keyword: str, target_store_name: str = None) -> dict:
    """
    1. 자동완성/연관 다중 Depth 로 파생 키워드 색인
    2. 네이버 광고 API로 검색량/클릭률 동기화
    3. 트래픽 기준으로 초/중/고 그룹핑
    """
    
    # 1. 고객 동선 발굴 (수집)
    print(f"[스코어링 엔진] 1. '{base_keyword}' 고객 동선 파이프라인 가동")
    raw_keywords = await discover_customer_journey(base_keyword)
    
    if not raw_keywords:
        return {"high": [], "mid": [], "low": []}
        
    print(f"[스코어링 엔진] 2. {len(raw_keywords)}개의 키워드에 대해 광고 API 볼륨/클릭률 조회 시작")
    # raw_keywords 는 [{"keyword": "A", "parent": "B", "depth": 1}, ...] 형태의 객체 리스트
    kw_strings = [item["keyword"] for item in raw_keywords]
    stats = get_keyword_stats(kw_strings)
    
    # 2.5. 모바일 노출 검사
    exposure_dict = {}
    place_ranking_dict = {}
    if target_store_name:
        print(f"[스코어링 엔진] 2.5 '{target_store_name}' 모바일 노출 여부 검사 시작 ({len(kw_strings)}개)")
        exposure_dict = await check_mobile_exposure(kw_strings, target_store_name)
        
        # [실험 기능] 플레이스 실시간 순위 조회 
        place_ranking_dict = await check_place_ranking(kw_strings, target_store_name)

    # 맵핑을 위한 사전
    # 원본 키워드를 정규화(공백제거)한 키를 기준으로 그룹핑
    normalized_to_original = {}
    for item in raw_keywords:
        norm = item["keyword"].replace(" ", "")
        if norm not in normalized_to_original:
            normalized_to_original[norm] = []
        normalized_to_original[norm].append(item)
    
    # stats 루프를 돌면서, API 응답(정규화됨)을 원본 키워드들에 전파
    expanded_stats = []
    for stat in stats:
        norm_kw = stat["keyword"].replace(" ", "")
        originals = normalized_to_original.get(norm_kw, [])
        for orig_item in originals:
            orig_kw = orig_item["keyword"]
            new_stat = dict(stat)
            new_stat["keyword"] = orig_kw
            
            # 계층 메타데이터 병합
            new_stat["parent"] = orig_item.get("parent", base_keyword)
            new_stat["depth"] = orig_item.get("depth", 1)
            
            # 노출 지표 병합 (원본 키워드 기준)
            exp_info = exposure_dict.get(orig_kw, {"is_exposed": False, "exposure_count": 0})
            new_stat["is_exposed"] = exp_info["is_exposed"]
            new_stat["exposure_count"] = exp_info["exposure_count"]
            
            # 플레이스 순위 병합 (원본 키워드 기준)
            ranks = place_ranking_dict.get(orig_kw, {"organic": 0, "ad": 0})
            new_stat["place_rank"] = ranks["organic"]
            new_stat["ad_rank"] = ranks["ad"]
            
            expanded_stats.append(new_stat)
            
    # --- 스마트 병합 (Smart Merge) 로직 추가 ---
    # 규칙: 정규화 키워드가 동일한데 (organic, ad) 순위가 같으면 중복 제거, 다르면 차익기회(Arbitrage)로 살림
    def deduplicate(sector_list):
        grouped = {}
        for item in sector_list:
            norm = item["keyword"].replace(" ", "")
            if norm not in grouped:
                grouped[norm] = []
            grouped[norm].append(item)
            
        result = []
        for norm, items in grouped.items():
            if len(items) == 1:
                result.append(items[0])
            else:
                ranks = [(it["place_rank"], it["ad_rank"]) for it in items]
                if len(set(ranks)) == 1:
                    # 순위가 모두 동일: 띄어쓰기 없는 버전을 우선으로 하나만 남기기
                    unspaced = next((it for it in items if " " not in it["keyword"]), items[0])
                    result.append(unspaced)
                else:
                    # 차익거래 기회 발견! 둘 다 남기고 플래그 추가
                    for it in items:
                        it["is_arbitrage"] = True
                        result.append(it)
        return result

    high_temp = []
    mid_temp = []
    low_temp = []
    
    for stat in expanded_stats:
        vol = stat.get('total_vol', 0)
        # 하드코딩 매직 넘버 보정: 네이버 통합검색은 최소 조회수가 10임.
        if vol >= 5000:
            high_temp.append(stat)
        elif 500 <= vol < 5000:
            mid_temp.append(stat)
        else:
            low_temp.append(stat)
            
    high = deduplicate(high_temp)
    mid = deduplicate(mid_temp)
    low = deduplicate(low_temp)
            
    # 검색량 기준 내림차순 정렬
    high.sort(key=lambda x: x['total_vol'], reverse=True)
    mid.sort(key=lambda x: x['total_vol'], reverse=True)
    low.sort(key=lambda x: x['total_vol'], reverse=True)
    
    return {
        "high": high[:30], # 각 섹터당 무한정 길어지는 걸 방지하기 위해 최대 30개씩 자름
        "mid": mid[:30],
        "low": low[:40] 
    }
