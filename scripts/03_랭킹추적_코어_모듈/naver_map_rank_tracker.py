"""단일 키워드에 대해 상점의 정확한 노출 순위를 검색해 반환하는 랭킹 추적 모듈의 심장부분입니다."""

import asyncio
import pandas as pd
from playwright.async_api import async_playwright
import time
import os

# 1. 대상 매장 정보 설정
TARGET_STORE = "푸짐한뒷고기"
INPUT_CSV = "store_diagnosis_pujimhan_vertical.csv"
OUTPUT_EXCEL = "top3_ranking_pujimhan.xlsx"

async def get_map_ranking(p, keyword):
    """지정된 키워드로 네이버 모바일 플레이스 리스트를 검색하고 TARGET_STORE의 순위를 반환합니다."""
    browser = await p.chromium.launch(
        headless=True,
        args=['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--ignore-certificate-errors', '--disable-web-security']
    )
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        viewport={'width': 390, 'height': 844},
        is_mobile=True,
        has_touch=True
    )
    
    await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
    page = await context.new_page()
    
    try:
        url = f"https://m.place.naver.com/place/list?query={keyword}"
        await page.goto(url, wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(2500)
        
        store_names = await page.evaluate('''() => {
            let items = document.querySelectorAll('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
            let results = [];
            items.forEach(el => {
                let text = el.innerText;
                if(text && text.trim() !== '' && !results.includes(text.trim())) {
                    results.push(text.trim());
                }
            });
            return results;
        }''')
        
        rank = -1
        for i, name in enumerate(store_names):
            if TARGET_STORE.replace(" ", "") in name.replace(" ", ""):
                rank = i + 1
                break
                
        return {"keyword": keyword, "rank": rank, "competitors": store_names[:3]}
        
    except Exception as e:
        print(f"\n[!] '{keyword}' 검색 중 오류 발생: {str(e)[:50]}")
        return {"keyword": keyword, "rank": -1, "competitors": []}
    finally:
        await browser.close()

async def main():
    print(f"[*] '{TARGET_STORE}' 실시간 네이버 지도 순위 추적 및 히스토리 기록 엔진 가동")
    
    if not os.path.exists(INPUT_CSV):
        print(f"[!] {INPUT_CSV} 파일을 찾을 수 없습니다.")
        return
        
    df = pd.read_csv(INPUT_CSV)
    keywords = set(df['파생키워드'].dropna().tolist())
    keywords = [str(k) for k in keywords if len(str(k)) > 1 and "푸짐한" not in str(k)]
    keywords = list(keywords)
    
    print(f"[*] 총 {len(keywords)}개의 파생 키워드를 추출했습니다.")
    print(f"[*] 목표: 3위 이내에 랭크된 키워드 3개를 발굴할 때까지 모든 탐색 기록을 저장합니다.\n")
    
    all_search_records = []
    top3_count = 0
    
    async with async_playwright() as p:
        for i, kw in enumerate(keywords):
            search_num = i + 1
            print(f"[{search_num}/{len(keywords)}] 🔍 검색 중: '{kw}' ...", flush=True)
            
            result = await get_map_ranking(p, kw)
            rank = result['rank']
            
            # 사용자 요청: 실패/성공 여부 상관없이 "무엇을 검색했는지 찾은 데이터를 싹 다 남겨줘"
            record = {
                "검색순번": search_num,
                "키워드": kw,
                "내점포_순위": f"{rank}위" if rank != -1 else "미노출(순위권 밖)",
                "1위_경쟁사": result['competitors'][0] if len(result['competitors']) > 0 else "-",
                "2위_경쟁사": result['competitors'][1] if len(result['competitors']) > 1 else "-",
                "3위_경쟁사": result['competitors'][2] if len(result['competitors']) > 2 else "-"
            }
            all_search_records.append(record)
            
            if rank != -1:
                print(f"  ↪ ✨ 결과: {rank}위 노출! (Top 1위: {result['competitors'][0] if len(result['competitors']) > 0 else '-'})")
                if rank <= 3:
                    top3_count += 1
                    print(f"  ↪ 🏆 3위 이내 타겟 달성! ({top3_count}/3)")
            else:
                print(f"  ↪ ❌ 결과: 미노출")
                
            time.sleep(3)
            
            if top3_count >= 3:
                print(f"\n[!] 🏆 상위 3위 이내 키워드 3개를 성공적으로 모두 찾았습니다! 탐색 종료.")
                break
                
    if len(all_search_records) > 0:
        out_df = pd.DataFrame(all_search_records)
        out_df.to_excel(OUTPUT_EXCEL, index=False)
        print(f"\n[*] 엑셀 저장 완료 (모든 탐색 기록 {len(all_search_records)}줄 포함): {OUTPUT_EXCEL}")
    else:
        print("\n[!] 저장할 데이터가 없습니다.")

if __name__ == "__main__":
    asyncio.run(main())
