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
        
        # Check scroll vs height
        prev_count = 0
        for i in range(40):
            # Using document.body.scrollHeight to scroll all the way down
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(1000)
            
            count = await page.evaluate("document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL').length")
            print(f"스크롤 {i}회: 로딩된 항목 수 = {count}")
            
            # Check if there is a '더보기' button
            more_btn = await page.evaluate("document.querySelector('a._2-s5Z') || document.querySelector('button.fvwqf') ? true : false")
            if more_btn:
                print("더보기 버튼 감지됨!")
                
            if count == prev_count:
                print("항목 수가 증가하지 않음. 바닥에 도달했거나 로딩이 멈춤.")
                break
            prev_count = count
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
