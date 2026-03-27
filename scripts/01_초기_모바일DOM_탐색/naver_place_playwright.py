"""Playwright의 동적 렌더링을 활용하여 자바스크립트 우회를 시도한 기초 렌더링 검증 코드입니다."""

import asyncio
import json
from playwright.async_api import async_playwright
import random
import time

async def scrape_naver_place(place_id):
    url = f"https://m.place.naver.com/restaurant/{place_id}/home"
    
    print(f"[*] Initializing Playwright stealth browser for {url}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
            ]
        )
        
        user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
        
        context = await browser.new_context(
            user_agent=user_agent,
            viewport={'width': 390, 'height': 844},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            locale='ko-KR',
            timezone_id='Asia/Seoul'
        )
        
        # Bypass webdriver detection
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)
        
        page = await context.new_page()
        
        print("[*] Navigating...")
        await page.goto(url, wait_until='domcontentloaded', timeout=15000)
        print("[+] Page loaded. Waiting for network idle...")
        
        try:
            # Wait for either Apollo State or the body to render
            await page.wait_for_timeout(3000)
            
            # Fetch apollo state
            apollo_state = await page.evaluate("() => window.__APOLLO_STATE__")
            place_state = await page.evaluate("() => window.__PLACE_STATE__")
            
            if apollo_state:
                print("[+] Found __APOLLO_STATE__ via JS Evaluation!")
                with open("naver_place_apollo.json", "w", encoding="utf-8") as f:
                    json.dump(apollo_state, f, ensure_ascii=False)
            
            if place_state:
                print("[+] Found __PLACE_STATE__ via JS Evaluation!")
                with open("naver_place_state.json", "w", encoding="utf-8") as f:
                    json.dump(place_state, f, ensure_ascii=False)
                    
            # Fallback text extraction if states are missing
            if not apollo_state and not place_state:
                print("[!] States missing. Attempting DOM extraction...")
                body_text = await page.inner_text("body")
                with open("naver_body_dump.txt", "w", encoding="utf-8") as f:
                    f.write(body_text)
                    
        except Exception as e:
            print(f"[-] Execution error: {e}")
            
        await browser.close()
        print("[*] Complete.")

if __name__ == "__main__":
    asyncio.run(scrape_naver_place("37982226"))
