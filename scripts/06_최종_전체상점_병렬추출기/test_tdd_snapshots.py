import asyncio
import json
import sqlite3
import os
from database import DB_PATH, add_target_store, add_tracked_keyword, migrate_db
from scheduler import run_scheduled_extraction

async def run_tdd():
    print("==============================================")
    print(" 🧪 TDD 모듈: Two-Track 검색 지배력 모델 스냅샷 검증")
    print("==============================================\n")
    
    migrate_db()
    
    target_name = "이카 전포본점"
    keyword = "전포동 이자카야"
    
    print(f"2. 테스트용 타겟 점포/키워드 등록: [{target_name}] - [{keyword}]")
    store_id = add_target_store(place_id="test_mcm_total_1", name=target_name)
    kw_id = add_tracked_keyword(store_id=store_id, keyword=keyword)
    
    # TDD 대상 키워드 1개만 무조건 큐의 1순위로 뽑히도록 시간 조정
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE tracked_keywords SET next_scrape_at = '2099-01-01 00:00:00'")
    cursor.execute("UPDATE tracked_keywords SET next_scrape_at = '2000-01-01 00:00:00', is_processing = 0 WHERE id = ?", (kw_id,))
    conn.commit()
    conn.close()
    
    print("\n3. 하이브리드 엔진(Place + Main Search) 발동! 수집 수행 시작...")
    await run_scheduled_extraction()
    
    # 4. 결과 출력
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT ranking_data FROM keyword_snapshots WHERE keyword_id = ? ORDER BY scraped_at DESC LIMIT 1", (kw_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        print("\n❌ 스냅샷 생성 및 적재 실패!")
        return
        
    payload = json.loads(row['ranking_data'])
    
    # 하위 호환성을 위해 리스트(과거 버전)로 들어온 경우와 딕셔너리 구조 분기
    if isinstance(payload, list):
        place_data = payload
        search_data = []
    else:
        place_data = payload.get("place_rankings", [])
        search_data = payload.get("search_blocks", [])
        
    target_short = target_name.split()[0]  # "이카"
    
    print("\n==============================================")
    print(f"    📊 [ {keyword} ] 통합 인텔리전스 리포트")
    print("==============================================\n")
    
    print("🗺️ [Part 1. 네이버 플레이스 순위 & 주변 컨텍스트]")
    limit_rank = min(10, len(place_data))
    for r in place_data[:limit_rank]:
        is_ad = "광고_파워링크" if str(r.get('광고여부', 'N')).upper() == 'Y' else "자연 노출"
        print(f"  {r['순위']}위 | {r['상호명'][:20]:<20} | {is_ad}")
        
    print(f"\n   ... ↕️ (중략) ...\n")
    
    my_rank_idx = -1
    for idx, r in enumerate(place_data):
        if target_short in r['상호명']:
            my_rank_idx = idx
            break
            
    if my_rank_idx == -1:
        print(f"  ⚠️ 100위 내에 [{target_name}] 매장이 발견되지 않았습니다.\n")
    else:
        start_idx = max(limit_rank, my_rank_idx - 2)
        end_idx = min(len(place_data), my_rank_idx + 3)
        for i in range(start_idx, end_idx):
            r = place_data[i]
            prefix = "🎯 " if i == my_rank_idx else "   "
            is_ad = "광고_파워링크" if str(r.get('광고여부', 'N')).upper() == 'Y' else "자연 노출"
            print(f"{prefix}{r['순위']}위 | {r['상호명'][:20]:<20} | {is_ad}")


    print("\n🌐 [Part 2. 통합검색 지배력 (Search Dominance)]")
    
    # 1. 탑 5 경쟁사 상호명 유도 (지배력을 체크할 대상 리스트)
    contenders = [target_short] # 내 상점도 지배력 체크!
    for r in place_data:
        core_name = r['상호명'].split()[0]
        if core_name not in contenders:
            contenders.append(core_name)
        if len(contenders) >= 6: # 본인 포함 총 6팀
            break
            
    # 2. 텍스트 매치 알고리즘: 통합검색 지면 본문 중에 경쟁사 이름이 존재하는가?
    dominance_map = {c: [] for c in contenders}
    
    for block in search_data:
        text_blob = block.get('파싱텍스트', '')
        for c in contenders:
            # 블록 내용 중에 상호명(예: "우세", "이카")이 문자열로 들어있다면 점유율로 인정!
            if c in text_blob:
                dominance_map[c].append(f"{block.get('지면명')} (순위: {block.get('순위')}위)")

    print(f"{'매장명':<15} | {'통합검색 장악 수준'} | {'주요 노출 지면 (스마트블록 등)'}")
    print("-" * 65)
    
    for c in contenders:
        captured_blocks = dominance_map[c]
        marker = "🎯 " if c == target_short else "   "
        if not captured_blocks:
            print(f"{marker}{c[:13]:<13} | 장악력 0 블록     | (통합검색 노출 없음)")
        else:
            blocks_summary = ", ".join(captured_blocks[:3]) + (" ..." if len(captured_blocks) > 3 else "")
            print(f"{marker}{c[:13]:<13} | 👑 {len(captured_blocks)}블록 장악    | {blocks_summary}")
            
    print("\n==============================================")
    print("✅ TDD 종료: 텍스트 매칭 기반의 통합검색 장악력 측정 로직이 성공적으로 가동되었습니다.")

if __name__ == "__main__":
    asyncio.run(run_tdd())
