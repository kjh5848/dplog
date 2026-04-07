import asyncio
from playwright.async_api import async_playwright
import time
import random

USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"

# 4개 상점에 대해 각 15개씩 딥 스크랩용 키워드(총 60개) 준비
TEST_PAYLOADS = [
    {"target": "박복순 쪽갈비", "keywords": ["연산동 쪽갈비", "연산동 맛집", "연산동 고기집", "연산동 회식", "연산동 데이트", "연산역 맛집", "연산역 고기집", "연산동 쪽갈비 맛집", "연산동 밥집", "연산동 삼겹살", "연산동 술집", "부산 쪽갈비", "연제구 맛집", "연산동 단체모임", "연제구 고기집"], "lat": 35.1795, "lon": 129.0756},
    {"target": "남해회관", "keywords": ["부산 다대포 횟집", "다대포 맛집", "다대포해수욕장 맛집", "다대포 밥집", "다대포 술집", "다대포 데이트", "다대포해수욕장 횟집", "다대포 가볼만한곳", "사하구 횟집", "다대포 회식", "사하구 맛집", "다대포 회센터", "부산 사하구 맛집", "다대포 로컬 맛집", "부산 다대포 맛집"], "lat": 35.0485, "lon": 128.9664},
    {"target": "무토", "keywords": ["서면 디저트카페", "서면 카페", "서면 핫플", "서면 데이트", "전포 카페거리", "전포동 카페", "서면 디저트 맛집", "서면 예쁜 카페", "전포 카페", "서면 케이크", "서면 커피", "서면 감성카페", "전포 디저트", "서면 가볼만한곳", "부산 서면 카페"], "lat": 35.1530, "lon": 129.0596},
    {"target": "이제여기카페", "keywords": ["부산진구 카페", "부산진구 맛집", "부전동 카페", "부전동 맛집", "서면역 카페", "부산 시민공원 카페", "부산 시민공원 맛집", "부산진구 디저트", "부전역 카페", "서면 데이트코스", "부산진구 데이트", "부전동 디저트", "전포 카페거리", "부산 서면 카페", "서면 감성카페"], "lat": 35.1631, "lon": 129.0655}
]

async def fetch_keyword_rank(keyword, target_store, context, sem, lat, lon):
    async with sem:
        # 통제된 지연 (Jitter)
        await asyncio.sleep(random.uniform(0.5, 1.5))
        
        # [핵심] 기존 브라우저 컨텍스트의 '새 탭(Page)'만 열어서 진입 (세션/쿠키/기종 공유)
        page = await context.new_page()
        try:
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            url = f"https://m.place.naver.com/place/list?query={keyword}"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2500)
            
            # WAF 차단 여부 1차 체크
            page_text = await page.content()
            if "서비스 이용이 제한되었습니다" in page_text or "과도한 접근" in page_text or "캡차" in page_text or "captcha" in page_text.lower():
                return "BLOCKED_INITIAL"

            prev_count = 0
            retries = 0
            found = False
            for step in range(80):
                await page.evaluate("window.scrollBy(0, 5000)")
                await page.wait_for_timeout(800) # 스크롤 및 네트워크 대기
                
                # 차단 여부 지속 감시 (스크롤 중 429 에러 팝업 등)
                page_text_temp = await page.content()
                if "서비스 이용이 제한되었습니다" in page_text_temp or "과도한 접근" in page_text_temp:
                    return f"BLOCKED_DURING_SCROLL (Step {step})"
                
                is_found = await page.evaluate(f"(name) => document.body.innerText.includes('{target_store}')")
                if is_found:
                    found = True
                    break
                    
                curr_count = await page.evaluate("document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL').length")
                if curr_count == prev_count:
                    retries += 1
                    if retries >= 3:
                        break
                else:
                    retries = 0
                    prev_count = curr_count
                    
            return "FOUND" if found else "NOT_FOUND(End of list)"
            
        except Exception as e:
            return f"ERROR: {str(e)}"
        finally:
            await page.close()

async def run_v2_test():
    print("🚀 [V2 Session-Tab 재사용 모델] 4개 상점(총 60개 키워드) 스트레스 한계 돌파 테스트")
    print("원리: 단일 브라우저 컨텍스트(Session NID_SES 공유) 베이스에서 탭(Tab)만 열었다 닫으며 60번 검사")
    print("목표: IP 밴(429)이 아닌 쿠키/계정 밴(Captcha) 발생 여부 최우선 검증\\n")
    
    sem = asyncio.Semaphore(2) # 동시접속 2 유지 (기존 방어율 성공 수치)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled', '--no-sandbox'])
        
        # [핵심] 1개의 단일 고정 컨텍스트 (최초 1회만 생성)
        context = await browser.new_context(
            user_agent=USER_AGENT,
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True,
            geolocation={'latitude': 35.15, 'longitude': 129.05},
            permissions=['geolocation']
        )
        
        start_time = time.time()
        
        for store in TEST_PAYLOADS:
            print(f"\\n🛒 [상점 {TEST_PAYLOADS.index(store)+1}/4] 타겟: {store['target']} (키워드 15개 딥서치 시작)")
            
            # 동시성 2개씩 순차 처리
            for i in range(0, len(store['keywords']), 2):
                chunk = store['keywords'][i:i+2]
                tasks = [fetch_keyword_rank(kw, store['target'], context, sem, store['lat'], store['lon']) for kw in chunk]
                
                results = await asyncio.gather(*tasks)
                
                for kw, res in zip(chunk, results):
                    if "BLOCKED" in res:
                        print(f"  ❌ '{kw}' 검사 중 네이버 봇 필터망 적발!! >> {res}")
                    else:
                        print(f"  ✅ '{kw}' 통과 ({res})")
            
            # 상점 단위 딜레이
            print(f"⏳ 상점 변경 전 3초 대기...")
            await asyncio.sleep(3)
            
        await context.close()
        await browser.close()
        
    print(f"\\n🏁 테스트 끝 (소요 시간: {time.time() - start_time:.1f}초)")

if __name__ == '__main__':
    asyncio.run(run_v2_test())
