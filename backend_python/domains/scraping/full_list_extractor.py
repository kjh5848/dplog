"""[하이브리드-안정성 최강] 브라우저는 띄우되 화면(DOM)을 직접 파싱하지 않고, 백그라운드 네트워크 패킷(GraphQL JSON)과 초기 상태(INITIAL_STATE)를 스니핑하여 무결점의 JSON 데이터를 반환합니다."""

import asyncio
from playwright.async_api import async_playwright
import time
import os
import random
import json

USER_AGENTS = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-F731N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
]

# JSON 항목(사업체)을 파싱하여 정규화된 dict로 변환하는 람다 함수 (AD와 Organic 모두 처리)
def parse_business(b, is_ad=False):
    # GraphQL JSON 구조에서 안전하게 필드 추출
    name = b.get("name") or b.get("title") or "알수없음"
    category = b.get("category", "") or ",".join(b.get("categories", []))
    
    # 이미지 파싱 (멀티 또는 단일)
    img_url = ""
    if b.get("imageUrl"):
        img_url = b.get("imageUrl")
    elif b.get("images") and len(b.get("images")) > 0:
        img_url = b.get("images")[0].get("url", "")
    
    # URL 파싱
    place_id = b.get("id")
    place_url = f"https://m.place.naver.com/restaurant/{place_id}/home" if place_id else ""
    if not place_url and b.get("link"):
        place_url = b.get("link") # 광고용 랜딩 주소 추락 대비
        
    rating = str(b.get("visitorReviewScore", "0"))
    if not rating or rating == "None":
        rating = "0"
        
    address = b.get("address", "") or b.get("roadAddress", "")
    
    # 리뷰 계산
    visitor_review = str(b.get("visitorReviewCount", "0"))
    blog_review = str(b.get("blogArticleCount", "0"))
    saves = str(b.get("bookmarkCount", "0"))
    if not saves or saves == "None":
        saves = "0"
        
    is_ad_str = "Y(광고)" if is_ad else "N"
    
    # 광고 아이템의 경우 "isAd" 플래그나 tag 등에 들어있을 수 있음
    if b.get("isAd") or b.get("adType") or b.get("promoted"):
        is_ad_str = "Y(광고)"
        
    return {
        "상호명": name,
        "광고여부": is_ad_str,
        "카테고": category,
        "주소": address,
        "방문자리뷰": visitor_review,
        "블로그리뷰": blog_review,
        "저장수": saves,
        "평점": rating,
        "네이버_플레이스_URL": place_url,
        "이미지_URL": img_url
    }

async def fetch_complete_list(keyword, browser, sem, search_num, target_lat, target_lon, max_scroll=80, target_store_name=None):
    async with sem:
        base_delay = ((search_num - 1) % 8) * 0.5
        jitter = random.uniform(0.1, 0.6)
        delay = base_delay + jitter
        await asyncio.sleep(delay)
        
        context = await browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True,
            geolocation={'latitude': target_lat, 'longitude': target_lon} if target_lat and target_lon else None,
            permissions=['geolocation']
        )
        try:
            page = await context.new_page()
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # --- 네트워크 인터셉터 코어 시작 ---
            network_stores = []
            
            async def handle_response(response):
                if response.url and "graphql" in response.url.lower():
                    try:
                        # 간혹 preflight 옵션은 무시
                        if response.request.method == "OPTIONS": return
                        
                        data = await response.json()
                        # GraphQL 응답은 대개 [{'data': ...}] 배열이거나 단일 객체임
                        payloads = data if isinstance(data, list) else [data]
                        
                        for p in payloads:
                            if not p or "data" not in p or not p["data"]: continue
                            
                            # 플레이스 리스트가 있는 여러 스키마 패턴을 검사
                            root = p["data"]
                            
                            # 1) placesSearch(보통 검색결과)
                            search_node = root.get("placesSearch") or root.get("search")
                            if search_node and "items" in search_node:
                                items = search_node["items"]
                            elif search_node and "places" in search_node:
                                items = search_node["places"]
                            else:
                                # 구조가 복잡할 수 있으므로 json 덤프스 니핑
                                json_str = json.dumps(root)
                                # "businesses" 나 "items"가 있으면 파싱 시도 (너무 무식하지만 정밀함)
                                pass 
                                
                            # 안전한 스니퍼 파싱 (재귀 탐색)
                            def find_businesses(obj):
                                found = []
                                if isinstance(obj, dict):
                                    if "businesses" in obj and isinstance(obj["businesses"], list):
                                        found.extend(obj["businesses"])
                                    elif "items" in obj and isinstance(obj["items"], list):
                                        # 아이템들 중에서 name이나 title이 있는 것만 (쓰레기 필터링)
                                        for it in obj["items"]:
                                            if isinstance(it, dict) and ("name" in it or "title" in it) and "id" in it:
                                                found.append(it)
                                    for k, v in obj.items():
                                        found.extend(find_businesses(v))
                                elif isinstance(obj, list):
                                    for item in obj:
                                        found.extend(find_businesses(item))
                                return found
                                
                            extracted = find_businesses(root)
                            for biz in extracted:
                                network_stores.append(parse_business(biz))
                                
                    except Exception as e:
                        pass # json파싱 에러시 무시 (비관련 리소스)

            page.on("response", handle_response)
            # --- 네트워크 인터셉터 코어 끝 ---
            
            url = f"https://m.place.naver.com/place/list?query={keyword}"
            await page.goto(url, wait_until="domcontentloaded", timeout=45000)
            await page.wait_for_timeout(3500)
            
            # 페이지에 박제된 초기 상태(INITIAL_STATE) 훔치기
            # (만약 스크롤 전 첫 번째 50개가 graphql 인터셉트에 안 걸리는 경우를 대비)
            initial_state_raw = await page.evaluate('''() => {
                try { return window.__INITIAL_STATE__ || {}; } catch(e) { return {}; }
            }''')
            
            def find_businesses_initial(obj):
                found = []
                if isinstance(obj, dict):
                    if "businesses" in obj and isinstance(obj["businesses"], list):
                        found.extend(obj["businesses"])
                    elif "items" in obj and isinstance(obj["items"], list):
                        for it in obj["items"]:
                            if isinstance(it, dict) and ("name" in it or "title" in it) and "id" in it:
                                found.append(it)
                    for k, v in obj.items():
                        found.extend(find_businesses_initial(v))
                elif isinstance(obj, list):
                    for item in obj:
                        found.extend(find_businesses_initial(item))
                return found

            init_extracted = find_businesses_initial(initial_state_raw)
            for biz in init_extracted:
                network_stores.append(parse_business(biz))

            # [스크롤 액션 시작] - 가상돔 걱정 없이 휙휙 내리기만 하면 백그라운드로 JSON이 쌓임
            prev_length = 0
            retries = 0
            for i in range(max_scroll):
                # 네트워크 통신이 발생하도록 가장 밑바닥까지 끝까지 스크롤
                await page.evaluate('''() => {
                    let div = document.querySelector('#_pcmap_list_scroll_container') || document.querySelector('.scrolling_dir');
                    if (div) { div.scrollTop = div.scrollHeight; } 
                    else { window.scrollTo(0, document.body.scrollHeight); }
                }''')
                await page.wait_for_timeout(1000)
                
                # 조기 종료 체크
                curr_length = len(network_stores)
                if curr_length == prev_length:
                    retries += 1
                    if retries >= 3:
                        break # 새로운 데이터가 더 이상 로드되지 않음
                else:
                    retries = 0
                    
                prev_length = curr_length
                
                if target_store_name and any(target_store_name in s["상호명"] for s in network_stores):
                    await page.wait_for_timeout(1000) # 끝자락 패킷 수신 대기
                    break
                    
            await page.wait_for_timeout(1000) # 잔여 통신 처리 대기
            
            # 방어된 데이터 체크 로직
            page_text = await page.content()
            if "서비스 이용이 제한되었습니다" in page_text or "과도한 접근" in page_text:
                return True, keyword, []

            # 중복 제거 (이름 + ID 기준)
            unique_stores = {}
            for st in network_stores:
                key = f"{st['상호명']}_{st['네이버_플레이스_URL']}"
                if key not in unique_stores:
                    unique_stores[key] = st
            
            final_stores = list(unique_stores.values())
            
            if not final_stores:
                return False, keyword, []
                
            # 순위 매기기 (광고/오가닉 독립 채점)
            organic_index = 1
            for i, st in enumerate(final_stores):
                st["절대순위"] = i + 1
                if "Y" in st["광고여부"]:
                    st["순위"] = i + 1 
                else:
                    st["순위"] = organic_index 
                    organic_index += 1
                st["키워드"] = keyword
                
            return False, keyword, final_stores
            
        except Exception as e:
            import traceback
            print(f"[Scraping Error] fetch_complete_list failed for '{keyword}':", e)
            traceback.print_exc()
            return True, keyword, []
        finally:
            try:
                await page.close()
            except: pass
            await context.close()

# 외부에서 Import 하여 실행 가능한 범용 엔진 함수
async def run_engine(keywords_list, concurrency=8, target_lat=None, target_lon=None, max_scroll=80, target_store_name=None):
    sem = asyncio.Semaphore(concurrency)
    all_extracted_data = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        
        for i in range(0, len(keywords_list), concurrency):
            chunk = keywords_list[i:i+concurrency]
            tasks = [fetch_complete_list(kw, browser, sem, i+idx+1, target_lat, target_lon, max_scroll, target_store_name) for idx, kw in enumerate(chunk)]
            
            results = await asyncio.gather(*tasks)
            
            for blocked, kw, stores in results:
                if blocked:
                    continue
                if not stores:
                    continue
                all_extracted_data.extend(stores)
                
            await asyncio.sleep(1.5)
            
        await browser.close()
        
    return all_extracted_data
