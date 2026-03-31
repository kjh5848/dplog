import asyncio
from playwright.async_api import async_playwright
import time

async def fetch_search_blocks(keyword, context, sem):
    """
    m.search.naver.com에 접속하여 무한 스크롤한 뒤,
    .api_subject_bx 단위별로 스마트블록/파워링크 여부를 확인하고
    본문 텍스트 통짜 덩어리를 긁어와서 반환합니다.
    """
    async with sem:
        try:
            page = await context.new_page()
            url = f"https://m.search.naver.com/search.naver?query={keyword}"
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2000)
            
            # 통합검색 화면 특성상 끝까지 내려가기 위한 스크롤
            for _ in range(15):
                await page.evaluate("window.scrollBy(0, 3000)")
                await page.wait_for_timeout(800)
                
            # DOM 내부 지면 파싱을 통해 스마트블록, 일반뷰, 파워링크 분리 및 추출
            blocks = await page.evaluate('''() => {
                let results = [];
                // 네이버 메인 검색의 각 주제별/스마트블록 단위 컨테이너들
                let sections = document.querySelectorAll('section.sc_new, div.api_subject_bx, section.sp_npremium');
                
                sections.forEach(sec => {
                    // 1. 지면 타이틀 추출 (맛집 인기글, 내돈내산 진짜 후기 등)
                    let titleEl = sec.querySelector('.api_title_area h2.title, .title_area h2, h2.api_title, h2.title');
                    let blockName = titleEl ? titleEl.innerText.trim() : "일반 뷰(VIEW) / 블로그 / 웹문서";
                    
                    // 2. 파워링크 및 광고 특화 감지
                    let isAd = "N";
                    if (sec.classList.contains('sp_npremium') || sec.classList.contains('type_ad') || blockName.includes('파워링크') || sec.innerHTML.includes('광고ⓘ')) {
                        blockName = blockName === "일반 뷰(VIEW) / 블로그 / 웹문서" ? "파워링크 (통합검색)" : blockName + " (파워링크)";
                        isAd = "Y";
                    }
                    
                    // 3. 지면 안의 카드/리뷰 아이템 단위로 분리
                    let items = sec.querySelectorAll('li.bx, div.total_wrap, div.api_ani_send');
                    // 만약 내부에 li 목록이 안보이면 섹션 자체를 1개짜리로 간주
                    if (items.length === 0) {
                       items = [sec];
                    }
                    
                    let rank = 1;
                    items.forEach(item => {
                        let textContent = item.innerText || item.textContent;
                        if (!textContent) return;
                        
                        // 텍스트 내 줄바꿈을 공백으로 합치고 정제
                        textContent = textContent.replace(/\\n/g, " ").replace(/ +/g, " ").trim();
                        
                        if (textContent.length > 5 && !textContent.includes("광고 신고")) {
                            results.push({
                                "지면명": blockName,
                                "순위": rank,
                                "광고여부": isAd,
                                "파싱텍스트": textContent
                            });
                            rank++;
                        }
                    });
                });
                return results;
            }''')
            
            return False, keyword, blocks
        except Exception as e:
            print(f"[Engine B Error] {keyword}: {e}")
            return True, keyword, []
        finally:
            await page.close()

# Engine B 스캐너 총괄 코어 함수
async def run_search_engine(keywords_list: list, concurrency: int = 8):
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
            is_mobile=True, has_touch=True
        )
        
        # 청크 단위 처리
        for i in range(0, len(keywords_list), concurrency):
            chunk = keywords_list[i:i+concurrency]
            tasks = [fetch_search_blocks(kw, context, sem) for kw in chunk]
            
            results = await asyncio.gather(*tasks)
            
            for blocked, kw, blocks in results:
                if blocked or not blocks:
                    continue
                # 키워드 매핑 후 전체 리스트에 합산
                for b in blocks:
                    b['키워드'] = kw
                all_extracted_data.extend(blocks)
                
            await asyncio.sleep(1.5)
            
        await browser.close()
    
    return all_extracted_data

if __name__ == "__main__":
    # 개별 테스트용
    async def test():
        arr = await run_search_engine(["전포동 이자카야"], concurrency=1)
        for r in arr[:5]:
            print(r)
        print(f"Total Block Items parsed: {len(arr)}")
    asyncio.run(test())
