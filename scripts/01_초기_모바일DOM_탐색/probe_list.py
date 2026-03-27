"""GraphQL 렌더링이 아닌 실제 HTML DOM 객체에서 데이터를 파싱할 수 있는지 탐침(Probe)용으로 만든 코드입니다."""

import asyncio
from playwright.async_api import async_playwright
import json

async def probe():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled'])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True
        )
        page = await context.new_page()
        await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        url = "https://m.place.naver.com/place/list?query=부산시청수제국수"
        print("Goto URL:", url)
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)
        
        # 스크롤 3회 진행
        for _ in range(3):
            await page.evaluate("window.scrollBy(0, 5000)")
            await page.wait_for_timeout(1000)
            
        html = await page.content()
        with open('scripts/probe_place_list.html', 'w', encoding='utf-8') as f:
            f.write(html)
            
        # JSON 디버프용으로도 뽑아보기
        try:
            state = await page.evaluate("window.__APOLLO_STATE__")
            with open('scripts/probe_apollo.json', 'w', encoding='utf-8') as f:
                json.dump(state, f, ensure_ascii=False, indent=2)
            print("Apollo state written.")
        except:
            print("No Apollo state found.")
            
        await browser.close()
        print("Done.")

if __name__ == "__main__":
    asyncio.run(probe())
