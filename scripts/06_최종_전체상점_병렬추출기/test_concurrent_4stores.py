import asyncio
import aiohttp
import time
import json

API_URL = "http://localhost:8000/api/store/discover-keywords"

# 4개의 상점 페이로드 준비 (이미지에 나온 4가지 실제 상점들)
TEST_PAYLOADS = [
    {
        "keyword": "연산동 쪽갈비",
        "target_store_name": "박복순 쪽갈비 연산동본점",
        "lat": 35.1795543,
        "lon": 129.0756416  # 부산시청 근처 좌표 표본
    },
    {
        "keyword": "부산 다대포 횟집", 
        "target_store_name": "남해회관",
        "lat": 35.0485609,
        "lon": 128.9664531
    },
    {
        "keyword": "서면 디저트카페",
        "target_store_name": "무토",
        "lat": 35.1530262,
        "lon": 129.0596328
    },
    {
        "keyword": "부산진구 카페",
        "target_store_name": "이제여기카페",
        "lat": 35.1631139,
        "lon": 129.065586
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
                print(f"✅ [{index}번 성공] 상점 '{payload['target_store_name']}' 추출 성공! (소요 시간: {elapsed:.2f}초)")
                return {"index": index, "status": "success", "elapsed": elapsed}
            else:
                print(f"❌ [{index}번 실패] 상점 '{payload['target_store_name']}' 에러 반환. 상태코드: {response.status}")
                print(result)
                return {"index": index, "status": "failed", "elapsed": elapsed}
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"💥 [{index}번 타임아웃/에러] 상점 '{payload['target_store_name']}' 예외 발생: {str(e)} (소요 시간: {elapsed:.2f}초)")
        return {"index": index, "status": "error", "error": str(e), "elapsed": elapsed}

async def run_stress_test():
    print("🔥 [TDD] 대시보드 내 4개 상점 동시접속(발굴 시작) 스트레스 테스트 기동 🔥")
    print(f"지연 목표: 네이버 WAF 강제 차단(429) 없이 {len(TEST_PAYLOADS)}개의 병렬 요청을 스무스하게 소화하는가?")
    print("-------------------------------------------------------------------------")
    
    start_time = time.time()
    async with aiohttp.ClientSession() as session:
        # 4개의 상점을 정확하게 동시에 POST 발사 (Client가 브라우저 새탭 4개를 띄워버린 상황과 동일)
        tasks = [call_api(session, payload, i+1) for i, payload in enumerate(TEST_PAYLOADS)]
        results = await asyncio.gather(*tasks)
    
    total_time = time.time() - start_time
    print("-------------------------------------------------------------------------")
    print("🏁 전체 테스트 완료!")
    print(f"⏱️ 총 소요 시간: {total_time:.2f}초")
    
    success_count = sum(1 for r in results if r["status"] == "success")
    print(f"📊 최종 평가: {len(TEST_PAYLOADS)}개 중 {success_count}개 성공")
    if success_count == len(TEST_PAYLOADS):
        print("🏆 완벽하게 IP 차단(429) 대기열 붕괴를 극복했습니다!")
    else:
        print("⚠️ 일부 요청이 실패하거나 타임아웃 되었습니다.")

if __name__ == "__main__":
    asyncio.run(run_stress_test())
