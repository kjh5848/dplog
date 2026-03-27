"""다중 접속 시 네이버 IP Block 임계점을 파악하기 위해 병렬로 타겟 상점을 추출하는 테스트용 모듈입니다."""

import asyncio
from playwright.async_api import async_playwright
import time
import json

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

# We increase the max connections by limiting concurrency to prevent local Mac RAM from crashing, 
# but we are still launching 13 browsers near-simultaneously.
# To ensure the stealth doesn't fail, we use exactly the same parameters as the successful single test.

async def scrape_single(p, url, idx):
    browser = await p.chromium.launch(
        headless=True,
        args=['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors', '--disable-infobars']
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
    place_id = url.split('/restaurant/')[1].split('/')[0]
    try:
        await page.goto(url, wait_until='domcontentloaded', timeout=30000)
        
        # We must wait for React to populate window.__APOLLO_STATE__
        await page.wait_for_timeout(3500)
        
        apollo_state = await page.evaluate("() => window.__APOLLO_STATE__")
        
        if not apollo_state:
            return {"id": idx, "place_id": place_id, "status": "BLOCKED/NO DATA", "time": time.time()-start}
            
        visitor_reviews = 0
        blog_reviews = 0
        
        for k, v in apollo_state.items():
            if k.startswith('VisitorReviewStatsResult:'):
                visitor_reviews = v.get("review", {}).get("totalCount", 0)
            if k.startswith('ROOT_QUERY.placeDetail'):
                for sub_k, sub_v in v.items():
                    if sub_k.startswith('fsasReviews') and isinstance(sub_v, dict) and 'maxItemCount' in sub_v:
                        blog_reviews = sub_v["maxItemCount"]
                        
        return {
            "id": idx, 
            "place_id": place_id, 
            "status": "SUCCESS", 
            "visitor": visitor_reviews, 
            "blog": blog_reviews, 
            "time": time.time() - start
        }
        
    except Exception as e:
        return {"id": idx, "place_id": place_id, "status": f"ERROR: {str(e)[:30]}", "time": time.time()-start}
    finally:
        await browser.close()

async def main():
    print(f"[*] 병렬 데이터 추출 시작! (총 {len(URLS)}개) - 모니터링 중...")
    start_time = time.time()
    
    async with async_playwright() as p:
        tasks = [scrape_single(p, url, i+1) for i, url in enumerate(URLS)]
        results = await asyncio.gather(*tasks)
        
    print("\\n===========================================")
    print("      🚀 13개 상점 동시 데이터 추출 결과     ")
    print("===========================================")
    
    success = 0
    for r in sorted(results, key=lambda x: x['id']):
        if r['status'] == "SUCCESS":
            # Print with thousand comma separators
            print(f"[{r['id']:02d}] 🛖 매장ID: {r['place_id']} | 💬 방문자 리뷰: {r['visitor']:,}건 | 📝 블로그 리뷰: {r['blog']:,}건 (⏱️ {r['time']:.2f}s)")
            success += 1
        else:
            print(f"[{r['id']:02d}] 🛖 매장ID: {r['place_id']} ❌ 실패: {r['status']} (⏱️ {r['time']:.2f}s)")
            
    print("===========================================")
    print(f"⏱️ 총 소요 시간 : {time.time()-start_time:.2f}초")
    print(f"🎯 추출 성공률  : {success} / {len(URLS)} ({(success/len(URLS))*100:.0f}%)")

if __name__ == '__main__':
    asyncio.run(main())
