import asyncio
import httpx
import time

URL = "http://localhost:8000/api/store/discover-keywords"

payloads = [
    {
        "store_id": "홍대",
        "keyword": "홍대 고기집",
        "target_store_name": "육몽"
    },
    {
        "store_id": "강남",
        "keyword": "강남역 맛집",
        "target_store_name": "땀땀"
    },
    {
        "store_id": "부산",
        "keyword": "부산진구 카페",
        "target_store_name": "이제여기카페"
    },
    {
        "store_id": "제주",
        "keyword": "제주도 흑돼지",
        "target_store_name": "숙성도" # 제주 유명 흑돼지집
    }
]

async def fetch_keywords(client, payload):
    start_time = time.time()
    print(f"[{payload['store_id']}] 요청 시작: {payload['keyword']} (타겟: {payload['target_store_name']})")
    try:
        response = await client.post(URL, json=payload, timeout=300.0) # 300초 타임아웃 
        elapsed = time.time() - start_time
        data = response.json()
        status = data.get("status")
        
        if status == "success":
            high_count = len(data.get("data", {}).get("keywords", {}).get("high", []))
            mid_count = len(data.get("data", {}).get("keywords", {}).get("mid", []))
            print(f"✅ [{payload['store_id']}] 완료! ({elapsed:.2f}초 경과) -> 고효율({high_count}개), 중효율({mid_count}개) 추출 성공")
        else:
            print(f"❌ [{payload['store_id']}] 에러 발생 ({elapsed:.2f}초 경과): {data.get('message')}")
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"💥 [{payload['store_id']}] 예외 발생 ({elapsed:.2f}초 경과): {e}")

async def main():
    print(f"🚀 총 {len(payloads)}개 상점 황금키워드 동시 발굴 테스트 시작")
    total_start = time.time()
    
    async with httpx.AsyncClient() as client:
        tasks = [fetch_keywords(client, p) for p in payloads]
        await asyncio.gather(*tasks)
        
    total_elapsed = time.time() - total_start
    print(f"🏁 전체 동시 병렬 발굴 테스트 종료 (총 소요 시간: {total_elapsed:.2f}초)")

if __name__ == "__main__":
    asyncio.run(main())
