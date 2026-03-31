import asyncio
from playwright.async_api import async_playwright

async def test():
    print("스크롤 버그 픽스 테스트 시작...")
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
        
        # IntersectionObserver 우회를 위해 화면 높이(800px)만큼씩 부드럽게 여러 번 내림
        prev_count = 0
        retries = 0
        total_scrolls = 0
        
        for i in range(200):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await page.wait_for_timeout(300) # 더 짧고 잦은 대기
            total_scrolls += 1
            
            # 5회 스크롤마다 갯수 측정
            if i % 5 == 0:
                await page.wait_for_timeout(700) # 로딩 대기
                count = await page.evaluate("document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL').length")
                print(f"{total_scrolls}회 스크롤: 로딩된 항목 수 = {count}")
                
                if count == prev_count:
                    retries += 1
                    if retries >= 3:
                        print("3연속 항목 수 그대로. 휴식 후 강한 스크롤 시도...")
                        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        await page.wait_for_timeout(2000)
                        count = await page.evaluate("document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL').length")
                        if count == prev_count:
                            print("진짜 바닥 도달!")
                            break
                        else:
                            retries = 0
                else:
                    retries = 0
                prev_count = count
            
        await browser.close()
        
if __name__ == '__main__':
    asyncio.run(test())
