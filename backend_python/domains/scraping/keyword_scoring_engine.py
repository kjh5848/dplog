import asyncio
import httpx
from .keyword_discovery_engine import discover_customer_journey
from .naver_ads_client import get_keyword_stats

import re as _re

# 상점명 정제 함수 — '성심당 본점' → ['성심당 본점', '성심당'] 후보 이름 생성
def get_store_name_candidates(name: str) -> list:
    """
    '본점', '2호점', '홍대점' 등 접미사를 제거한 정제 이름을 추가로 생성.
    두 이름 중 하나라도 검색 결과에 등장하면 '노출'로 판정합니다.
    """
    candidates = [name]  # 원본 이름 우선
    # 접미사 패턴: '본점', '직영점', '직주점', '지점', N호점, 지역명+점 등
    suffix_pattern = _re.compile(
        r'(\s*(본점|직영점|직주점|지점|평택점|\d+호점|[가-힣]{1,4}점|동점|직막점|별관))$'
    )
    base = suffix_pattern.sub('', name).strip()
    if base and base != name:
        candidates.append(base)
    return candidates

async def check_mobile_exposure(kw_strings: list, target_store_name: str) -> dict:
    """네이버 모바일 통합 검색에서 각 키워드별 target_store_name 등장 횟수를 비동기로 조사합니다."""
    exposure_stats = {}
    
    import random
    
    # 세마포어로 동시 요청 수를 5로 감소 (네이버 WAF DDoS 방어 작동 회피)
    sem = asyncio.Semaphore(5)
    
    async def fetch_and_count(client: httpx.AsyncClient, kw: str, index: int):
        url = f"https://m.search.naver.com/search.naver?query={kw}"
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        }
        async with sem:
            # HTTP 요청에도 Stagger Jitter (지연 발사) 적용. 
            # 15개가 동시에 쏟아지면 방화벽이 차단하므로 무작위 지연을 줍니다.
            delay = random.uniform(0.1, 10.0)
            await asyncio.sleep(delay)
            
            try:
                resp = await client.get(url, headers=headers, timeout=10.0)
                if resp.status_code == 200:
                    html = resp.text
                    import re
                    # 1. script와 style 태그 내용 전체 제거 (메타데이터, JSON 노이즈 등 방지)
                    cleaned_text = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
                    # 2. 나머지 HTML 태그 껍데기 제거
                    cleaned_text = re.sub(r'<[^>]+>', ' ', cleaned_text)
                    
                    # 3. 원본명 + 정제명(본점 제거 등) 두 가지로 카운팅 → 오탐 방지
                    name_candidates = get_store_name_candidates(target_store_name)
                    count = sum(cleaned_text.count(c) for c in name_candidates)
                    exposure_stats[kw] = {"is_exposed": count > 0, "exposure_count": count}
                else:
                    exposure_stats[kw] = {"is_exposed": False, "exposure_count": 0}
            except Exception as e:
                print(f"[모바일 노출 검사 실패] {kw} - {e}")
                exposure_stats[kw] = {"is_exposed": False, "exposure_count": 0}

    async with httpx.AsyncClient() as client:
        tasks = [fetch_and_count(client, kw, i) for i, kw in enumerate(kw_strings)]
        await asyncio.gather(*tasks)
        
    return exposure_stats

from .full_list_extractor import run_engine

async def check_place_ranking(
    base_keyword: str, 
    kw_strings: list[str], 
    target_store_name: str,
    target_lat: float = None,
    target_lon: float = None,
    fallback_placeUrl: str = None
) -> dict:
    """테스트용: 모든 키워드에 대해 Playwright를 가동하여 플레이스 실제 순위를 가져옵니다."""
    
    
    if target_lat is None or target_lon is None:
        print(f"❌ [위치 정보 없음] 프론트엔드 지도 핀도 없고 스토어 좌표도 없습니다. 기본값(서울 강남역 한복판)을 임의 사용합니다.")
        target_lat, target_lon = 37.497952, 127.027619

    print(f"[실험 가동] 🔥 대표님 요청: {len(kw_strings)}개 전체 키워드에 대한 Playwright 랭킹 집적 스크랩핑 시작!")
    
    CHUNK_SIZE = 15
    COOLDOWN_SECONDS = 60 # 단일 IP 과열 방지를 위한 쿨다운 (로컬 엣지 아키텍처)
    all_results = []
    
    for i in range(0, len(kw_strings), CHUNK_SIZE):
        chunk = kw_strings[i : i + CHUNK_SIZE]
        print(f"📦 [청크 {i//CHUNK_SIZE + 1} / {(len(kw_strings) - 1)//CHUNK_SIZE + 1}] {len(chunk)}개 키워드 스크래핑 시작 (전체 진행률: {i+len(chunk)}/{len(kw_strings)})")
        
        # 청크 단위로 엔진 가동
        chunk_results = await run_engine(keywords_list=chunk, concurrency=2, target_lat=target_lat, target_lon=target_lon, max_scroll=80, target_store_name=target_store_name)
        all_results.extend(chunk_results)
        
        # [방어 로직] 청크 처리 중 IP 차단이 감지되면 즉시 셧다운
        if len(chunk_results) > 0 and chunk_results[0].get("상호명") == "__BLOCKED__":
            from fastapi import HTTPException
            raise HTTPException(status_code=429, detail="네이버 IP 차단 방화벽(WAF)이 작동했습니다. 로컬 네트워크 IP를 변경하거나 잠시 후 다시 시도해주세요.")
            
        # 마지막 청크가 아니면 쿨다운 대기
        if i + CHUNK_SIZE < len(kw_strings):
            print(f"⏳ [쿨다운] 단일 IP 과부하(WAF 429) 방지를 위해 {COOLDOWN_SECONDS}초간 휴식합니다...")
            await asyncio.sleep(COOLDOWN_SECONDS)
    
    # 키워드별 순위 집계 및 스토어 글로벌 통계 수집
    ranking_stats = {kw: {"organic": 0, "ad": 0} for kw in kw_strings}
    store_metrics = {"방문자리뷰": "0", "블로그리뷰": "0", "저장수": "0", "평점": "0"}
    
    for r in all_results:
        # 원본 상점명 + 정제명('본점' 제거 등) 두 가지로 매칭 → 오탐 방지
        name_candidates = get_store_name_candidates(target_store_name)
        if any(c in r['상호명'] for c in name_candidates):
            # 스토어 주요 지표 수집 (최초로 발견된 한 번만 기록하면 됨)
            if store_metrics["방문자리뷰"] == "0" and r.get("방문자리뷰", "") not in ["", "0", "null", "None"]:
                store_metrics["방문자리뷰"] = str(r.get("방문자리뷰"))
            if store_metrics["블로그리뷰"] == "0" and r.get("블로그리뷰", "") not in ["", "0", "null", "None"]:
                store_metrics["블로그리뷰"] = str(r.get("블로그리뷰"))
            if store_metrics["저장수"] == "0" and r.get("저장수", "") not in ["", "0", "null", "None"]:
                store_metrics["저장수"] = str(r.get("저장수"))
            if store_metrics["평점"] == "0" and r.get("평점", "") not in ["", "0", "null", "None"]:
                store_metrics["평점"] = str(r.get("평점"))
            
            if "placeUrl" not in store_metrics and r.get("네이버_플레이스_URL"):
                store_metrics["placeUrl"] = r.get("네이버_플레이스_URL")

            if "N" in r.get('광고여부', "N").upper():
                if ranking_stats[r['키워드']]["organic"] == 0:
                    ranking_stats[r['키워드']]["organic"] = r['순위']
            else:
                if ranking_stats[r['키워드']]["ad"] == 0:
                    ranking_stats[r['키워드']]["ad"] = r['순위']
                    
    # --- 목록 API 누락 대비 상세 딥 스크래핑 진행 (대표님 요청) ---
    final_place_url = store_metrics.get("placeUrl") or fallback_placeUrl
    if final_place_url and (store_metrics["방문자리뷰"] == "0" or store_metrics["블로그리뷰"] == "0"):
        try:
            print(f"⏳ [스코어링 엔진 Fallback] 목록 API에서 리뷰 누락 감지됨. 상세 페이지({final_place_url}) 다이렉트 스크래핑 진행...")
            from .place_detail_extractor import scrape_place_details
            detail_data = await scrape_place_details(final_place_url)
            
            if detail_data.get("visitor_reviews", 0) > 0:
                store_metrics["방문자리뷰"] = str(detail_data["visitor_reviews"])
            if detail_data.get("blog_reviews", 0) > 0:
                store_metrics["블로그리뷰"] = str(detail_data["blog_reviews"])
            
            if "placeUrl" not in store_metrics:
                store_metrics["placeUrl"] = final_place_url
        except Exception as e:
            print(f"상세 페이지 보강 파싱 실패: {e}")
    
    print(f"[실험 가동] Playwright 스크래핑 완료 (스토어 지표: {store_metrics})")
    return {
        "rankings": ranking_stats,
        "store_metrics": store_metrics
    }

async def generate_scored_keywords(base_keyword: str, target_store_name: str = None, target_lat: float = None, target_lon: float = None, target_placeUrl: str = None) -> dict:
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
    store_metrics_dict = {}
    if target_store_name:
        import time
        capture_start = time.time()
        print(f"[스코어링 엔진] 2.5 '{target_store_name}' 모바일 노출 여부 검사 시작 ({len(kw_strings)}개)")
        exposure_dict = await check_mobile_exposure(kw_strings, target_store_name)
        print(f"[스코어링 엔진] 모바일 노출 1페이지 검사(Top 5) 완료 소요시간: {time.time() - capture_start:.2f}초")
        
        # [대표님 지시] 300위 이내 딥 서치(실시간 순위) 시작
        print(f"[스코어링 엔진] 2.6 '{target_store_name}' 300위 이내 딥 서치(실시간 순위) 시작")
        place_data = await check_place_ranking(base_keyword, kw_strings, target_store_name, target_lat=target_lat, target_lon=target_lon, fallback_placeUrl=target_placeUrl)
        place_ranking_dict = place_data.get("rankings", {})
        store_metrics_dict = place_data.get("store_metrics", {})

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
        "keywords": {
            "high": high, # 심해 키워드 유니버스 전체 노출 (15개 단위 청킹 도입으로 단일 IP 방화벽 문제 해소)
            "mid": mid,
            "low": low 
        },
        "store_metrics": store_metrics_dict
    }
