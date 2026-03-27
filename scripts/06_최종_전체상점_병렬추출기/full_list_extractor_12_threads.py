"""[최종버전-초가속형] 12개의 스레드로 무자비하게 추출을 감행하는 극한 속도 버전입니다. 모바일 IP 변경이 매우 빈번히 요구됩니다."""

import asyncio
import pandas as pd
from playwright.async_api import async_playwright
import time
import os
from datetime import datetime

CONCURRENCY = 12  # 이 부분만 8, 10, 12로 변경하여 3종 세트 생성
INPUT_CSV = "../../store_diagnosis_pujimhan_vertical.csv"

# 날짜별 폴더 생성 (예: scripts/2026-03-26)
TODAY_STR = datetime.now().strftime("%Y-%m-%d")
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def fetch_complete_list(keyword, context, sem, search_num):
    async with sem:
        try:
            page = await context.new_page()
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            url = f"https://m.place.naver.com/place/list?query={keyword}"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2500)
            
            # 끝까지 스크롤하여 모든 상점을 로드 (모바일 환경 특성상 3~4회면 충분히 50개 이상 노출됨)
            for _ in range(4):
                await page.evaluate("window.scrollBy(0, 3000)")
                await page.wait_for_timeout(1000)
            
            # DOM 파싱을 통해 상점 이름, 카테고리, 도로명 주소, 썸네일 경로 추출
            stores = await page.evaluate('''() => {
                let results = [];
                // li 항목들을 순회 (모바일 지도 리스트의 기본 wrapper)
                let items = document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q'); // 다양한 리스트 컨테이너 클래스들
                
                if (items.length === 0) {
                    // 대체 클래스들 검색
                    items = document.querySelectorAll('div.YwYLL').forEach(el => {
                        let parent = el.closest('li') || el.closest('div.Ccb6x');
                        if(parent && !results.some(r => r.node === parent)) {
                            results.push({node: parent});
                        }
                    });
                } else {
                    items.forEach(el => results.push({node: el}));
                }

                return results.map(item => {
                    let el = item.node;
                    // 이름 (다양한 클래스 포용)
                    let nameEl = el.querySelector('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
                    let name = nameEl ? nameEl.innerText.trim() : "알수없음";
                    
                    // 카테고리 (이름 옆에 붙어있는 주로 옅은 회색 텍스트)
                    let catEl = el.querySelector('.YzBgS, .lxgjv, .uzK8e, .KCMnt');
                    let category = catEl ? catEl.innerText.trim() : "";
                    
                    // 주소 정보 (동/도로명)
                    let addrEl = el.querySelector('.suKMR, .hY0oG, .n1h2h, .u_c_address');
                    let address = addrEl ? addrEl.innerText.trim() : "";
                    
                    // 썸네일 이미지 링크
                    let imgEl = el.querySelector('.K0PDV, .CBbl_, img');
                    let imgUrl = imgEl ? (imgEl.style.backgroundImage.slice(5,-2) || imgEl.src) : "";
                    if(imgUrl && imgUrl.startsWith && imgUrl.startsWith('"') && imgUrl.endsWith('"')) {
                        imgUrl = imgUrl.slice(1, -1);
                    }
                    
                    // ⭐️ 네이버 플레이스 링크 병합 ⭐️
                    let placeUrl = "";
                    let placeLink = el.querySelector('a[href*="/place/"]');
                    if (placeLink) {
                        let href = placeLink.getAttribute("href") || "";
                        let match = href.match(/place\\/([0-9]+)/);
                        if (match && match[1]) {
                            placeUrl = "https://m.place.naver.com/restaurant/" + match[1] + "/home";
                        }
                    }

                    return {
                        "상호명": name,
                        "카테고리": category,
                        "주소": address,
                        "네이버_플레이스_URL": placeUrl,
                        "이미지_URL": imgUrl
                    };
                }).filter(x => x['상호명'] !== "알수없음");
            }''')
            
            # 결과가 없다면 IP 차단이거나 진짜 결과가 없는 키워드임
            if not stores:
                return True, keyword, []
                
            # 순위 매기기
            for i, st in enumerate(stores):
                st["순위"] = i + 1
                st["키워드"] = keyword
                
            return False, keyword, stores
            
        except Exception as e:
            return True, keyword, []
        finally:
            await page.close()

async def run_full_extraction():
    print(f"🚀 [{CONCURRENCY} 스레드] 키워드별 상점 전체 목록 수집 스크립트 가동")
    print(f"- 저장 위치: {OUTPUT_DIR}")
    print("="*60)
    
    if not os.path.exists(INPUT_CSV):
        print(f"[!] {INPUT_CSV} 파일이 없습니다.")
        return
        
    df = pd.read_csv(INPUT_CSV)
    keywords = list(set([str(k) for k in df['파생키워드'].dropna() if len(str(k)) > 1]))
    # 테스트를 위해 15개로 제한, 너무 길어짐을 방지
    keywords = keywords[:15]
    
    sem = asyncio.Semaphore(CONCURRENCY)
    
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
        
        start_time = time.time()
        for i in range(0, len(keywords), CONCURRENCY):
            chunk = keywords[i:i+CONCURRENCY]
            tasks = [fetch_complete_list(kw, context, sem, i+idx+1) for idx, kw in enumerate(chunk)]
            
            results = await asyncio.gather(*tasks)
            
            for blocked, kw, stores in results:
                if blocked or not stores:
                    print(f"⚠️ [{kw}] 차단됨 또는 결과 없음.")
                    continue
                    
                # 각 키워드별로 별도의 엑셀 파일 생성
                safe_kw = kw.replace(" ", "_").replace("/", "")
                excel_filename = f"검색결과_{safe_kw}_{CONCURRENCY}스레드.xlsx"
                excel_path = os.path.join(OUTPUT_DIR, excel_filename)
                
                # 열 순서 이쁘게 정렬
                df_res = pd.DataFrame(stores)[['키워드', '순위', '상호명', '카테고리', '주소', '네이버_플레이스_URL', '이미지_URL']]
                df_res.to_excel(excel_path, index=False)
                print(f"✅ [{kw}] 수집 완료 -> {len(stores)}개 저장됨")
                
            await asyncio.sleep(1.5)
            
        await browser.close()
        
    print("="*60)
    print(f"🏆 전체 스크래핑 종료 (소요시간: {time.time()-start_time:.1f}초)")

if __name__ == "__main__":
    asyncio.run(run_full_extraction())
