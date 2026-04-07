import asyncio
import aiohttp
import time
import json

API_URL = "http://localhost:8000/api/store/discover-keywords"

TEST_PAYLOADS = [
    {
        "keyword": "연산동 쪽갈비",
        "target_store_name": "박복순 쪽갈비",
        "lat": 35.1795543,
        "lon": 129.0756416
    },
    {
        "keyword": "서면 디저트카페",
        "target_store_name": "무토",
        "lat": 35.1530262,
        "lon": 129.0596328
    }
]

async def call_api(session, payload, index):
    print(f"[{index}번 시작] 상점: {payload['target_store_name']} / 주키워드: {payload['keyword']} 🚀 요청 전송!")
    start_time = time.time()
    try:
        async with session.post(API_URL, json=payload, timeout=600) as response:
            result = await response.json()
            elapsed = time.time() - start_time
            if response.status == 200 and result.get("status") == "success":
                print(f"✅ [{index}번 성공] 상점 '{payload['target_store_name']}' 추출 완료! (소요 시간: {elapsed:.2f}초)")
                return {"index": index, "status": "success", "elapsed": elapsed}
            else:
                print(f"❌ [{index}번 실패] 상점 '{payload['target_store_name']}' 에러 반환. 상태코드: {response.status}")
                return {"index": index, "status": "failed", "elapsed": elapsed}
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"💥 [{index}번 타임아웃/에러] 상점 '{payload['target_store_name']}' 예외 발생: {str(e)} (소요 시간: {elapsed:.2f}초)")
        return {"index": index, "status": "error", "error": str(e), "elapsed": elapsed}

async def run_stress_test():
    print("🔥 2개 상점 연달아 크롤링 스트레스 테스트 기동 🔥")
    print(f"지연 목표: 네이버 WAF 강제 차단 없이 {len(TEST_PAYLOADS)}개의 상점(약 30개 키워드)을 스무스하게 소화하는가?")
    print("-------------------------------------------------------------------------")
    
    start_time = time.time()
    async with aiohttp.ClientSession() as session:
        # 2개의 상점을 동시에 발사 (단, 서버 내부의 세마포어=1 통제를 받아 순차적 대기열로 처리될 수 있음)
        tasks = [call_api(session, payload, i+1) for i, payload in enumerate(TEST_PAYLOADS)]
        results = await asyncio.gather(*tasks)
    
    total_time = time.time() - start_time
    print("-------------------------------------------------------------------------")
    print("🏁 전체 테스트 완료!")
    print(f"⏱️ 총 소요 시간: {total_time:.2f}초")

if __name__ == "__main__":
    asyncio.run(run_stress_test())
