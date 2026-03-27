"""네이버 지도 모바일 버전에서 플레이스 리스트를 순회할 수 있는지 검증하는 두번째 기초 스크립트입니다."""

import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled', '--no-sandbox'])
        c = await b.new_context(user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15", viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        await c.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        page = await c.new_page()
        # The correct modern Naver Mobile Map Search URL
        await page.goto("https://m.place.naver.com/place/list?query=시청%20고기집", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        # In Naver Place List (React), the list is usually in Apollo State or easily scrapeable classes
        html = await page.content()
        titles = await page.evaluate('''() => {
            let items = document.querySelectorAll('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
            let results = [];
            items.forEach(el => {
                if(el.innerText && el.innerText.trim() !== '') results.push(el.innerText.trim());
            });
            return results;
        }''')
        apollo = await page.evaluate('''() => { return window.__APOLLO_STATE__ ? "YES" : "NO"; }''')
        print("Apollo State:", apollo)
        print("Found CSS:", titles[:15])
        await b.close()

asyncio.run(check())
