import asyncio
from full_list_extractor_8_threads import run_engine

async def test():
    print("넓은 키워드로 테스트 시작...")
    results = await run_engine(["서면 고기집"], 1, 35.1531139, 129.1586925)
    print(f"가게 갯수: {len(results)}")

if __name__ == '__main__':
    asyncio.run(test())
