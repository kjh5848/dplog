import urllib.request
import urllib.parse
import json
import re
import asyncio
from playwright.async_api import async_playwright
import httpx

async def get_autocomplete(keyword: str) -> list[str]:
    """네이버 비공식 자동완성 API를 호출하여 파생 키워드 배열 반환"""
    encoded = urllib.parse.quote(keyword)
    url = f"https://ac.search.naver.com/nx/ac?q={encoded}&con=1&rev=4&q_enc=UTF-8&st=100&r_format=json&t_koreng=1"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if 'items' in data and len(data['items']) > 0:
                    # 첫 번째 배열안의 배열 0번째 인덱스가 키워드
                    all_auto_kws = [item[0] for item in data['items'][0]] 
                    return all_auto_kws
    except Exception as e:
        print(f"[자동완성 에러] {keyword}: {e}")
    return []

async def get_related(keyword: str) -> list[str]:
    """네이버 모바일 통합검색 HTML에서 연관검색어 정규식 파싱"""
    encoded = urllib.parse.quote(keyword)
    url = f"https://m.search.naver.com/search.naver?query={encoded}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers=headers)
            html = resp.text
            
            # 1. 연관검색어 (새로운 모바일 UI 대응)
            area_match = re.search(r'<div class="keyword _rk_hcheck">(.*?)</div>', html, re.DOTALL)
            if area_match:
                container = area_match.group(1)
                texts = re.findall(r'</i>([^<]+)</a>', container)
                if texts: return [t.strip() for t in texts if t.strip()]
            
            # 2. 구버전 모바일 UI 폴백
            area_match2 = re.search(r'<div class="lst_related_srch_wrap">(.+?)</div>\s*</div>', html, re.DOTALL)
            if not area_match2:
                area_match2 = re.search(r'<ul class(?:.*?)lst_related_srch(.*?)</ul>', html, re.DOTALL)
                
            if area_match2:
                container = area_match2.group(0)
                texts = re.findall(r'<div class="tit">([^<]+)</div>', container)
                if texts: return texts
                texts2 = re.findall(r'>([^<]+)</a>', container)
                texts2 = [t.strip() for t in texts2 if t.strip() and "<" not in t]
                if texts2: return texts2
    except Exception as e:
        print(f"[연관검색어 에러] {keyword}: {e}")
    return []

async def get_mobile_recommendations(keyword: str) -> dict:
    """메인 키워드 한정: 브라우저를 띄워 '함께 많이 찾는', '함께 보면 좋은' 탭 내의 식당/장소명 파싱"""
    encoded = urllib.parse.quote(keyword)
    url = f"https://m.search.naver.com/search.naver?query={encoded}"
    
    results = { "많이찾는": [], "보면좋은": [] }
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
                viewport={'width': 390, 'height': 844}
            )
            page = await context.new_page()
            
            # 리소스 최적화: 일부 리소스만 허용하되, 모바일 UI 렌더링을 위해 CSS 추가 허용
            await page.route("**/*", lambda route: route.continue_() if route.request.resource_type in ["document", "script", "xhr", "fetch", "stylesheet"] else route.abort())
            
            await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            await page.evaluate("window.scrollBy(0, 1500)")
            await page.wait_for_timeout(1500) # JS 렌더링 대기
            
            js_code = """
            () => {
                let res = { "많이찾는": [], "보면좋은": [] };
                const extractSection = (headerText) => {
                    let texts = new Set();
                    let headers = Array.from(document.querySelectorAll('span, h2, h3')).filter(e => e.innerText && e.innerText.trim() === headerText);
                    if(headers.length > 0) {
                        let iter = headers[0];
                        let container = null;
                        for(let i=0; i<5; i++){
                            if(iter.parentElement) {
                                iter = iter.parentElement;
                                if(iter.querySelectorAll('a').length > 3) {
                                    container = iter;
                                    break;
                                }
                            }
                        }
                        if(container) {
                            let items = container.querySelectorAll('a');
                            items.forEach(i => {
                                let text = i.innerText.trim().replace(/요즘 인기|\.\.\./g, "").trim();
                                if(text && text.length > 1 && text !== headerText && !text.includes("정보확인")) {
                                    texts.add(text);
                                }
                            });
                        }
                    }
                    return Array.from(texts);
                };
                res['많이찾는'] = extractSection("함께 많이 찾는");
                res['보면좋은'] = extractSection("함께 보면 좋은");
                return res;
            }
            """
            
            data = await page.evaluate(js_code)
            results = data
            await browser.close()
    except Exception as e:
        print(f"[함께찾는집 에러] {keyword}: {e}")
        
    return results

async def discover_customer_journey(base_keyword: str) -> list[dict]:
    """사용자 합의 플로우: Depth 1(전체) -> Depth 2(선택적 API만)를 거쳐 계층 정보가 담긴 유니버스 세트로 리턴"""
    print(f"🚀 [Depth 1] 타겟 메인키워드 '{base_keyword}' 거미줄 파싱 시작...")
    
    universe = {}  # key: keyword, value: {"keyword": kw, "parent": parent, "depth": n}
    
    # 0. 메인 키워드 그 자체도 반드시 분석 대상에 포함 (노출 여부, 검색량 필수)
    universe[base_keyword] = {"keyword": base_keyword, "parent": "사용자 입력", "depth": 0}
    
    def add_to_universe(kw: str, parent: str, depth: int):
        if kw and kw not in universe:
            universe[kw] = {"keyword": kw, "parent": parent, "depth": depth}

    # 1. Depth 1 수집 (비동기 병렬)
    auto_task = get_autocomplete(base_keyword)
    rel_task = get_related(base_keyword)
    ui_task = get_mobile_recommendations(base_keyword)
    
    depth1_autos, depth1_rels, depth1_uis = await asyncio.gather(auto_task, rel_task, ui_task)
    
    # 객체 삽입 (Depth 1은 모두 부모가 base_keyword)
    for kw in depth1_autos: add_to_universe(kw, base_keyword, 1)
    for kw in depth1_rels: add_to_universe(kw, base_keyword, 1)
    for kw in depth1_uis.get("많이찾는", []): add_to_universe(kw, base_keyword, 1)
    for kw in depth1_uis.get("보면좋은", []): add_to_universe(kw, base_keyword, 1)
    
    depth1_keywords = list(universe.keys())
    print(f"✅ [Depth 1 완료] 총 {len(depth1_keywords)}개의 1차 검색 동선 확보")
    
    # 2. Depth 2 수집 (Depth 1에서 나온 키워드들만 대상)
    print(f"🚀 [Depth 2] 1계층에서 파생된 {len(depth1_keywords)}개의 단어들에 대해 재귀 파싱 시작 (함께찾는 탭 생략)...")
    
    tasks = []
    task_parents = []
    for d1_kw in depth1_keywords:
        tasks.append(get_autocomplete(d1_kw))
        task_parents.append(d1_kw)
        tasks.append(get_related(d1_kw))
        task_parents.append(d1_kw)
    
    # 병렬 융단 폭격
    depth2_results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for res, parent_kw in zip(depth2_results, task_parents):
        if isinstance(res, list):
            for kw in res:
                add_to_universe(kw, parent_kw, 2)
                
    final_list = list(universe.values())
    print(f"🎯 [동선 파이프라인 완료] 총 {len(final_list)}개의 거대한 파생 키워드 유니버스가 발굴되었습니다.")
    return final_list

if __name__ == "__main__":
    # 단독 테스트 코드
    async def run_test():
        res = await discover_customer_journey("서면 고기집")
        print("최종 도출된 타겟 키워드 리스트:", res)
    asyncio.run(run_test())
