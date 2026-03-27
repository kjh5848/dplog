import asyncio
import pandas as pd
from playwright.async_api import async_playwright
import time
import os
import sys
import subprocess

CONCURRENCY = 8
BASE_DIR = "/Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/scripts"
INPUT_CSV = os.path.join(BASE_DIR, "00_검색_데이터_세트/[키워드]_API_1000개_추출본.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "06_최종_전체상점_병렬추출기", "테스트결과")

# [중요] 위치 기반 검색을 위한 GPS 좌표 설정 (기본값: 부산 해운대구 중심)
TARGET_LATITUDE = 35.1631139 
TARGET_LONGITUDE = 129.1586925

os.makedirs(OUTPUT_DIR, exist_ok=True)

async def fetch_complete_list(keyword, context, sem, search_num):
    async with sem:
        page = None
        try:
            page = await context.new_page()
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # URL 뒤에 x, y 좌표를 달아주면 네이버가 해당 위치 중심으로 우선 검색함 (모바일 환경 우회)
            url = f"https://m.place.naver.com/place/list?query={keyword}&x={TARGET_LONGITUDE}&y={TARGET_LATITUDE}"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2500)
            
            # 모바일 리스트 무한 스크롤 (바닥까지 긁기 위해 15회로 확장)
            for _ in range(15):
                await page.evaluate("window.scrollBy(0, 3000)")
                await page.wait_for_timeout(800)
            
            stores = await page.evaluate('''() => {
                let results = [];
                let items = document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q');
                
                if (items.length === 0) {
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
                    if(imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('"') && imgUrl.endsWith('"')) {
                        imgUrl = imgUrl.slice(1, -1);
                    }
                    
                    let isAd = "N";
                    let placeUrl = "";
                    let placeLink = el.querySelector('a[href*="/place/"]');
                    if (placeLink) {
                        let href = placeLink.getAttribute("href") || "";
                        let match = href.match(/place\\/([0-9]+)/);
                        if (match && match[1]) {
                            placeUrl = "https://m.place.naver.com/restaurant/" + match[1] + "/home";
                        }
                    } else {
                        // 고유 URL이 없는 최상단 배치 상점은 파워링크/플레이스 광고 영역임
                        isAd = "Y(광고)";
                    }

                    return {
                        "상호명": name,
                        "카테고리": category,
                        "주소": address,
                        "네이버_플레이스_URL": placeUrl,
                        "이미지_URL": imgUrl,
                        "광고여부": isAd
                    };
                }).filter(x => x['상호명'] !== "알수없음");
            }''')
            
            if not stores:
                return True, keyword, []
                
            for i, st in enumerate(stores):
                st["순위"] = i + 1
                st["키워드"] = keyword
                
            return False, keyword, stores
            
        except Exception as e:
            return True, keyword, []
        finally:
            if page:
                await page.close()

async def run_test():
    print("="*60)
    print("🚀 [1단계] API 데이터셋 존재 여부 확인...")
    
    if not os.path.exists(INPUT_CSV):
        print("   - 데이터셋이 없어 API 우선 추출을 진행합니다...")
        api_script = os.path.join(BASE_DIR, "03_랭킹추적_코어_모듈", "extract_1000_keywords_via_api.py")
        subprocess.run([sys.executable, api_script])
    else:
        print("   - API 추출 데이터셋 확인 완료!")
        
    print(f"\\n🚀 [2단계] 샘플 추출 테스트 진행 (검색결과: {INPUT_CSV})")
    df = pd.read_csv(INPUT_CSV)
    
    # 상위 2개 키워드만 테스트
    keywords = list(set([str(k) for k in df['파생키워드'].dropna() if len(str(k)) > 1]))
    keywords = keywords[:2]
    print(f"   - 타겟 키워드: {keywords}")
    
    sem = asyncio.Semaphore(CONCURRENCY)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True,
            geolocation={'latitude': TARGET_LATITUDE, 'longitude': TARGET_LONGITUDE},
            permissions=['geolocation']
        )
        
        tasks = [fetch_complete_list(kw, context, sem, idx+1) for idx, kw in enumerate(keywords)]
        results = await asyncio.gather(*tasks)
        
        for blocked, kw, stores in results:
            if blocked or not stores:
                print(f"⚠️ [{kw}] 차단됨 또는 결과 없음.")
                continue
                
            safe_kw = kw.replace(" ", "_").replace("/", "")
            excel_filename = f"검색결과_샘플테스트_{safe_kw}.xlsx"
            excel_path = os.path.join(OUTPUT_DIR, excel_filename)
            
            df_res = pd.DataFrame(stores)[['키워드', '순위', '광고여부', '상호명', '카테고리', '주소', '네이버_플레이스_URL', '이미지_URL']]
            df_res.to_excel(excel_path, index=False)
            print(f"✅ [{kw}] 수집 완료 -> {len(stores)}개 상점 저장됨!")
            
            print("\\n================ [ 엑셀 추출 샘플 미리보기 (첫 3개) ] ================")
            print(df_res.head(3).to_string(index=False))
            print("======================================================================\\n")
            
        await browser.close()
        
    print(f"🏆 테스트 추출이 모두 완료되었습니다! (결과물 폴더: {OUTPUT_DIR})")

if __name__ == "__main__":
    asyncio.run(run_test())
