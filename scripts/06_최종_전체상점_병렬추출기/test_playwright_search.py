import asyncio
from playwright.async_api import async_playwright
import time

async def main():
    start_time = time.time()
    query = "이제여기카페"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # PC 통합 검색 -> "지도" 탭 대신, 바로 map.naver.com 접속
        url = f"https://map.naver.com/p/search/{query}"
        await page.goto(url, wait_until="networkidle")
        
        # 지도 좌측 검색 결과 Iframe 찾기
        await page.wait_for_selector('iframe#searchIframe')
        frame_element = await page.query_selector('iframe#searchIframe')
        search_frame = await frame_element.content_frame()
        
        # 목록 대기
        await search_frame.wait_for_selector('.place_bluelink', timeout=5000)
        
        # 리스트 아이템 추출
        # 보통 검색결과 아이템은 '<li class="UEzoS">' 같은 태그 안에 있다.
        items = await search_frame.query_selector_all('li[data-laqe]') # data-laqe 속성에는 장소 정보가 담길 때가 있음
        
        # 범용적으로 place_bluelink(상호명 a태그) 찾기
        links = await search_frame.query_selector_all('.place_bluelink')
        results = []
        for a in links:
            name = await a.inner_text()
            
            # 여기서 최상위 li를 찾아 기타 정보도 읽을 수 있다 (평점, 카테고리 등)
            li_handle = await a.evaluate_handle('el => el.closest("li")')
            if li_handle:
                # address (지번 등등 - ex: "Csm5Q" 등에 있음, 보통 마지막 div)
                addr_el = await li_handle.query_selector('span:has-text("로"), span:has-text("읍"), span:has-text("동")')
                category_el = await li_handle.query_selector('.KCMnt') # 카테고리 (가변 클래스)
            
            # href가 없어도 data-id가 부모나 자신에게 묶여있을 수 있음
            href = ""     
            # PC map.naver.com/v5 에선 href가 없는 경우가 많다!
            # 대신 a태그 클릭시 iframe 전환됨. 링크 따기 복잡함.
            
        await browser.close()
        print(f"Time: {time.time()-start_time}s")
        
asyncio.run(main())
