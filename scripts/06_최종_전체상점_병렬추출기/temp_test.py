import asyncio
from keyword_discovery_engine import discover_customer_journey

async def run_test():
    res1 = await discover_customer_journey("연산동 쪽갈비")
    print(f"연산동 쪽갈비 파생 키워드: {len(res1)}개")
    res2 = await discover_customer_journey("서면 디저트카페")
    print(f"서면 디저트카페 파생 키워드: {len(res2)}개")

if __name__ == "__main__":
    asyncio.run(run_test())
