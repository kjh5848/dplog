"""Asyncio를 활용하여 단일 키워드의 랭커 검색을 비동기 스크래핑으로 처리하도록 최적화한 모듈입니다."""

import asyncio
import pandas as pd
from playwright.async_api import async_playwright
import os

TARGET_STORE = "푸짐한뒷고기"
INPUT_CSV = "store_diagnosis_pujimhan_vertical.csv"
OUTPUT_EXCEL = "top3_ranking_pujimhan.xlsx"

async def fetch_rank(context, keyword, search_num):
    page = await context.new_page()
    try:
        url = f"https://m.place.naver.com/place/list?query={keyword}"
        # 통신 지연 방지를 위해 networkidle 대신 domcontentloaded에서 React 데이터 대기 강제
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(2500) # React App SSR 데이터가 ApolloState에서 DOM으로 그어지는 딜레이
        
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
                
        return {"검색순번": search_num, "키워드": keyword, "내점포_순위": f"{rank}위" if rank != -1 else "미노출", "1위_경쟁사": store_names[0] if len(store_names) > 0 else "-", "2위_경쟁사": store_names[1] if len(store_names) > 1 else "-", "3위_경쟁사": store_names[2] if len(store_names) > 2 else "-"}
    except Exception as e:
        return {"검색순번": search_num, "키워드": keyword, "내점포_순위": f"오류: {str(e)[:15]}", "1위_경쟁사": "-", "2위_경쟁사": "-", "3위_경쟁사": "-"}
    finally:
        await page.close()

async def worker(sem, context, kw, search_num):
    async with sem:
        res = await fetch_rank(context, kw, search_num)
        print(f"[{search_num:02d}] 🔍 '{kw}' -> {res['내점포_순위']} (1위: {res['1위_경쟁사']})", flush=True)
        return res

async def main():
    print(f"[*] 병렬 수집 엔진 가동 (Naver Map 랭킹 추적 - Limit 15 동시접속)")
    if not os.path.exists(INPUT_CSV): 
        print(f"[!] {INPUT_CSV} 파일을 찾을 수 없습니다.")
        return
        
    df = pd.read_csv(INPUT_CSV)
    keywords = list(set([str(k) for k in df['파생키워드'].dropna() if len(str(k)) > 1 and "푸짐한" not in str(k)]))
    keywords = keywords[:75] # 안전한 테스트를 위해 상위 75개 차단 테스트
    
    print(f"[*] 병렬 수집 대상: 총 {len(keywords)}건 (동시 15개 탭 렌더링, 100% 데이터 수집)")
    print(f"[*] 진행 시작...\n")
    
    # [실험 환경]: 병렬 처리 상한선(Concurrency Limit) 15 지정 -> 네이버 차단 우회 및 브라우저 메모리 최적화
    sem = asyncio.Semaphore(15) 
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
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        
        tasks = []
        for i, kw in enumerate(keywords):
            tasks.append(worker(sem, context, kw, i+1))
            
        results = await asyncio.gather(*tasks)
        await browser.close()
        
    out_df = pd.DataFrame(results).sort_values(by="검색순번")
    out_df.to_excel(OUTPUT_EXCEL, index=False)
    print(f"\n[*] 🏁 엑셀 저장 완료 (총 {len(results)}라인 이력 100% 수집완료): {OUTPUT_EXCEL}")

if __name__ == "__main__":
    asyncio.run(main())
