"""16GB 메모리 환경의 노트북에서 브라우저 동시 띄우기 메모리 폭발 한계를 벤치마킹하는 스크립트입니다."""

import asyncio
import time
import json
import urllib.request
from playwright.async_api import async_playwright
import pandas as pd

# 타겟 매장명
TARGET_STORE = "푸짐한뒷고기"

# 테스트용 대량 키워드 (기존 70개 베이스 * 2배 뻥튀기 = 총 140개)
BASE_KEYWORDS = [
    "시청고기집", "시청뒷고기", "연산동뒷고기", "시청역회식", "부산시청삼겹살",
    "부산시청가성비맛집", "거제시장맛집", "연산동고기집", "시청역삼겹살", "부산시청고기집",
    "시청역고기집", "거제동맛집", "연제구맛집", "양정맛집", "연산맛집",
    "시청역맛집", "부산시청역맛집", "연제구고기집", "부산비오는날맛집", "부산가성비고기집",
    "부산회식장소추천", "부산시청회식", "연산동회식", "부산시청술집", "시청역술집",
    "부산시청저녁", "연산동저녁", "부산시청데이트", "시청데이트", "거제동고기집",
    "연산동가성비추천", "부산시청근처맛집", "부산시청주변맛집", "부산시청로컬맛집", "부산시청현지인맛집",
    "시청역가성비고기집", "연산동로컬맛집", "연산동현지인맛집", "부산교대맛집", "부산시청밥집",
    "부산특수부위맛집", "부산뒷고기맛집", "연산동뒷고기맛집", "시청역특수부위", "연산동특수부위",
    "하남스타필드 식당", "부천 1인 고기집", "인천시청 우대갈비", "제주시청 고기집", "대전 시청 맛집",
    "시청뒷고기", "화성시청 고기집 맛집", "부천 신중동 맛집", "화성시청 고기집", "부산시청 목살 고기집",
    "서울시청 고기집 추천", "인천시청 갈비", "부산시청 점심 고기집", "부산시청 주변 목살 고기집", "서울시청 맛있는 고기집",
    "오산시청 분위기 맛집", "부산시청 항정살 고기집 추천", "서울시청근처고기집", "대전 둔산동 서구 대전시청고기집 맛집", "제주 시청 고기집 어디가코",
    "오산 고기집 맛집", "부천시청 맛집", "부산시청 고기집", "부천시청역 고기집", "제주시청 고기집 추천",
    "부산시청 육회 고기집 추천", "서울 시청역 고기집"
]
# 16GB 램의 극한을 보기 위해 2배수로 강제 확장 (총 144개 키워드)
MASSIVE_KEYWORDS = BASE_KEYWORDS + [k + " 강제확장테스트" for k in BASE_KEYWORDS]

# 맥북 16GB RAM 전용 극단적 세마포어 (기존 15 -> 25)
# 브라우저 탭 25개가 동시에 메모리를 점유함 (대략 2.5GB RAM 할당 예상, 16GB면 널널함)
CONCURRENCY_LIMIT = 25
semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)

def get_public_ip():
    """현재 스크립트가 실행되는 로컬의 실제 공인 IP를 확인합니다."""
    try:
        url = "https://api.ipify.org?format=json"
        response = urllib.request.urlopen(url, timeout=5)
        data = json.loads(response.read().decode('utf-8'))
        return data.get("ip", "Unknown")
    except Exception as e:
        return f"Error Check: {e}"

async def get_target_store_ranking(keyword, context, index):
    """Playwright를 이용해 모바일 네이버 지도 검색결과를 파싱합니다."""
    async with semaphore:
        page = None
        try:
            page = await context.new_page()
            
            # W3C Webdriver 지문 삭제 (Stealth)
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            search_url = f"https://m.map.naver.com/search2/search.naver?query={keyword}"
            await page.goto(search_url, wait_until="domcontentloaded", timeout=12000)
            
            # Playwright API 네트워크 통신 대기
            try:
                await page.wait_for_response(lambda response: "search.naver" in response.url, timeout=3000)
                await asyncio.sleep(0.5) # DOM 렌더링 찰나의 순간 대기
            except:
                pass
                
            # React 상태 객체인 __APOLLO_STATE__ 추출
            state_json_str = await page.evaluate("() => JSON.stringify(window.__APOLLO_STATE__ || {})")
            apollo_state = json.loads(state_json_str)
            
            if not apollo_state:
                print(f"[{index}] ❌ '{keyword}' -> 검색결과 상태추출 실패 (캡차 또는 렌더링 딜레이)")
                return {"keyword": keyword, "ranking": -1, "competitor_top1": "", "competitor_top2": "", "competitor_top3": ""}
            
            place_list = []
            for key, value in apollo_state.items():
                if key.startswith("PlaceSummary:") and "name" in value:
                    place_list.append(value["name"])
            
            if not place_list:
                print(f"[{index}] ⚠️ '{keyword}' -> 노출되는 식당 없음")
                return {"keyword": keyword, "ranking": -1, "competitor_top1": "", "competitor_top2": "", "competitor_top3": ""}

            rank = -1
            for i, name in enumerate(place_list):
                if TARGET_STORE.replace(" ", "") in name.replace(" ", ""):
                    rank = i + 1
                    break
                    
            top1 = place_list[0] if len(place_list) > 0 else "-"
            top2 = place_list[1] if len(place_list) > 1 else "-"
            top3 = place_list[2] if len(place_list) > 2 else "-"

            if rank != -1:
                print(f"[{index}] 🟢 '{keyword}' -> 랭킹: {rank}위! (1위: {top1})")
            else:
                print(f"[{index}] 🔍 '{keyword}' -> 미노출 (1위: {top1})")

            return {
                "keyword": keyword,
                "ranking": rank if rank != -1 else "미노출",
                "competitor_top1": top1,
                "competitor_top2": top2,
                "competitor_top3": top3
            }

        except Exception as e:
            print(f"[{index}] 🚨 '{keyword}' -> 에러 발생 ({str(e)[:50]})")
            return {"keyword": keyword, "ranking": "에러", "competitor_top1": "", "competitor_top2": "", "competitor_top3": ""}
        finally:
            if page:
                await page.close()

async def main():
    print("=" * 60)
    print("🚀 [Mac 16GB RAM 극한 스트레스 테스트 & IP 확인]")
    print("=" * 60)
    
    current_ip = get_public_ip()
    print(f"[!] 현재 우회 없이 사용 중인 로컬 공인 IP: {current_ip}")
    print(f"[!] 병렬 렌더링(Concurrency) 제한: {CONCURRENCY_LIMIT}개 동시 탭")
    print(f"[!] 테스트 대상 키워드 수: {len(MASSIVE_KEYWORDS)}개")
    print("=" * 60)
    print("크롤링 폭격 시작! (메모리 로딩 대기중...)\n")

    start_time = time.time()
    results = []
    
    async with async_playwright() as p:
        # Args: 크롬 자동화 탐지(AutomationControlled) 무력화 플래그
        browser = await p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        # 아이폰 16 사용자 에이전트로 완전 위장 (가정용 IP + 아이폰 결합)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={"width": 393, "height": 852},
            is_mobile=True,
            has_touch=True
        )

        tasks = []
        for index, keyword in enumerate(MASSIVE_KEYWORDS, start=1):
            tasks.append(get_target_store_ranking(keyword, context, index))
            
        gathered_data = await asyncio.gather(*tasks)
        results.extend(gathered_data)

        await browser.close()
        
    end_time = time.time()
    elapsed = end_time - start_time
    
    # 엑셀 저장
    df = pd.DataFrame(results)
    output_filename = "mac_16gb_stress_test_result.xlsx"
    df.to_excel(output_filename, index=False)
    
    print("\n" + "=" * 60)
    print(f"[*] 🏁 스트레스 테스트 종료!")
    print(f"[*] 총 소요시간: {elapsed:.2f}초")
    print(f"[*] 초당 렌더링 처리 속도: {len(MASSIVE_KEYWORDS)/elapsed:.2f}탭/초")
    print(f"[*] 엑셀 저장 완료: {output_filename}")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
