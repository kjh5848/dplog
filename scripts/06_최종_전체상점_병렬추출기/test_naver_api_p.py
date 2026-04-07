import httpx
import asyncio

async def test():
    query = "이제여기카페"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    url = f"https://map.naver.com/p/api/search/allSearch?query={query}&type=all"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        print("Status", res.status_code)
        try:
            data = res.json()
            if "result" in data and "place" in data["result"] and "list" in data["result"]["place"]:
                print("Found", len(data["result"]["place"]["list"]))
                for row in data["result"]["place"]["list"][:1]:
                    print(row["id"], row["name"])
            else:
                print("No list")
        except:
            print("parse error", res.text[:200])

asyncio.run(test())
