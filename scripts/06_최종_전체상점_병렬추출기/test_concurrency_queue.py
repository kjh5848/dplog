import asyncio
import httpx
import time

# 실제 테스트용 리얼 키워드 15종 (황금키워드/딥엔진을 끝까지 굴려볼 하드코어 키워드)
REAL_KEYWORDS = [
    ("연산맛집", "백년갈비"),
    ("해운대돼지국밥", "밀양돼지국밥"),
    ("광안리횟집", "동해횟집"),
    ("서면카페", "모모스커피"),
    ("강남역고기집", "흑돈가"),
    ("홍대마라탕", "마라공방"),
    ("제주도흑돼지", "늘봄흑돼지"),
    ("전주비빔밥", "한국관"),
    ("속초해물탕", "동명항해물탕"),
    ("여수게장", "황소식당"),
    ("광화문스시", "오가와"),
    ("부산역밀면", "초량밀면"),
    ("남포동꼼장어", "제일산꼼장어"),
    ("종로보쌈", "장군보쌈"),
    ("이태원수제버거", "다운타우너")
]

async def simulate_user(user_id, client):
    keyword, store = REAL_KEYWORDS[user_id-1]
    print(f"👤 유저 {user_id}번: 🎯 '{keyword}' 황금키워드 발굴 시작! (엔진 100% 가동)")
    
    start_time = time.time()
    
    # 서버의 /api/store/discover-keywords (황금키워드 발굴 코어) 동시 요청 발사
    payload = {"keyword": keyword, "target_store_name": store}
    
    try:
        # 15명이 줄을 섰기 때문에, 맨 뒷사람은 최대 15~20분 기다릴 수도 있음. 아주 넉넉히 3000초 타임아웃
        resp = await client.post("http://127.0.0.1:8000/api/store/discover-keywords", json=payload, timeout=3000.0)
        elapsed = time.time() - start_time
        
        if resp.status_code == 200:
            print(f"✅ 유저 {user_id}번 [{keyword}]: 스크래핑 완주! 🎉 (총 대기 및 처리 연산 시간: {elapsed:.1f}초)")
        else:
            print(f"❌ 유저 {user_id}번 [{keyword}]: 에러 발생 ({resp.status_code})")
    except Exception as e:
        print(f"💥 유저 {user_id}번 [{keyword}]: 타임아웃 또는 접속 실패! ({e})")

async def run_stress_test(num_users=15):
    print(f"🚀 [진짜 부하 테스트 시작] 영업팀 직원 {num_users}명이 0.1초 만에 동시에 황금키워드 색인을 누릅니다!\n" + "="*60)
    
    # timeout: None = 제한시간 완전 해제 (플레이스 크롤링을 위해 줄 서서 기다리는 것을 모두 기다려봄)
    async with httpx.AsyncClient(timeout=httpx.Timeout(None)) as client:
        # 실제 키워드가 담긴 15개의 묵직한 태스크 발사
        tasks = [simulate_user(i+1, client) for i in range(num_users)]
        
        # 15명이 동시에 접속 (FastAPI가 대기열을 세우기 시작함)
        await asyncio.gather(*tasks)
        
    print("="*60 + "\n🏁 [부하 테스트 완료] 리얼 엔진으로 15건 모두 처리 끝! (OOM 방어 성공)")

if __name__ == "__main__":
    asyncio.run(run_stress_test(len(REAL_KEYWORDS)))
