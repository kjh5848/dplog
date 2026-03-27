"""핸드폰 테더링(LTE/5G) 환경에서 1,000건의 대규모 키워드를 연속으로 찔러 IP 차단 빈도를 측정하는 스크립트입니다."""

import asyncio
from playwright.async_api import async_playwright
import time
import random

async def fetch_keyword(keyword, context, semaphore, search_num):
    async with semaphore:
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
        except:
            return False
        finally:
            await page.close()

async def run_volume_test():
    total_keywords = 1000
    concurrency_limit = 8
    
    print(f"🚀 [핸드폰 테더링 전용] 1,000개 무한 요청 볼륨(Volume) 데스매치 가동")
    print(f"- 목표 키워드 수: {total_keywords}개 (가상 파생 키워드)")
    print(f"- 동시 접속(Semaphore): {concurrency_limit} (안전 마지노선 8 세팅)")
    print("="*60)
    
    # 1. 네이버 캐시를 무력화하기 위한 난수 기반 1000개 키워드 생성
    base_keywords = ["시청고기집", "강남역맛집", "홍대카페", "부산국밥", "이태원라운지", "수원갈비"]
    keywords = [f"{random.choice(base_keywords)} {i}{random.randint(10,99)}" for i in range(1, total_keywords + 1)]
    
    sem = asyncio.Semaphore(concurrency_limit)
    success_count = 0
    fail_count = 0
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True
        )
        
        # 2. 100개 단위(Chunk)로 끊어서 로컬 메모리 최적화 및 로깅 진행
        chunk_size = 100
        start_time = time.time()
        
        for i in range(0, total_keywords, chunk_size):
            chunk = keywords[i:i+chunk_size]
            tasks = [fetch_keyword(kw, context, sem, i+idx+1) for idx, kw in enumerate(chunk)]
            
            results = await asyncio.gather(*tasks)
            chunk_success = sum(results)
            chunk_fail = len(results) - chunk_success
            success_count += chunk_success
            fail_count += chunk_fail
            
            elapsed = time.time() - start_time
            print(f"✅ 진행도: [{i+len(chunk):04d} / {total_keywords}] | 누적 성공: {success_count} | 누적 실패: {fail_count} | 경과 시간: {elapsed:.1f}초")
            
            # WAF에게 방어 스크립트 발동 여지를 안 주기 위해 100개마다 2초간 숨고르기 (인간다운 패턴)
            await asyncio.sleep(2)
            
        await browser.close()
        
    total_time = time.time() - start_time
    print("="*60)
    print(f"🏆 [최종 볼륨(Volume) 테스트 결과 - 1,000개 완료]")
    print(f"- 총 소요 시간: {total_time:.1f}초 ({total_time/60:.1f}분)")
    print(f"- 최종 성공률: {(success_count/total_keywords)*100:.1f}%")
    if (success_count/total_keywords) > 0.8:
        print("💡 분석: 성공적입니다! 이 속도와 볼륨 제한선으로 상용화 무한 반복이 가능합니다.")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(run_volume_test())
