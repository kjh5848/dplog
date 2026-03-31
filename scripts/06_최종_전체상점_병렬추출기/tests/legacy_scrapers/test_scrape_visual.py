import asyncio
from playwright.async_api import async_playwright

async def test():
    print("디버깅 수집 테스트 시작...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True
        )
        page = await context.new_page()
        url = f"https://m.place.naver.com/place/list?query=전포동 이자카야&x=129.1586925&y=35.1631139"
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)
        
        # 스크롤 동작 수행
        for i in range(15):
            await page.evaluate("window.scrollBy(0, 3000)")
            await page.wait_for_timeout(800)
            
        print("스크롤 완료, 스크린샷 캡처 중...")
        await page.screenshot(path="/tmp/naver_map_bottom.png", full_page=False)
        
        count = await page.evaluate("document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL').length")
        print(f"최종 항목 수: {count}")
        
        await browser.close()

asyncio.run(test())
