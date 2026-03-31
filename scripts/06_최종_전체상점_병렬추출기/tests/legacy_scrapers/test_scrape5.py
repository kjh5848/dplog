import asyncio
from playwright.async_api import async_playwright

async def test():
    print("X, Y 파라미터 제외한 순수 유기적 검색 테스트 시작...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True
        )
        page = await context.new_page()
        url = f"https://m.place.naver.com/place/list?query=전포동 이자카야"
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)
        
        # 무한 스크롤 다운
        prev_count = 0
        retries = 0
        for i in range(50):
            await page.evaluate("window.scrollBy(0, 5000)")
            await page.wait_for_timeout(1000)
            
            count = await page.evaluate("document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL').length")
            if count == prev_count:
                retries += 1
                if retries >= 3:
                    print("바닥 도달!")
                    break
            else:
                retries = 0
                prev_count = count
                
        print(f"최종 가게 갯수: {count}")
        
        # 이카 전포본점 찾기
        html = await page.content()
        if "이카" in html:
            print("이카 전포본점이 HTML 내에 존재합니다!!!!")
        else:
            print("이카 전포본점이 여전히 없습니다.")
            
        await browser.close()
        
if __name__ == '__main__':
    asyncio.run(test())
