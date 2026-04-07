import httpx
import asyncio

async def test():
    query = "이제여기카페"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://m.map.naver.com/',
        'Accept': 'application/json, text/plain, */*'
    }
    
    # m.map API
    url_m = f"https://m.map.naver.com/search2/searchMore.naver?query={query}&page=1"
    async with httpx.AsyncClient() as client:
        res2 = await client.get(url_m, headers=headers)
        print("\n--- MOBILE STATUS ---")
        print(res2.status_code)
        if res2.status_code == 200:
            print(res2.text[:200])

asyncio.run(test())
