import asyncio
from playwright.async_api import async_playwright
import time

async def search_naver_place(query):
    print(f"Searching: {query}")
    start = time.time()
    results = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 네이버 모바일 지도 검색 결과 URL
        # 모바일 버전(m.map.naver.com)이 구조가 훨씬 단순하다
        url = f"https://m.map.naver.com/search2/search.naver?query={query}&sm=hty&style=v5"
        
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
        )
        page = await context.new_page()
        
        try:
            await page.goto(url, wait_until="networkidle", timeout=10000)
            
            # 목록 컨테이너 대기 - _search_list_6a78n_1 등 난독화 클래스가 많지만, a 태그 위주로 확인
            # 좀 더 기다림
            await page.wait_for_timeout(1000)
            
            # 여기서 html 을 추출하고 BS4로 파싱하는것이 빠르다
            html = await page.content()
            
            from bs4 import BeautifulSoup
            import re
            soup = BeautifulSoup(html, 'html.parser')
            
            # 네이버 모바일 지도는 Vue.js 나 React.js 로 구동됨
            # window.__INITIAL_STATE__ 같은 데이터가 있는지 확인
            state_match = re.search(r'window\.__INITIAL_STATE__\s*=\s*(.*?});', html)
            if state_match:
                import json
                try:
                    state_data = json.loads(state_match.group(1))
                    print("Found __INITIAL_STATE__")
                    # 추출 로직 작성 (차후 구현)
                except:
                    pass
                    
            # a 태그에서 장소 ID 뽑기
            links = soup.select('a[href*="/place/"]')
            seen = set()
            
            for a in links:
                href = a.get('href')
                match = re.search(r'/place/(\d+)', href)
                if match:
                    pid = match.group(1)
                    if pid in seen: continue
                    seen.add(pid)
                    
                    # 주변 텍스트로 이름 추출 (안전하지 않으므로 대체안 필요. 추후 로직 구현전 프린트만)
                    text = a.text.strip()
                    if text and "리뷰" not in text:
                        results.append({"id": pid, "name": text})
            
        except Exception as e:
            print(f"Error {e}")
        finally:
            await browser.close()
            
    print(f"Elapsed: {time.time()-start}s. Found {len(results)} items")
    for r in results:
        print(r)

asyncio.run(search_naver_place("이제여기카페"))
