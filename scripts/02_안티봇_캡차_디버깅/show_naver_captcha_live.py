"""Headless 옵션을 끄고 라이브 화면을 띄워 캡차 발생 순간을 눈으로 모니터링하기 위한 도구입니다."""

import asyncio
from playwright.async_api import async_playwright
import time

URLS = [
    "https://m.place.naver.com/restaurant/1877463431/home",
    "https://m.place.naver.com/restaurant/20299805/home",
    "https://m.place.naver.com/restaurant/1313128454/home",
    "https://m.place.naver.com/restaurant/1091463847/home",
    "https://m.place.naver.com/restaurant/31979185/home"
]

async def scrape_single(p, url, idx):
    # headless=False -> 모니터 화면에 브라우저를 직접 띄웁니다!
    browser = await p.chromium.launch(
        headless=False,
        args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
    )
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        viewport={'width': 390, 'height': 844},
        is_mobile=True,
        has_touch=True
    )
    
    await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
    page = await context.new_page()
    
    try:
        print(f"[{idx}] 🚀 브라우저 창 오픈 및 접속 시도: {url.split('/restaurant/')[1].split('/')[0]}")
        await page.goto(url, wait_until='domcontentloaded', timeout=20000)
        
        # 대표님이 화면을 직접 눈으로 보실 수 있도록 15초간 브라우저를 끄지 않고 유지합니다.
        await page.wait_for_timeout(15000)
    except Exception as e:
        print(f"[{idx}] Error: {e}")
    finally:
        await browser.close()

async def main():
    print("[*] 5개의 브라우저를 화면에 시각적으로 띄웁니다! 모니터를 확인해주세요.")
    async with async_playwright() as p:
        tasks = [scrape_single(p, url, i+1) for i, url in enumerate(URLS)]
        await asyncio.gather(*tasks)

if __name__ == '__main__':
    asyncio.run(main())
