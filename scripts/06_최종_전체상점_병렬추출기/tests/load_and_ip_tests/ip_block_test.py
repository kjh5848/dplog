import asyncio
from playwright.async_api import async_playwright
import time
import urllib.parse

async def make_naver_search_request(playwright, keyword):
    browser_context = None
    try:
        browser = await playwright.chromium.launch(headless=True)
        # Using mobile user agent
        browser_context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        )
        page = await browser_context.new_page()
        
        # Navigate
        encoded_kw = urllib.parse.quote(keyword)
        url = f"https://m.place.naver.com/place/list?query={encoded_kw}"
        
        # We use strict timeout because if it gets banned, it might hang or show a captcha
        response = await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        
        status = response.status if response else 0
        content = await page.content()
        
        is_blocked = False
        block_reason = "OK"
        
        # Detect standard Anti-Bot HTTP status codes
        if status in [403, 429]:
            is_blocked = True
            block_reason = f"HTTP {status}"
        # Detect Naver CAPTCHA visually in DOM
        elif "캡차" in content or "비정상적인 검색" in content or "안전한 인터넷 환경을 위해" in content or "자동 입력 방지" in content:
            is_blocked = True
            block_reason = "CAPTCHA Detected in DOM"
            
        await asyncio.sleep(3) # Let page load a bit
        return {"status": status, "is_blocked": is_blocked, "reason": block_reason}
        
    except Exception as e:
        return {"status": 0, "is_blocked": True, "reason": f"Exception/Timeout: {str(e)[:50]}"}
    finally:
        if browser_context:
            await browser_context.browser.close()

async def run_stress_test():
    print("🛡️ [Naver Anti-Bot IP Block Threshold Test] 🛡️")
    print("Testing maximum concurrent searches from single local On-Premise IP...")
    print("Warning: Doing this might trigger a CAPTCHA ban on your office/home IP.")
    
    # We will ramp up: 5 -> 10 -> 15 -> 20 concurrent requests
    test_levels = [5, 10, 15, 20]
    
    async with async_playwright() as p:
        for workers in test_levels:
            print(f"\\n🚀 [Level {workers}] Launching {workers} concurrent Naver searches...")
            
            start_time = time.time()
            # Generate dummy keywords to avoid cache hits triggering identical behavior
            keywords = [f"부산 맛집 추천 랭킹 {workers}_{i}" for i in range(workers)]
            
            tasks = [make_naver_search_request(p, kw) for kw in keywords]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            elapsed = time.time() - start_time
            
            blocks = 0
            success = 0
            timeouts = 0
            
            for i, r in enumerate(results):
                if isinstance(r, Exception):
                    timeouts += 1
                    blocks += 1
                elif r.get("is_blocked"):
                    blocks += 1
                    print(f"  ❌ Blocked/Timeout task {i}: {r.get('reason')}")
                else:
                    success += 1
                    
            print(f"📊 [Result Level {workers}] - Finished in {elapsed:.1f}s")
            print(f"  ✅ Success: {success}")
            print(f"  🚫 IP Blocked/CAPTCHA/Timeout: {blocks} (Timeouts: {timeouts})")
            
            # Threshold: If more than 30% of requests are blocked, the IP is flagged by WAF
            if blocks >= (workers * 0.3):
                print(f"\\n⚠️ [CRITICAL WAF THRESHOLD REACHED] Naver blocked heavily at {workers} concurrent requests from this IP!")
                print("Test aborting to prevent long-term IP ban.")
                return
                
            print("Taking a 10-second breath before next level to mimic human batching...")
            await asyncio.sleep(10)
            
if __name__ == "__main__":
    asyncio.run(run_stress_test())
