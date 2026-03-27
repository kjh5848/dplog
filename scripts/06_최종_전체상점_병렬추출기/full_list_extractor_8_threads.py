"""[최종버전-안정성] 검색된 네이버 지도를 끝까지 스크롤하여 (이름, 카테고리, 주소, 이미지, 플레이스URL) 5가지 속성을 완벽히 쓸어담는 8스레드 병렬 코드입니다."""

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

async def fetch_complete_list(keyword, context, sem, search_num, target_lat, target_lon):
    async with sem:
        try:
            page = await context.new_page()
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # URL 뒤에 x, y 좌표를 달아주면 네이버가 해당 위치 중심으로 우선 검색함 (모바일 환경 우회)
            url = f"https://m.place.naver.com/place/list?query={keyword}&x={target_lon}&y={target_lat}"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2500)
            
            # 모바일 환경 특성상 바닥까지 긁어모으기 위해 15회 스크롤
            for _ in range(15):
                await page.evaluate("window.scrollBy(0, 3000)")
                await page.wait_for_timeout(800)
            
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
                    
                    let isAd = "N";
                    
                    // 네이버 모바일 플레이스 광고 뱃지 감지 (DOM 내 '광고' 텍스트 확인)
                    let textNodes = el.querySelectorAll('span, p, div');
                    for(let i=0; i<textNodes.length; i++) {
                        if(textNodes[i].innerText) {
                            let text = textNodes[i].innerText.trim();
                            // "광고ⓘ"와 같이 뒤에 아이콘 텍스트가 붙는 경우도 필터링
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
                        // 고유 URL이 없는 최상단 배치 상점은 파워링크 등 외부 타겟 광고 영역임
                        isAd = "Y(광고)";
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
            
            # 결과가 없다면 IP 차단이거나 진짜 결과가 없는 키워드임
            if not stores:
                return True, keyword, []
                
            # 순위 매기기 (광고/오가닉 독립 채점)
            organic_index = 1
            for i, st in enumerate(stores):
                st["절대순위"] = i + 1
                if "Y" in st["광고여부"]:
                    st["순위"] = i + 1 # 광고는 절대 노출 순위 그대로 반영
                else:
                    st["순위"] = organic_index # 자연노출은 오직 퓨어 오가닉 리스트 내에서의 순위 부여
                    organic_index += 1
                st["키워드"] = keyword
                
            return False, keyword, stores
            
        except Exception as e:
            return True, keyword, []
        finally:
            await page.close()

# 외부에서 Import 하여 실행 가능한 범용 엔진 함수
async def run_engine(keywords_list: list, concurrency: int, target_lat: float, target_lon: float):
    sem = asyncio.Semaphore(concurrency)
    all_extracted_data = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True,
            geolocation={'latitude': target_lat, 'longitude': target_lon},
            permissions=['geolocation']
        )
        
        for i in range(0, len(keywords_list), concurrency):
            chunk = keywords_list[i:i+concurrency]
            tasks = [fetch_complete_list(kw, context, sem, i+idx+1, target_lat, target_lon) for idx, kw in enumerate(chunk)]
            
            results = await asyncio.gather(*tasks)
            
            for blocked, kw, stores in results:
                if blocked or not stores:
                    print(f"⚠️ [{kw}] 차단됨 또는 결과 없음.")
                    continue
                all_extracted_data.extend(stores)
                
            await asyncio.sleep(1.5)
            
        await browser.close()
    
    return all_extracted_data

# 기존 CLI 방식 구동 로직
async def run_cli():
    # CLI 인자 처리
    parser = argparse.ArgumentParser(description="네이버 플레이스 병렬 추출기 (로컬 SEO 좌표 타겟팅)")
    parser.add_argument("--lat", type=float, default=35.1631139, help="타겟 위도 (기본값: 부산 해운대구)")
    parser.add_argument("--lon", type=float, default=129.1586925, help="타겟 경도 (기본값: 부산 해운대구)")
    args = parser.parse_args()

    CONCURRENCY = 8
    
    print(f"🚀 [{CONCURRENCY} 스레드] 키워드별 상점 전체 목록 수집 스크립트 가동 (lat={args.lat}, lon={args.lon})")
    print(f"- 저장 위치: {OUTPUT_DIR}")
    print("="*60)
    
    if not os.path.exists(INPUT_CSV):
        print(f"[!] {INPUT_CSV} 파일이 없습니다.")
        return
        
    df = pd.read_csv(INPUT_CSV)
    keywords = list(set([str(k) for k in df['파생키워드'].dropna() if len(str(k)) > 1]))
    keywords = keywords[:15] # 테스트 제한
    
    start_time = time.time()
    
    # 코어 엔진 직접 호출
    extracted_data = await run_engine(keywords, CONCURRENCY, args.lat, args.lon)
    
    # 결과를 키워드별로 분류하여 엑셀 저장 (기존 하위 호환성 유지)
    df_res = pd.DataFrame(extracted_data)
    if not df_res.empty:
        for kw in keywords:
            kw_data = df_res[df_res['키워드'] == kw]
            if not kw_data.empty:
                safe_kw = kw.replace(" ", "_").replace("/", "")
                excel_filename = f"검색결과_{safe_kw}_{CONCURRENCY}스레드.xlsx"
                excel_path = os.path.join(OUTPUT_DIR, excel_filename)
                
                kw_data[['키워드', '순위', '상호명', '광고여부', '카테고리', '주소', '네이버_플레이스_URL', '이미지_URL']].to_excel(excel_path, index=False)
                print(f"✅ [{kw}] 수집 완료 -> {len(kw_data)}개 저장됨")

    print("="*60)
    print(f"🏆 전체 스크래핑 종료 (소요시간: {time.time()-start_time:.1f}초)")

if __name__ == "__main__":
    asyncio.run(run_cli())
