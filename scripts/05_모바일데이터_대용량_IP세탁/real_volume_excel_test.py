"""대용량 추출 과정에서 프로세스 강제 종료 시 데이터가 날아가는 것을 방지하기 위해 엑셀에 실시간 누적 저장(Flush)을 수행하는 코드입니다."""

import asyncio
import pandas as pd
from playwright.async_api import async_playwright
import time
import os

CONCURRENCY = 8
TARGET_STORE = "푸짐한뒷고기"
INPUT_CSV = "store_diagnosis_pujimhan_vertical.csv"
OUTPUT_EXCEL = "volume_test_results_live.xlsx"

# 전역 설정
browser = None
context = None
playwright_instance = None
all_results = [] # 실시간 엑셀 저장을 위한 누적 리스트

async def init_browser():
    global browser, context, playwright_instance
    if playwright_instance is None:
         playwright_instance = await async_playwright().start()
    if browser:
         await browser.close()
    
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

async def fetch_rank(keyword, sem, search_num):
    global context
    async with sem:
        try:
            page = await context.new_page()
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            url = f"https://m.place.naver.com/place/list?query={keyword}"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2500)
            
            store_names = await page.evaluate('''() => {
                let items = document.querySelectorAll('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
                let results = [];
                items.forEach(el => {
                    let text = el.innerText;
                    if(text && text.trim() !== '' && !results.includes(text.trim())) { results.push(text.trim()); }
                });
                return results;
            }''')
            
            rank = -1
            for i, name in enumerate(store_names):
                if TARGET_STORE.replace(" ", "") in name.replace(" ", ""):
                    rank = i + 1
                    break
                    
            if len(store_names) == 0:
                is_blocked = True # 검색 결과가 아예 없으면 캡차/차단 확률 큼
                status = "차단/결과없음"
            else:
                is_blocked = False
                status = f"{rank}위" if rank != -1 else "미노출"
                
            res = {
                "검색순번": search_num,
                "키워드": keyword,
                "내점포_순위": status,
                "1위_경쟁사": store_names[0] if len(store_names) > 0 else "-",
                "2위_경쟁사": store_names[1] if len(store_names) > 1 else "-"
            }
            return is_blocked, res
            
        except Exception as e:
            return True, {"검색순번": search_num, "키워드": keyword, "내점포_순위": "에러발생", "1위_경쟁사": "-", "2위_경쟁사": "-"}
        finally:
            await page.close()

async def run_real_volume_test():
    print(f"🚀 [실제 데이터 엑셀 누적] 10,000개 볼륨 실전 스크래핑")
    if not os.path.exists(INPUT_CSV):
        print(f"[!] {INPUT_CSV} 파일을 찾을 수 없습니다.")
        return
        
    df = pd.read_csv(INPUT_CSV)
    # 진짜 키워드 목록만 안전하게 긁어오기
    real_keywords = list(set([str(k) for k in df['파생키워드'].dropna() if len(str(k)) > 1]))
    
    # 70여 개의 진짜 키워드를 반복하여 10,000개 리스트(가혹 환경) 생성
    target_total = 10000
    keywords = (real_keywords * (target_total // len(real_keywords) + 1))[:target_total]
    
    print(f"- 목표 키워드 수: {target_total}개 (실제 키워드를 반복하여 누적)")
    print(f"- 실시간 저장 엑셀 명칭: {OUTPUT_EXCEL}")
    print("="*60)
    
    sem = asyncio.Semaphore(CONCURRENCY)
    await init_browser()
    start_time = time.time()
    
    i = 0
    chunk_size = 50
    global all_results
    
    while i < target_total:
        chunk = keywords[i:i+chunk_size]
        tasks = [fetch_rank(kw, sem, i+idx+1) for idx, kw in enumerate(chunk)]
        
        results = await asyncio.gather(*tasks)
        
        c_fail = sum([1 for blocked, _ in results if blocked])
        c_success = len(results) - c_fail
        
        # 엑셀 배열에 누적 저장
        for blocked, data in results:
            all_results.append(data)
            
        # 50개(청크)를 돌 때마다 엑셀 파일(.xlsx)을 하드디스크에 실시간 덮어쓰기 저장
        pd.DataFrame(all_results).to_excel(OUTPUT_EXCEL, index=False)
        
        elapsed = time.time() - start_time
        print(f"✅ 진행도: [{i+len(chunk):05d} / {target_total}] | 성공: {c_success}건 | 차단: {c_fail}건 | (엑셀 실시간 저장됨)")
        
        # 50개 중 성공이 5건(10%) 미만이면 차단으로 간주
        if c_success < 5:
            print("\n" + "="*60)
            print(f"🚨 [IP 차단 감지됨] {i}번째 구간에서 네이버 방어벽 누적 패널티 발생!!")
            print("   📲 [조치법] 핸드폰 데이터의 '비행기 모드'를 켰다가 3초 뒤에 끄세요 (IP 세탁).")
            print("="*60)
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, input, "✅ 핸드폰 IP 변경 완료 후 터미널 창에서 [Enter] 키를 누르세요. 실패 구간부터 다시 엑셀을 채웁니다...")
            
            # 실패한 결과(더미 데이터 50줄)는 엑셀에서 없애버리기
            all_results = all_results[:-len(chunk)] 
            await init_browser()
            continue 
            
        i += chunk_size
        await asyncio.sleep(2) # WAF 회피용 숨고르기

    global playwright_instance
    if browser: await browser.close()
    if playwright_instance: await playwright_instance.stop()

if __name__ == "__main__":
    asyncio.run(run_real_volume_test())
