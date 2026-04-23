with open("domains/scraping/full_list_extractor.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the scrolling loop to scroll the inner container instead of window
scroll_target = '''            for _ in range(max_scroll): # 최대 스크롤 횟수 (방어적)
                await page.evaluate("window.scrollBy(0, 1500)")
                await page.wait_for_timeout(800)'''

scroll_replacement = '''            for _ in range(max_scroll): # 최대 스크롤 횟수 (방어적)
                await page.evaluate("""() => {
                    // 네이버 플레이스 모바일에선 창(window)이 아닌 내부 특정 div가 스크롤됩니다.
                    let scroller = document.querySelector('#_pcmap_list_scroll_container');
                    if (!scroller) {
                        // 스크롤 가능한 가장 큰 영역 찾기
                        let divs = Array.from(document.querySelectorAll('div, ul'));
                        scroller = divs.find(d => d.scrollHeight - d.clientHeight > 1000);
                    }
                    if (scroller) {
                        scroller.scrollBy(0, 800); // 부드럽게 스크롤하여 Lazy 로딩 유발
                    } else {
                        window.scrollBy(0, 800);
                    }
                }""")
                await page.wait_for_timeout(1000)'''

content = content.replace(scroll_target, scroll_replacement)
with open("domains/scraping/full_list_extractor.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Scroller patched successfully")
