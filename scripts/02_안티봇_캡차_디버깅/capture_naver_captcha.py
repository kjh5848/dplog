"""네이버 방화벽이 발생시키는 캡차(자동가입방지) 화면을 강제로 캡처하여 원인을 분석하기 위한 스크립트입니다."""

import asyncio
from playwright.async_api import async_playwright
import time
import os

URLS = [
    "https://m.place.naver.com/restaurant/1877463431/home",
    "https://m.place.naver.com/restaurant/20299805/home",
    "https://m.place.naver.com/restaurant/1313128454/home",
    "https://m.place.naver.com/restaurant/1091463847/home",
    "https://m.place.naver.com/restaurant/31979185/home"
]

OUTPUT_PATH = "/Users/nomadlab/.gemini/antigravity/brain/0d169046-93d5-4a7c-b718-7b1cd469ade8/naver_captcha_screenshot.png"

async def scrape_single(p, url, idx):
    browser = await p.chromium.launch(
        headless=True,
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
        await page.goto(url, wait_until='domcontentloaded', timeout=20000)
        await page.wait_for_timeout(2000)
        
        html = await page.content()
        if "ncaptcha" in html.lower() or "캡차" in html or "로봇이 아닙니다" in html:
            # We use a primitive lock file logic to avoid multiple screenshots overwriting each other simultaneously
            if not os.path.exists(OUTPUT_PATH):
                print(f"[{idx}] 🚨 CAPTCHA DETECTED! Taking screenshot...")
                await page.screenshot(path=OUTPUT_PATH, full_page=True)
            return True
    except Exception as e:
        pass
    finally:
        await browser.close()
    return False

async def main():
    if os.path.exists(OUTPUT_PATH):
        os.remove(OUTPUT_PATH)
    print("[*] Launching 5 concurrent requests to trigger the Naver Rate Limiter...")
    async with async_playwright() as p:
        tasks = [scrape_single(p, url, i) for i, url in enumerate(URLS)]
        await asyncio.gather(*tasks)
        
    if os.path.exists(OUTPUT_PATH):
        print(f"\\n✅ SUCCESS! CAPTCHA screenshot saved to: {OUTPUT_PATH}")
    else:
        print("\\n❌ FAILED to capture CAPTCHA screenshot. (Rate limiter didn't trigger or page structure changed)")

if __name__ == '__main__':
    asyncio.run(main())
