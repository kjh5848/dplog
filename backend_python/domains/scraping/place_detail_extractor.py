import asyncio
from playwright.async_api import async_playwright
import time
import re

def _parse_id(s: str):
    import re
    match = re.search(r'(?:place|restaurant|hairshop|hospital|v5/search/.+?/place|p/search/.*?/place|p/entry/place)/(\d+)', s)
    return match.group(1) if match else None

async def extract_place_id(input_str: str) -> str:
    """
    URL에서 플레이스 ID를 파싱합니다.
    naver.me 단축URL이나 다양한 도메인 형태를 모두 지원하기 위해 리다이렉트를 자동 추적합니다.
    """
    input_str = input_str.strip()
    if input_str.isdigit(): return input_str

    # 1. 1차 정규식 추출 시도
    pid = _parse_id(input_str)
    if pid: return pid

    # 2. 실패 시 리다이렉트 최종 URL 추적
    if input_str.startswith("http"):
        try:
            import httpx
            async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
                resp = await client.get(input_str, headers={'User-Agent': 'Mozilla/5.0'})
                pid = _parse_id(str(resp.url))
                if pid: return pid
        except Exception as e:
            print(f"[extract_place_id] URL 자동 해석 실패: {e}")
            
    return input_str # 폴백

_SCORE_CACHE = {}
_CACHE_TTL = 600 # 10분

async def scrape_place_details(place_id: str):
    """
    네이버 플레이스 단일 상점의 상세 정보(카테고리, 리뷰 수, 텍스트)를 딥 스크래핑합니다.
    """
    place_id_clean = await extract_place_id(place_id)
    
    # 10분 단위 캐시 히트 체크
    now = time.time()
    if place_id_clean in _SCORE_CACHE:
        cached_data, timestamp = _SCORE_CACHE[place_id_clean]
        if now - timestamp < _CACHE_TTL:
            print(f"⚡ [Cache Hit] 상세 딥-스크래핑 10분 캐시 반환 (남은시간: {int(_CACHE_TTL - (now - timestamp))}초) - {place_id_clean}")
            return cached_data
            
    home_url = f"https://m.place.naver.com/place/{place_id_clean}/home"
    review_url = f"https://m.place.naver.com/place/{place_id_clean}/review/visitor"

    result = {
        "place_id": place_id_clean,
        "name": "",
        "category": "",
        "address": "",
        "visitor_reviews": 0,
        "blog_reviews": 0,
        "saves": 0,   # 최근 네이버 앱 정책으로 웹 DOM에서 숨겨지는 경우가 많음
        "rating": 0.0,
        "recent_reviews": [],
        "suggested_keywords": [] # 자동 진단을 위한 키워드 조합
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True
        )

        try:
            page = await context.new_page()
            await page.goto(home_url, wait_until="networkidle", timeout=15000)
            await page.wait_for_timeout(2000)

            # --- 1. 기본 정보 추출 (홈) ---
            # og:title 에서 이름과 카테고리 추출 (가장 안정적)
            await page.wait_for_selector("meta[property='og:title']", state="attached", timeout=5000)
            og_title = await page.locator("meta[property='og:title']").get_attribute("content")
            if og_title:
                result["name"] = og_title.split(" :")[0].strip()

            try:
                # 여러 대표 이미지 고해상도로 추출 및 쉼표(,) 구분 저장
                image_urls_raw = await page.evaluate("""
                    () => {
                        const bgs = Array.from(document.querySelectorAll('div, a'))
                            .map(el => window.getComputedStyle(el).backgroundImage)
                            .filter(bg => bg && bg.includes('search.pstatic.net') && bg !== 'none')
                            .map(bg => bg.replace(/^url\\(['"]?/, '').replace(/['"]?\\)$/, ''));
                        const imgs = Array.from(document.querySelectorAll('img'))
                            .map(el => el.src)
                            .filter(src => src && src.includes('search.pstatic.net'));
                        return [...bgs, ...imgs];
                    }
                """)
                
                try:
                    meta_img = await page.locator("meta[property='og:image']").get_attribute("content")
                    if meta_img:
                        image_urls_raw.insert(0, meta_img)
                except Exception:
                    pass
                
                unique_urls = []
                for u in image_urls_raw:
                    u = u.replace('&amp;', '&')
                    if 'phinf.pstatic.net' not in u and 'search.pstatic.net' not in u:
                        continue
                    
                    # search.pstatic.net 래퍼일 경우 원본 src 추출
                    import urllib.parse
                    src_match = re.search(r'src=([^&]+)', u)
                    if src_match:
                        u = urllib.parse.unquote(src_match.group(1))
                    else:
                        # 래퍼가 아니면 썸네일을 큰 포맷으로 혹시 변경 (일부 썸네일 경로)
                        u = re.sub(r'type=[a-zA-Z0-9_]+', 'type=w640_auto', u)
                        
                    if u not in unique_urls:
                        unique_urls.append(u)
                        
                if unique_urls:
                    result["shopImageUrl"] = ",".join(unique_urls[:5]) # 최대 5개 저장
            except Exception as e:
                print(f"[메타 파싱 에러] 다중 이미지 추출 중 에러: {e}")

            try:
                # og:description 에서 리뷰수 추출
                await page.wait_for_selector("meta[property='og:description']", state="attached", timeout=3000)
                og_desc = await page.locator("meta[property='og:description']").get_attribute("content")
                if og_desc:
                    v_match = re.search(r'방문자리뷰\s*([0-9,]+)', og_desc)
                    b_match = re.search(r'블로그리뷰\s*([0-9,]+)', og_desc)
                    if v_match: result['visitor_reviews'] = int(v_match.group(1).replace(",", ""))
                    if b_match: result['blog_reviews'] = int(b_match.group(1).replace(",", ""))
            except Exception as e:
                print(f"[메타 파싱 에러] og:description 없음, HTML 정규식으로 우회합니다.")

            # HTML 전문 정규식 파싱 (DOM 클래스 변경에 완벽히 대응하는 안정적 방법)
            try:
                html = await page.content()
                
                # 리뷰수 폴백 (og:desc 실패 시 html 정규식으로)
                if result.get('visitor_reviews', 0) == 0:
                    v_match = re.search(r'방문자\s*리뷰\s*([0-9,]+)', html) or re.search(r'방문자리뷰.*?([0-9,]+)', html)
                    if v_match: result['visitor_reviews'] = int(v_match.group(1).replace(",", ""))
                
                if result.get('blog_reviews', 0) == 0:
                    b_match = re.search(r'블로그\s*리뷰\s*([0-9,]+)', html) or re.search(r'블로그리뷰.*?([0-9,]+)', html)
                    if b_match: result['blog_reviews'] = int(b_match.group(1).replace(",", ""))

                # 저장 수 (Saves) 추출 (유연한 정규식)
                save_match = re.search(r'저장(?:[^>]*>){1,3}([0-9,]+)', html)
                if save_match: result['saves'] = int(save_match.group(1).replace(",", ""))

                # 평점 (Rating) 파싱 (최근 별점 표시가 있는 경우)
                rating_match = None
                
                # 1. <span>별점</span>4.52</span> 형태
                m1 = re.search(r'>별점(?:</span>|</em>)\s*([0-9\.]+)\s*<', html)
                if m1:
                    rating_match = m1
                else:
                    # 2. <span>별점</span><span>4.52</span> 형태 
                    m2 = re.search(r'>별점(?:</span>|</em>)\s*<[^>]+>\s*([0-9\.]+)\s*<', html)
                    if m2:
                        rating_match = m2
                    else:
                        # 3. 텍스트로 '★ 4.52' 형태 추출 시도
                        m3 = re.search(r'★\s*([0-9\.]+)|별점\s*([0-9\.]+)', html)
                        if m3:
                            rating_match = m3
                            
                if rating_match:
                    try:
                        val = rating_match.group(1) if rating_match.lastindex >= 1 and rating_match.group(1) else rating_match.group(2)
                        result['rating'] = float(val)
                    except:
                        pass

                # 주소 (Address) 추출
                addr_match = re.search(r'주소</span>.*?<span class="[^"]*">([^<]+)</span>', html, re.DOTALL)
                if addr_match:
                    result["address"] = addr_match.group(1).strip()
                
                # 카테고리 (Category) 추출
                if result.get("name"):
                    name_esc = re.escape(result["name"])
                    cat_match = re.search(rf'class="[^"]*">{name_esc}</span><span class="[^"]*">([^<]+)</span>', html)
                    if cat_match:
                        result["category"] = cat_match.group(1).strip()
            except Exception as reg_e:
                print(f"HTML Regex parsing warning: {reg_e}")
            
            # 최소 포맷팅 폴백
            if not result.get("address"): result["address"] = "주소 파싱 불가"
            if not result.get("category"): result["category"] = "상점"

            # --- 자동 키워드 조합 로직 (Auto-Diagnosis 용) 보강 ---
            addr_parts = result["address"].split()
            dong_name = ""
            for part in addr_parts:
                if part.endswith('동') or part.endswith('구') or part.endswith('읍') or part.endswith('면') or part.endswith('리'):
                    dong_name = part
                    break
            
            # 명확한 행정구역명을 못 찾은 경우 도로명이나 앞부분 지역명 강제 사용
            if not dong_name and len(addr_parts) >= 2:
                dong_name = addr_parts[1]
            elif not dong_name:
                dong_name = result["name"].split()[0]  # 최후의 보루 (상호명 첫 단어)

            # 카테고리에서 메인 업종 뽑기 (예: "카페,디저트" -> ["카페", "디저트"])
            cat_parts = [c.strip() for c in result["category"].split(',') if c.strip()]
            if not cat_parts:
                cat_parts = ["맛집", "추천"] # 카테고리가 아예 없는 경우 방어

            # 동이름 + 카테고리 / 상호명 조합
            for c in cat_parts:
                result["suggested_keywords"].append(f"{dong_name} {c}")
                
            base_name = result["name"].split()[0]
            result["suggested_keywords"].append(f"{dong_name} {base_name}")
            
            # 카테고리 단독 검색어 추가
            if len(cat_parts) > 0 and dong_name != base_name:
                 result["suggested_keywords"].append(f"{base_name} {cat_parts[0]}")

            # 네이버 플레이스 직접 설정 '대표키워드' 파싱 (HTML 소스 내 keywordList + UI 해시태그)
            result["official_keywords"] = []
            try:
                import re as regex_lib
                import json as json_lib
                html_content = await page.content()
                
                # 1. 프레임 소스(Script) 내 keywordList 배열 추출 (가장 정확한 대표키워드)
                match = regex_lib.search(r'"keywordList"\s*:\s*(\[[^\]]*\])', html_content)
                if match:
                    try:
                        arr_str = match.group(1).replace("'", '"')
                        keywords_from_script = json_lib.loads(arr_str)
                        if isinstance(keywords_from_script, list):
                            result["official_keywords"].extend([k for k in keywords_from_script if k])
                    except:
                        pass
                
                # 2. UI에 화면 렌더링된 #태그 추출 (서브/보완 수단)
                official_keywords_ui = await page.evaluate('''() => {
                    return Array.from(document.querySelectorAll('span, a, strong, div'))
                                .map(el => el.innerText ? el.innerText.trim() : "")
                                .filter(t => t.startsWith('#') && t.length > 2 && t.length < 15 && !t.includes('\\n'))
                                .map(t => t.replace('#', '').trim());
                }''')
                if official_keywords_ui:
                    result["official_keywords"].extend([k for k in official_keywords_ui if k])
                    
                # 중복 제거 및 UI에 반영
                result["official_keywords"] = list(set([k.strip() for k in result["official_keywords"] if k and len(k.strip()) > 0]))
                
                # 검색 조회수 API를 돌릴 키워드 풀(suggested_keywords)에도 병합
                result["suggested_keywords"].extend(result["official_keywords"])
            except Exception as e:
                pass

            result["suggested_keywords"] = list(set([k for k in result["suggested_keywords"] if k and len(k) > 1])) # 중복/빈값 제거

            # --- 2. 리뷰 실제 원문 & 서브탭(태그) 추출하기 ---
            # 直接 URL 로딩 시 렌더링이 안되는 이슈 해결을 위해, 홈 화면에서 '리뷰' 탭을 직접 클릭합니다.
            try:
                review_tab = page.locator('a[role="tab"]:has-text("리뷰")')
                if await review_tab.count() > 0:
                    await review_tab.first.click()
                else:
                    await page.goto(review_url, wait_until="networkidle", timeout=15000)
            except Exception as e:
                print(f"Tab click failed: {e}")
                await page.goto(review_url, wait_until="networkidle", timeout=15000)

            # 데이터 지연 로딩 방지를 위한 스크롤 트리거
            await page.wait_for_timeout(2000)
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight/2)')
            await page.wait_for_timeout(2000)
            
            # 2-1) 서브탭 분석 (주요 리뷰 키워드 추출)
            # 수많은 a 속성 요소중 span이 숫자를 포함하는 태그형 버튼들을 휴리스틱하게 수집
            sub_tabs_data = await page.evaluate('''() => {
                let result = {};
                let buttons = document.querySelectorAll('a[role="button"], div[role="button"]');
                
                buttons.forEach(btn => {
                    let spans = btn.querySelectorAll('span');
                    if(spans.length >= 2) {
                        let name = spans[spans.length - 2].innerText.trim() || spans[0].innerText.trim();
                        let countStr = spans[spans.length - 1].innerText.trim();
                        let count = parseInt(countStr.replace(/,/g, ''), 10);
                        
                        if(!isNaN(count) && count > 0 && name.length <= 15 && !name.includes('\\n')) {
                            // 통계를 위한 태그 버튼 감지 성공
                            let category = "인기 키워드";
                            
                            // Heuristic: 가장 가까운 상단 컨테이너의 제목을 카테고리로 획득 시도
                            let container = btn.closest('.place_section, .place_tab_shadow, ul');
                            if(container) {
                                let possibleTitle = container.querySelector('span.iojYi, h2, h3, strong');
                                if(possibleTitle && possibleTitle.innerText.length < 10) {
                                                                       category = possibleTitle.innerText.trim();
                                }
                            }
                            
                            if(!result[category]) result[category] = [];
                            // 중복 방지
                            if(!result[category].find(t => t.name === name)) {
                                result[category].push({name: name, count: count});
                            }
                        }
                    }
                });
                return result;
            }''')
            
            result["review_tags"] = sub_tabs_data

            # 2-2) 긴 텍스트 리뷰 본문 추출
            spans = await page.evaluate('''() => {
                let nodes = Array.from(document.querySelectorAll('a[data-pui-click-code="rvshowmore"]'));
                let results = nodes.map(n => n.innerText.replace('더보기', '').trim()).filter(t => t.length > 10);
                
                if (results.length === 0) {
                    let container = document.querySelector('ul.eLki3, ul#_review_list');
                    if (container) {
                        Array.from(container.querySelectorAll('li')).forEach(li => {
                            let longestText = '';
                            li.querySelectorAll('div, a, span').forEach(el => {
                                let t = el.innerText ? el.innerText.trim() : '';
                                if (t.length > longestText.length && t.length < 500 && !t.includes('방문일') && !t.includes('영수증')) {
                                    longestText = t;
                                }
                            });
                            if (longestText) results.push(longestText);
                        });
                    }
                }
                return results;
            }''')
            
            unique_reviews = []
            for t in spans:
                if t not in unique_reviews and not t.startswith("리뷰"):
                    clean_t = " ".join(t.split())
                    unique_reviews.append(clean_t)
                    
            result["recent_reviews"] = unique_reviews[:3]

        except Exception as e:
            print(f"[Deep Scrape Error] {e}")
        finally:
            await browser.close()

    # 캐시 저장
    _SCORE_CACHE[place_id_clean] = (result, time.time())
    return result

# 단독 테스트용 구문
if __name__ == "__main__":
    import json
    res = asyncio.run(scrape_place_details("1607631456"))
    print(json.dumps(res, indent=2, ensure_ascii=False))
