"""비동기 병렬 접속(Concurrency)이 특정 개수를 넘어갈 때 서버에서 어떻게 반응하는지 관찰하는 실험 코드입니다."""

import asyncio
from playwright.async_api import async_playwright
import time

URLS = [
    "https://m.place.naver.com/restaurant/1877463431/home",
    "https://m.place.naver.com/restaurant/20299805/home",
    "https://m.place.naver.com/restaurant/1313128454/home",
    "https://m.place.naver.com/restaurant/1091463847/home",
    "https://m.place.naver.com/restaurant/31979185/home",
    "https://m.place.naver.com/restaurant/1599872670/home",
    "https://m.place.naver.com/restaurant/920211968/home",
    "https://m.place.naver.com/restaurant/37250414/home",
    "https://m.place.naver.com/restaurant/35105073/home",
    "https://m.place.naver.com/restaurant/1558444032/home",
    "https://m.place.naver.com/restaurant/1241620306/home",
    "https://m.place.naver.com/restaurant/1318796182/home",
    "https://m.place.naver.com/restaurant/1175104888/home"
]

async def scrape_single(p, url, idx):
    browser = await p.chromium.launch(
        headless=True,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--ignore-certificate-errors'
        ]
    )
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        viewport={'width': 390, 'height': 844},
        is_mobile=True,
        has_touch=True
    )
    
    await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
    page = await context.new_page()
    
    start = time.time()
    try:
        print(f"[{idx:02d}] 🚀 Navigating to {url.split('/restaurant/')[1].split('/')[0]}")
        res = await page.goto(url, wait_until='domcontentloaded', timeout=25000)
        await page.wait_for_timeout(2500) # Give React time to render
        
        apollo_state = await page.evaluate("() => window.__APOLLO_STATE__")
        
        status = "✅ SUCCESS" if apollo_state else "❌ BLOCKED (No Apollo State)"
        
        # Check for CAPTCHA
        html = await page.content()
        if "ncaptcha" in html.lower() or "캡차" in html:
            status = "🚫 BLOCKED (CAPTCHA Detected)"
            
        print(f"[{idx:02d}] {status} in {time.time()-start:.2f}s")
        return {"id": idx, "url": url, "status": status}
    except Exception as e:
        print(f"[{idx:02d}] ⚠️ FAILED: {str(e)}")
        return {"id": idx, "url": url, "status": f"ERROR: {str(e)[:30]}"}
    finally:
        await browser.close()

async def main():
    print(f"[*] Starting 극단적 병렬 스트레스 테스트 (Parallel IP Blocking Test)")
    print(f"[*] Total Targets: {len(URLS)} places concurrently")
    start_time = time.time()
    
    async with async_playwright() as p:
        tasks = [scrape_single(p, url, i+1) for i, url in enumerate(URLS)]
        results = await asyncio.gather(*tasks)
        
    print("\\n===========================================")
    print("                TEST RESULTS              ")
    print("===========================================")
    success_count = 0
    blocked_count = 0
    
    for r in sorted(results, key=lambda x: x['id']):
        print(f"ID {r['id']:02d} | {r['status']}")
        if "SUCCESS" in r['status']:
            success_count += 1
        else:
            blocked_count += 1
            
    print("===========================================")
    print(f"Total Time : {time.time()-start_time:.2f}s")
    print(f"SUCCESS    : {success_count} / {len(URLS)}")
    print(f"BLOCKED    : {blocked_count} / {len(URLS)}")
    
    if blocked_count > 0:
        print("\\n🚨 네이버 방어 시스템(Rate Limiter) 작동 감지됨!")
    else:
        print("\\n🔥 네이버 방어벽 완벽 우회 (All Clear!)")

if __name__ == '__main__':
    asyncio.run(main())
