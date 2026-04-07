import asyncio
import aiohttp
import time
import json

API_URL = "http://localhost:8000/api/store/discover-keywords"

# 오직 1개의 상점(약 15개 키워드 파생)만 단독으로 테스트
TEST_PAYLOAD = {
    "keyword": "연산동 쪽갈비",
    "target_store_name": "박복순 쪽갈비", 
    "lat": 35.1795543,
    "lon": 129.0756416
}

async def run_single_store_test():
    print("🚀 [V1 시크릿 격리 모델] 단일 상점(1개) 스트레스 한계 테스트")
    print("원리: 매 키워드마다 새로운 브라우저 컨텍스트(시크릿 창) + 랜덤 User-Agent 할당")
    print("상황: 현재 IP(주거망) 환경에서 1개 상점(약 15~20개 키워드) 분량의 스크롤 통신이 Naver WAF(볼륨 리미트)를 자극하지 않고 통과하는가?")
    print("-" * 60)
    
    start_time = time.time()
    async with aiohttp.ClientSession() as session:
        print(f"📡 API 서버로 상점 '{TEST_PAYLOAD['target_store_name']}' 딥스크랩 요청 발사 (서버에서 약 15개 키워드 병렬 수집)")
        async with session.post(API_URL, json=TEST_PAYLOAD, timeout=600) as response:
            result = await response.json()
            elapsed = time.time() - start_time
            
            print("-" * 60)
            if response.status == 200 and result.get("status") == "success":
                data = result.get("data", [])
                print(f"✅ 추출 성공! (총 소요 시간: {elapsed:.2f}초)")
                print(f"📊 수집된 키워드 랭킹 결과:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
            else:
                print(f"❌ 추출 실패. 상태코드: {response.status}")
                print(result)

if __name__ == "__main__":
    asyncio.run(run_single_store_test())
