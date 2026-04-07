import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # headless=True 만으로는 봇 차단에 걸릴 수 있으므로 세팅 추가
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = await context.new_page()
        
        # 네이버 플레이스 검색 최신 URL
        query = "이제여기카페"
        url = f"https://map.naver.com/p/search/{query}"
        
        try:
            print("Going to:", url)
            await page.goto(url, wait_until="networkidle", timeout=15000)
            
            # iframe searchIframe 로드 대기
            frame_element = await page.wait_for_selector('iframe#searchIframe', timeout=10000)
            frame = await frame_element.content_frame()
            
            # 검색 결과 목록 중 첫번째 나올때까지 대기 (ex: .place_bluelink, .tzwk0 등)
            await frame.wait_for_selector('.place_bluelink', timeout=10000)
            
            # 목록 파싱
            links = await frame.query_selector_all('.place_bluelink')
            
            with open("pw_results.txt", "w", encoding="utf-8") as f:
                f.write(f"Found {len(links)} links\n")
                
                for a in links:
                    name = await a.inner_text()
                    f.write(f"- {name}\n")
                    
                    # 상위 li 요소를 찾아서 category, address 등을 빼올 수 있음
                    li = await a.evaluate_handle('el => el.closest("li")')
                    if li:
                        # 주소나 분류 영역을 텍스트로 전부 덤프
                        li_text = await li.inner_text()
                        f.write(f"  {li_text.replace(chr(10), ' | ')}\n")
            
            print("Done! check pw_results.txt")
        except Exception as e:
            print(f"Playwright error: {e}")
            with open("pw_results.txt", "w", encoding="utf-8") as f:
                f.write(f"Playwright error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
