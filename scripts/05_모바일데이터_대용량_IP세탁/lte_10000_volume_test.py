"""10,000건의 초대형 키워드를 추출하며, IP 차단 시 비행기모드로 갱신할 때까지 스크립트를 일시정지하는 극한의 생존 테스트 코드입니다."""

import asyncio
from playwright.async_api import async_playwright
import time
import random

# 안전 마지노선 8개 (테스트 결과를 바탕으로 8개 세팅, 테더링 환경 한계 타격)
CONCURRENCY = 8
TOTAL_KEYWORDS = 10000
CHUNK_SIZE = 50

# 전역 객체
browser = None
context = None
playwright_instance = None

async def init_browser():
    global browser, context, playwright_instance
    if playwright_instance is None:
         playwright_instance = await async_playwright().start()
    if browser:
         await browser.close()
    
    # 새로운 프록시(새로운 LTE IP)를 완벽하게 타기 위해 브라우저 세션을 완전 초기화
    browser = await playwright_instance.chromium.launch(
        headless=True,
        args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
    )
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        viewport={'width': 390, 'height': 844},
        is_mobile=True, has_touch=True
    )
    return context

async def fetch_keyword(keyword, sem, search_num):
    global context
    async with sem:
        try:
            page = await context.new_page()
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            url = f"https://m.place.naver.com/place/list?query={keyword}"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2000) # DOM 렌더링 딜레이
            
            element_exists = await page.evaluate('''() => {
                let items = document.querySelectorAll('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
                return items.length;
            }''')
            return element_exists > 0
        except Exception as e:
            return False
        finally:
            await page.close()

async def run_10k_test():
    print(f"🚀 [핸드폰 테더링 전용] 10,000개 무한 스크래핑 극한 테스트")
    print(f"- 목표 키워드 수: {TOTAL_KEYWORDS}개")
    print(f"- 동시 접속(Semaphore): {CONCURRENCY} (WAF 차단 한계점 추적)")
    print("="*60)
    
    # 캐시를 무시하기 위한 랜덤화된 더미 10,000개 생성
    base_keywords = ["시청고기집", "강남역맛집", "홍대카페", "부산국밥", "제주도펜션", "성수동팝업"]
    keywords = [f"{random.choice(base_keywords)}{i:05d}" for i in range(1, TOTAL_KEYWORDS + 1)]
    
    sem = asyncio.Semaphore(CONCURRENCY)
    success_count = 0
    fail_count = 0
    consecutive_fails = 0
    
    await init_browser()
    start_time = time.time()
    
    i = 0
    while i < TOTAL_KEYWORDS:
        chunk = keywords[i:i+CHUNK_SIZE]
        tasks = [fetch_keyword(kw, sem, i+idx+1) for idx, kw in enumerate(chunk)]
        
        results = await asyncio.gather(*tasks)
        
        c_success = sum(results)
        c_fail = len(results) - c_success
        
        elapsed = time.time() - start_time
        print(f"✅ 진행도: [{i+len(chunk):05d} / {TOTAL_KEYWORDS}] | 청크 성공: {c_success}건 | 청크 실패: {c_fail}건 | 누적 시간: {elapsed:.1f}초")
        
        # IP 차단 감지 로직 (50개 중 성공률이 5건(10%) 미만이면 100% WAF 차단으로 간주)
        if c_success < 5:
            print("\n" + "="*60)
            print(f"🚨 [IP 차단 감지됨] '{i}번째' 키워드 구간에서 네이버 WAF 방어벽 누적 패널티 발생!!")
            print("   👉 해당 청크 성공률 추락 방어. 진행을 일시 정지합니다.")
            print("   📲 [조치법] 핸드폰 데이터의 '비행기 모드'를 켰다가 3초 뒤에 끄세요 (IP 세탁).")
            print("="*60)
            
            # 파이썬 input을 통해 사용자가 IP변경 완료할 때까지 스크립트 무한 정지
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, input, "✅ 핸드폰 IP 변경(비행기모드 토글)이 완료되면 [Enter] 키를 누르세요. 실패한 곳부터 다시 시작합니다...")
            
            print("\n🔄 [시스템] IP 변경 확인! 새로운 브라우저 세션과 아이피로 재시작합니다...")
            await init_browser()
            # 실패했던 i 번째 청크부터 다시 재시도하기 위해 i를 증가시키지 않고 루프 재실행
            consecutive_fails = 0
            continue 
            
        # 성공 시 누적카운트 합산
        success_count += c_success
        fail_count += c_fail
        
        i += CHUNK_SIZE
        await asyncio.sleep(2) # WAF 통제 회피용 숨고르기 (인간화 패턴)
        
    global playwright_instance
    if browser:
        await browser.close()
    if playwright_instance:
        await playwright_instance.stop()
        
    total_time = time.time() - start_time
    print("="*60)
    print(f"🏆 [최종 볼륨 10,000개 수집 완료]")
    print(f"- 총 소요 시간: {total_time:.1f}초 ({total_time/60:.1f}분)")
    print(f"- 전체 누적 성공: {success_count} / 누적 실패: {fail_count}")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(run_10k_test())
