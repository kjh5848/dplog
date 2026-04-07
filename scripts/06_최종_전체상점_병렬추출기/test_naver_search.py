import httpx
import asyncio

async def search_naver_place(query):
    url = f"https://m.map.naver.com/search2/searchMore.naver?query={query}&page=1&displayCount=10"
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*'
    }
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=headers, timeout=5.0)
            print(f"Status Code: {res.status_code}")
            data = res.json()
            
            if 'result' in data and 'site' in data['result']:
                sites = data['result']['site']['list']
                for s in sites[:3]:
                    print(f"이름: {s.get('name')}, ID: {s.get('id')}, 주소: {s.get('address')}, 썸네일: {s.get('thumUrl')}")
            else:
                print("응답에 예외 형태의 구조가 포함되어 있습니다.")
                print(list(data.keys()))
                
    except Exception as e:
        print(e)

asyncio.run(search_naver_place("연산동 부산상회"))
