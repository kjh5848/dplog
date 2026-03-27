import asyncio
from datetime import datetime
import sqlite3
from database import DB_PATH, log_rank
from full_list_extractor_8_threads import run_engine

async def run_scheduled_extraction():
    """
    1. tracked_keywords 테이블에 있는 모든 키워드를 수집해옵니다.
    2. run_engine에 묶어서 넘깁니다. (병렬 수집)
    3. 결과에서 내 상점(target_stores)이 있으면 순위를 업데이트, 없으면 rank=0으로 기록합니다.
    """
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 예약 랭킹 스크래핑 시작...")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 내 상점 리스트
    cursor.execute("SELECT * FROM target_stores")
    stores = [dict(row) for row in cursor.fetchall()]
    
    # 추적할 키워드 리스트
    cursor.execute("SELECT * FROM tracked_keywords WHERE is_active = 1")
    keywords_db = [dict(row) for row in cursor.fetchall()]
    
    conn.close()

    if not stores or not keywords_db:
        print("[Scheduler] 타겟 상점 또는 키워드가 없습니다. 종료합니다.")
        return

    # 유니크한 키워드만 뽑아 병렬 엔진에 인가
    unique_keywords = list(set([k['keyword'] for k in keywords_db]))
    
    # 첫 번째 대표 상점의 좌표를 사용하거나 부산 기본 중심 좌표 사용
    target_lat = sorted([s for s in stores if s['lat']], key=lambda x: x['id'])[0]['lat'] if [s for s in stores if s['lat']] else 35.1631139
    target_lon = sorted([s for s in stores if s['lon']], key=lambda x: x['id'])[0]['lon'] if [s for s in stores if s['lon']] else 129.1586925

    print(f"[Scheduler] 총 {len(unique_keywords)}개 키워드 대상 8스레드 병렬 스크랩핑 작동")
    
    # 네이버 플레이스 병렬 스크래핑 코어 엔진 구동
    try:
        all_results = await run_engine(
            keywords_list=unique_keywords,
            concurrency=8,
            target_lat=target_lat,
            target_lon=target_lon
        )
    except Exception as e:
        print(f"[Scheduler] 엔진 에러 발생: {e}")
        return
        
    print(f"[Scheduler] 획득 완료. 총 {len(all_results)}개의 노출 상점 확보. 내 상점 매치 검사 중...")
    
    # DB 기록을 위한 2중 루프: 키워드마다 타겟 상점이 있는지 매치업
    for kw_db in keywords_db:
        kw = kw_db['keyword']
        store_id = kw_db['store_id']
        
        # store_id에 대응되는 상호명 가져오기
        target_store_name = next((s['name'] for s in stores if s['id'] == store_id), None)
        if not target_store_name:
            continue
            
        # all_results 필터링 (해당 키워드의 결과만)
        results_for_kw = [r for r in all_results if r['키워드'] == kw]
        
        # 내 상점이 리스트 객체 내에 존재하는지 검색 (광고와 자연노출 분리)
        found_organic_rank = 0
        found_ad_rank = 0
        
        # 이름 기반 완전 매칭 또는 부분 매칭 (완전 일치를 기본으로 함)
        for r in results_for_kw:
            if target_store_name in r['상호명']: 
                if "Y" in r.get('광고여부', "N").upper():
                    if found_ad_rank == 0:
                        found_ad_rank = r['순위']
                else:
                    if found_organic_rank == 0:
                        found_organic_rank = r['순위']
                
        # SQLite 적재 로직 호출
        # 1. 자연노출(Organic)은 무조건 기록 (0위더라도 기록되어야 차트가 단절됨 설정 가능)
        log_rank(keyword_id=kw_db['id'], rank=found_organic_rank, is_ad=False)
        
        # 2. 광고(AD)는 존재할 때만 추가 기록
        if found_ad_rank > 0:
            log_rank(keyword_id=kw_db['id'], rank=found_ad_rank, is_ad=True)
        
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 예약 랭킹 스크래핑 적재 완료.")

if __name__ == "__main__":
    asyncio.run(run_scheduled_extraction())
