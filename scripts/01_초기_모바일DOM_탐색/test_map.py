"""네이버 지도 모바일 버전의 DOM 구조를 파악하기 위한 기초 탐색 스크립트입니다."""

import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox'])
        c = await b.new_context(user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15", viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        await c.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        page = await c.new_page()
        await page.goto("https://m.map.naver.com/search2/search.naver?query=시청 뒷고기", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        # In Naver Map Mobile, search results are often inside a specific list container or we can just grab all span chunks
        html = await page.content()
        titles = await page.evaluate('''() => {
            // m.map.naver.com React/Vue DOM elements
            let items = document.querySelectorAll('.item_title, .title, .place_bluelink, .YwYLL, strong.name, span.name, ._title');
            let results = [];
            items.forEach(el => {
                if(el.innerText && el.innerText.trim() !== '') results.push(el.innerText.trim());
            });
            // Try Apollo Extract directly
            if (window.__INITIAL_STATE__) return "Has INITIAL_STATE";
            if (window.__NUXT__) return "Has NUXT";
            return results.slice(0, 10);
        }''')
        print("Found:", titles)
        await b.close()

asyncio.run(check())
