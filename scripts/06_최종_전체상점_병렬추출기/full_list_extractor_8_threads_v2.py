"""[V2-스텔스강화] 검색된 네이버 지도를 끝까지 스크롤하여 5가지 속성을 쓸어담는 8스레드 병렬 코드입니다.
기존 버전과의 차이: 1개의 크롬(Browser) 안에서 8개의 스레드가 '완벽히 독립된 쿠키/세션(Context)'을 하나씩 가지도록 아키텍처를 전면 리팩토링했습니다.
네이버 방화벽이 동일 봇으로 인지하고 연쇄 차단하지 못하도록 안전성을 극대화한 구조입니다."""

import asyncio
import pandas as pd
from playwright.async_api import async_playwright
import time
import os
import argparse
from datetime import datetime

# 경로 설정
BASE_DIR = "/Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/scripts"
INPUT_CSV = os.path.join(BASE_DIR, "00_검색_데이터_세트", "busan_keywords_ultimate.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "06_최종_전체상점_병렬추출기")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# [V2 핵심 차이점 1] 기존에는 context를 아예 통째로 넘겨받았지만, 이제는 최상단 browser 객체만 넘겨받습니다.
async def fetch_complete_list(keyword, browser, sem, search_num, target_lat, target_lon):
    async with sem:
        # [V2 핵심 차이점 2] 스레드가 실행될 때마다 "나 자신만의 고유한 시크릿 브라우저 창(Context)"을 이곳에서 직접 엽니다.
        # 이렇게 하면 8개의 동시 스레드(키워드 검색)끼리 네이버 쿠키, 캐시, 접속 세션 흔적이 절대 하나로 섞이지 않습니다!
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True,
            geolocation={'latitude': target_lat, 'longitude': target_lon},
            permissions=['geolocation']
        )
        
        try:
            # 1 컨텍스트 당 1 개의 고유한 페이지 창 생성
            page = await context.new_page()
            
            # 셀레니움/웹드라이버 봇 흔적 지우기 (Stealth 우회 자바스크립트 주입)
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # URL에서 x, y 좌표를 제거하여 '진짜 고객이 검색하는 유기적(Organic) 순위'를 가져옵니다. 
            # (좌표 개입 시 네이버가 거리순/위치기반으로 랭킹을 왜곡함)
            url = f"https://m.place.naver.com/place/list?query={keyword}"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2500) # 첫 렌더링을 기다려주는 휴식기
            
            # [Dynamic Infinite Scroll] 항목 수가 늘어나지 않을 때까지 끝까지 스크롤 (최대 300여 개 돌파)
            prev_count = 0
            retries = 0
            
            for _ in range(80): # 무한 루프 방지용 (80회면 충분히 300개 이상 커버)
                await page.evaluate("window.scrollBy(0, 5000)")
                await page.wait_for_timeout(1000)
                
                # 스크롤 후 로딩된 리스트 항목 갯수 검사
                curr_count = await page.evaluate("document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL').length")
                
                if curr_count == prev_count:
                    retries += 1
                    if retries >= 3: # 3연속(3초간) 스크롤해도 갯수가 안 늘어나면 바닥에 도달한 것으로 간주
                        break
                else:
                    retries = 0 
                    prev_count = curr_count
            
            # DOM 최적화 파싱 로직 (기존 버전과 100% 동일)
            stores = await page.evaluate('''() => {
                let results = [];
                // li 항목들을 순회 (모바일 지도 리스트의 기본 wrapper)
                let items = document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q');
                
                if (items.length === 0) {
                    // 대체 클래스들 검색 fallback
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
                    let nameEl = el.querySelector('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
                    let name = nameEl ? nameEl.innerText.trim() : "알수없음";
                    
                    let catEl = el.querySelector('.YzBgS, .lxgjv, .uzK8e, .KCMnt');
                    let category = catEl ? catEl.innerText.trim() : "";
                    
                    let addrEl = el.querySelector('.suKMR, .hY0oG, .n1h2h, .u_c_address');
                    let address = addrEl ? addrEl.innerText.trim() : "";
                    
                    let imgEl = el.querySelector('.K0PDV, .CBbl_, img');
                    let imgUrl = imgEl ? (imgEl.style.backgroundImage.slice(5,-2) || imgEl.src) : "";
                    if(imgUrl && imgUrl.startsWith && imgUrl.startsWith('"') && imgUrl.endsWith('"')) {
                        imgUrl = imgUrl.slice(1, -1);
                    }
                    
                    let isAd = "N";
                    let textNodes = el.querySelectorAll('span, p, div');
                    for(let i=0; i<textNodes.length; i++) {
                        if(textNodes[i].innerText) {
                            let text = textNodes[i].innerText.trim();
                            if(text.includes("광고") && text.length <= 5) {
                                isAd = "Y(광고)";
                                break;
                            }
                        }
                    }
                    
                    let placeUrl = "";
                    let placeLink = el.querySelector('a[href*="/place/"]');
                    if (placeLink) {
                        let href = placeLink.getAttribute("href") || "";
                        let match = href.match(/place\\/([0-9]+)/);
                        if (match && match[1]) {
                            placeUrl = "https://m.place.naver.com/restaurant/" + match[1] + "/home";
                        }
                    } else {
                        isAd = "Y(광고)"; // 고유가 없는 최상단 배치는 파워링크 등 외부광고
                    }

                    return {
                        "상호명": name,
                        "광고여부": isAd,
                        "카테고리": category,
                        "주소": address,
                        "네이버_플레이스_URL": placeUrl,
                        "이미지_URL": imgUrl
                    };
                }).filter(x => x['상호명'] !== "알수없음");
            }''')
            
            if not stores:
                return True, keyword, []
                
            organic_index = 1
            for i, st in enumerate(stores):
                st["절대순위"] = i + 1
                if "Y" in st["광고여부"]:
                    st["순위"] = i + 1 
                else:
                    st["순위"] = organic_index 
                    organic_index += 1
                st["키워드"] = keyword
                
            return False, keyword, stores
            
        except Exception as e:
            return True, keyword, []
        finally:
            # [V2 핵심 차이점 3] 작업이 끝난 후 페이지(Page)만 닫는 게 아니라, 아예 해당 '컨텍스트' 전체를 완전히 부숴버립니다. (메모리 누수 및 차단 연쇄 방지)
            await context.close()

# 외부에서 Import 하여 실행 가능한 범용 최상위 엔진
async def run_engine(keywords_list: list, concurrency: int, target_lat: float, target_lon: float):
    sem = asyncio.Semaphore(concurrency)
    all_extracted_data = []

    async with async_playwright() as p:
        # [V2 핵심 차이점 4] 여기서 컨텍스트를 미리 만들지 않고, 오직 브라우저(껍데기)만 단 1번 Launch 합니다.
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        
        for i in range(0, len(keywords_list), concurrency):
            chunk = keywords_list[i:i+concurrency]
            
            # 배열로 코루틴(Task)을 던질 때 단일 context가 아닌 "전역 browser 껍데기"를 각각 넘겨줍니다.
            tasks = [fetch_complete_list(kw, browser, sem, i+idx+1, target_lat, target_lon) for idx, kw in enumerate(chunk)]
            
            # [8 스레드 병렬 출발] ➜ 이제 각 스레드가 자기만의 컨텍스트를 독립적으로 생성하여 달리게 됩니다.
            results = await asyncio.gather(*tasks)
            
            for blocked, kw, stores in results:
                if blocked or not stores:
                    print(f"⚠️ [{kw}] 스크래핑 캡차 차단 감지 또는 결과가 존재하지 않아 스킵합니다.")
                    continue
                all_extracted_data.extend(stores)
                
            # 스레드 묶음 처리 후 휴식기 (네이버의 패턴 탐지 회피)
            await asyncio.sleep(1.5)
            
        await browser.close()
    
    return all_extracted_data

async def run_cli():
    parser = argparse.ArgumentParser(description="네이버 플레이스 병렬 추출기 V2 (독립 시크릿 창 격리 아키텍처)")
    parser.add_argument("--lat", type=float, default=35.1631139, help="타겟 위도 (기본값: 부산 해운대구)")
    parser.add_argument("--lon", type=float, default=129.1586925, help="타겟 경도 (기본값: 부산 해운대구)")
    args = parser.parse_args()

    CONCURRENCY = 8
    
    print(f"🚀 V2 엔진 가동: [{CONCURRENCY} 스레드 x 100% 독립 시크릿 세션 분리] 상호명/URL/이미지 병렬 추출 (lat={args.lat}, lon={args.lon})")
    print(f"- 저장 위치: {OUTPUT_DIR}")
    print("="*60)
    
    if not os.path.exists(INPUT_CSV):
        print(f"[!] {INPUT_CSV} 대상 CSV 파일이 없습니다.")
        return
        
    df = pd.read_csv(INPUT_CSV)
    keywords = list(set([str(k) for k in df['파생키워드'].dropna() if len(str(k)) > 1]))
    keywords = keywords[:15] # V2 테스트를 위한 소량 제한 (현업 구동 시 슬라이싱 주석 처리 필요)
    
    start_time = time.time()
    extracted_data = await run_engine(keywords, CONCURRENCY, args.lat, args.lon)
    
    df_res = pd.DataFrame(extracted_data)
    if not df_res.empty:
        for kw in keywords:
            kw_data = df_res[df_res['키워드'] == kw]
            if not kw_data.empty:
                safe_kw = kw.replace(" ", "_").replace("/", "")
                excel_filename = f"검색결과_{safe_kw}_{CONCURRENCY}스레드_V2.xlsx"
                excel_path = os.path.join(OUTPUT_DIR, excel_filename)
                
                kw_data[['키워드', '순위', '상호명', '광고여부', '카테고리', '주소', '네이버_플레이스_URL', '이미지_URL']].to_excel(excel_path, index=False)
                print(f"✅ [{kw}] 병렬 수집 V2 완료 ➜ {len(kw_data)}개 저장됨")

    print("="*60)
    print(f"🏆 전체 스크래핑 프로세스 V2 종료 (소요시간: {time.time()-start_time:.1f}초)")

if __name__ == "__main__":
    asyncio.run(run_cli())
