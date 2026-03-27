"""Semaphore의 수를 2개부터 순차적으로 증가시키며 네이버 WAF(방화벽)가 차단을 시작하는 한계점(Golden Ratio)을 자동으로 찾는 로직입니다."""

import asyncio
import time
import json
import urllib.request
from playwright.async_api import async_playwright
import pandas as pd

# 50개의 고정된 타겟 키워드 풀 (빠른 벤치마킹용)
BENCHMARK_KEYWORDS = [
    "시청고기집", "시청뒷고기", "연산동뒷고기", "시청역회식", "부산시청삼겹살",
    "부산시청가성비맛집", "거제시장맛집", "연산동고기집", "시청역삼겹살", "부산시청고기집",
    "시청역고기집", "거제동맛집", "연제구맛집", "양정맛집", "연산맛집",
    "시청역맛집", "부산시청역맛집", "연제구고기집", "부산비오는날맛집", "부산가성비고기집",
    "부산회식장소추천", "부산시청회식", "연산동회식", "부산시청술집", "시청역술집",
    "부산시청저녁", "연산동저녁", "부산시청데이트", "시청데이트", "거제동고기집",
    "연산동가성비추천", "부산시청근처맛집", "부산시청주변맛집", "부산시청로컬맛집", "부산시청현지인맛집",
    "시청역가성비고기집", "연산동로컬맛집", "연산동현지인맛집", "부산교대맛집", "부산시청밥집",
    "부산특수부위맛집", "부산뒷고기맛집", "연산동뒷고기맛집", "시청역특수부위", "연산동특수부위",
    "부천 신중동 맛집", "화성시청 고기집", "부산시청 목살 고기집", "서울시청 고기집 추천", "인천시청 갈비"
]

TARGET_STORE = "푸짐한뒷고기"

def get_public_ip():
    try:
        url = "https://api.ipify.org?format=json"
        response = urllib.request.urlopen(url, timeout=5)
        return json.loads(response.read().decode('utf-8')).get("ip", "Unknown")
    except:
        return "Unknown"

async def fetch_keyword(keyword, context, semaphore):
    """개별 검색을 1건씩 처리하는 비동기 워커 (결과 요약만 반환)"""
    async with semaphore:
        try:
            page = await context.new_page()
            # W3C 탐지 회피
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            url = f"https://m.place.naver.com/place/list?query={keyword}"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2500) # DOM 렌더링 딜레이
            
            store_names = await page.evaluate('''() => {
                let items = document.querySelectorAll('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
                let results = [];
                items.forEach(el => {
                    let text = el.innerText;
                    if(text && text.trim() !== '' && !results.includes(text.trim())) { results.push(text.trim()); }
                });
                return results;
            }''')
            
            if len(store_names) > 0:
                return True
            return False

        except Exception as e:
            return False
        finally:
            await page.close()

async def run_benchmark_batch(max_concurrent):
    """지정된 Concurrency Limit으로 50개 풀을 돌려 성공률을 반환"""
    semaphore = asyncio.Semaphore(max_concurrent)
    print(f"\n▶️ [테스트 시작] 병렬 스레드: {max_concurrent}개 (동시 접속)")
    start_time = time.time()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={"width": 393, "height": 852},
            is_mobile=True,
            has_touch=True
        )

        tasks = [fetch_keyword(kw, context, semaphore) for kw in BENCHMARK_KEYWORDS]
        results = await asyncio.gather(*tasks)
        await browser.close()
        
    elapsed = time.time() - start_time
    success_count = results.count(True)
    fail_count = results.count(False)
    success_rate = (success_count / len(BENCHMARK_KEYWORDS)) * 100
    
    print(f"   ㄴ 완료! 소요시간: {elapsed:.2f}초 | 속도: {len(BENCHMARK_KEYWORDS)/elapsed:.2f}탭/sec")
    print(f"   ㄴ 성공: {success_count}건 / 실패(차단): {fail_count}건 ➡️ [성공률: {success_rate:.1f}%]")
    
    return {
        "Concurrency": max_concurrent,
        "Time(sec)": round(elapsed, 2),
        "Speed(tabs/sec)": round(len(BENCHMARK_KEYWORDS)/elapsed, 2),
        "Success_Rate(%)": success_rate
    }

async def main():
    print("=" * 60)
    print("📈 [Mac 16GB Incremental Stress Benchmark]")
    print(f"IP: {get_public_ip()} | 반복 키워드 수: 50개")
    print("=" * 60)
    
    # 2 -> 4 -> 6 -> 8 -> 10 -> 12 -> 14 -> 16 순서로 세밀하게 한계치 돌파 시도
    test_levels = [2, 4, 6, 8, 10, 12, 14, 16]
    summary_data = []

    for level in test_levels:
        result = await run_benchmark_batch(level)
        summary_data.append(result)
        
        # 만약 이전 단계에서 성공률이 50% 밑으로 박살나면, IP 영구 밴 우려가 있으므로 즉시 중단
        if result["Success_Rate(%)"] < 50.0:
            print("\n🚨 [위험] 성공률 50% 미만 추락! WAF IP 통제 또는 하드웨어 한계 도달. 더 이상의 테스트를 중지합니다.")
            break
            
        print("   (쿨다운 3초 대기...)")
        time.sleep(3)

    print("\n" + "=" * 60)
    print("🏆 [최종 벤치마크 결과 요약표]")
    df = pd.DataFrame(summary_data)
    print(df.to_string(index=False))
    print("=" * 60)
    
if __name__ == "__main__":
    asyncio.run(main())
