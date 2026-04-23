import asyncio
from domains.scraping.full_list_extractor import run_engine

async def run():
    res = await run_engine(["부산시청 맛집"], 1, 35.1796, 129.0756, 80, "")
    print(f"run_engine result length: {len(res)}")
    if not res:
        print("Empty array returned!")

asyncio.run(run())
