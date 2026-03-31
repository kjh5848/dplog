import asyncio
import random
import json
from datetime import datetime, timedelta
from database import DB_PATH, log_rank, checkout_keywords_for_scraping, complete_keyword_scrape, unlock_keyword, log_keyword_snapshot
from full_list_extractor_8_threads import run_engine
from main_search_scanner import run_search_engine

async def run_scheduled_extraction():
    """
    1. 데이터베이스 큐에서 수집 시간(next_scrape_at)이 도래한 키워드들을 최대 15개 묶음(Batch)으로 가져오며 Lock을 겁니다.
    2. run_engine(8-Thread 브라우저 풀)에 인가하여 단일 세션에서 고속 병렬 수집합니다.
    3. 전체 1~100위 결과(배열)를 JSON 텍스트 스냅샷으로 영구 보존합니다.
    4. 내 상점(target_stores)의 구좌별 순위를 필터링하여 기존처럼 rank_history에 차트용으로 남깁니다.
    5. 완료된 키워드에 [현재시간 + (5h 50m ~ 6h) 사이의 독립적 랜덤 딜레이]를 배정하여 락을 풀고 다음 스케줄을 잡습니다.
    """
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🤖 8-Thread 스케줄러 큐 감시 중...")

    # 1. 대상 키워드 최대 15개 Chunk 도출 및 Lock 획득 (is_processing = 1)
    keywords_batch = checkout_keywords_for_scraping(limit=15)
    
    if not keywords_batch:
        print("[Scheduler] 🛌 대기열에 도래한 키워드가 없습니다. 딥슬립합니다.")
        return
        
    unique_keywords_to_scrape = list(set([k['keyword'] for k in keywords_batch]))
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🔥 총 {len(keywords_batch)}개의 대상 키워드 발견! 8-Thread 브라우저 풀 가동!")
    
    # 2. 핵심 수집 엔진 구동 (전국 공통/부산 기준 좌표 설정. 향후 상점 좌표 기반으로 동적 할당 가능)
    target_lat = 35.1631139
    target_lon = 129.1586925
    
    try:
        print("[Scheduler] ⚙️ Engine A: 플레이스 순위 스크래핑 시작...")
        all_place_results = await run_engine(
            keywords_list=unique_keywords_to_scrape,
            concurrency=8,
            target_lat=target_lat,
            target_lon=target_lon
        )
        
        print("[Scheduler] ⚙️ Engine B: 통합검색 스마트블록/파워링크 스크래핑 시작...")
        all_search_results = await run_search_engine(
            keywords_list=unique_keywords_to_scrape,
            concurrency=8
        )
    except Exception as e:
        print(f"[Scheduler] 🚨 런타임 수집 에러 발생! 락(Lock)을 다시 해제하여 큐로 돌려놓습니다: {e}")
        for kw in keywords_batch:
            unlock_keyword(kw['keyword_id'])
        return

    # 3. 데이터 적재 및 JSON 스냅샷 저장
    for kw_db in keywords_batch:
        kw = kw_db['keyword']
        kw_id = kw_db['keyword_id']
        target_store_name = kw_db['target_store_name']
        
        # 각각의 결과물 분리
        place_data = [r for r in all_place_results if r['키워드'] == kw]
        search_data = [r for r in all_search_results if r['키워드'] == kw]
        
        if not place_data and not search_data:
            print(f"[Scheduler] ⚠️ '{kw}' 키워드 수집 결과 전혀 없음. 1시간 뒤 재도전하도록 후방 스케줄링.")
            next_scrape = datetime.now() + timedelta(hours=1)
            complete_keyword_scrape(kw_id, next_scrape)
            continue
            
        # ✅ 타임머신 핵심 로직 -> 하이브리드 JSON 스냅샷 구성
        payload = {
            "place_rankings": place_data,
            "search_blocks": search_data
        }
        snapshot_json = json.dumps(payload, ensure_ascii=False)
        log_keyword_snapshot(kw_id, snapshot_json)
        
        # ✅ 기존 호환 차트 로직 -> 100위 랭킹 안에서 내 가게(target_store_name) 순위 파악
        found_organic_rank = 0
        found_ad_rank = 0
        
        if target_store_name:
            # 플레이스 지도 기준(Engine A)에서만 차트 순위를 잡습니다
            for r in place_data:
                if target_store_name in r['상호명']: 
                    if "Y" in r.get('광고여부', "N").upper(): # 광고(파워링크 등) 구좌 매칭
                        if found_ad_rank == 0:
                            found_ad_rank = r['순위']
                    else: # 스마트블록 / 플레이스 등 자연노출 매칭
                        if found_organic_rank == 0:
                            found_organic_rank = r['순위']
                            
            # [DB 적재] 자연노출은 차트 유지보수를 위해 노출 안됨(0위)이더라도 무조건 박제
            log_rank(keyword_id=kw_id, rank=found_organic_rank, is_ad=False)
            # 광고노출은 비용을 냈을 경우(0위 초과)에만 차트에 점 찍힘
            if found_ad_rank > 0:
                log_rank(keyword_id=kw_id, rank=found_ad_rank, is_ad=True)
                
        # 4. Anti-Bot 하이라이트 -> 다음 수집 시간 난수 지터 부여 후 락 해제 완료
        jitter_minutes = random.randint(350, 360) # 350~360분 (5시간 50분 ~ 6시간)
        jitter_seconds = random.randint(0, 59)
        next_scrape = datetime.now() + timedelta(minutes=jitter_minutes, seconds=jitter_seconds)
        complete_keyword_scrape(kw_id, next_scrape)
        
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🎉 {len(keywords_batch)}건 1회차 Batch 수집 완수. 적용 딜레이: ~6시간.")

if __name__ == "__main__":
    asyncio.run(run_scheduled_extraction())
