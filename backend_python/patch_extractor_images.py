with open("domains/scraping/full_list_extractor.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Evaluate 초기화 코드 추가
init_code_target = '''            prev_count = 0
            retries = 0'''
init_code_replacement = '''            prev_count = 0
            retries = 0
            
            # [이미지 스크래핑 패치] 매 스크롤마다 가시 영역(Viewport)에 뜬 이미지들을 전역 변수에 누적 보관합니다.
            await page.evaluate("window.__dplog_images = {};")'''

content = content.replace(init_code_target, init_code_replacement)

# 2. 루프 내부에서 이미지 수집 코드 추가
scroll_wait_target = '''await page.wait_for_timeout(800)'''
scroll_wait_replacement = '''await page.wait_for_timeout(800)
                
                # 가려지기 전/나타난 직후의 썸네일을 캡처하여 보관
                await page.evaluate("""() => {
                    let items = document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL');
                    items.forEach(el => {
                        let nameEl = el.querySelector('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
                        if (!nameEl) return;
                        let name = nameEl.innerText.trim();
                        let img = el.querySelector('img');
                        let bgEl = el.querySelector('.K0PDV, .CBbl_');
                        let url = "";
                        if (img && img.src && !img.src.includes('data:image/gif') && !img.src.includes('data:image/svg')) {
                            url = img.src;
                        } else if (img && img.getAttribute('data-lazy')) {
                            url = img.getAttribute('data-lazy');
                        } else if (bgEl && bgEl.style && bgEl.style.backgroundImage) {
                            url = bgEl.style.backgroundImage.slice(5,-2).replace(/['"]/g, '');
                        }
                        if (url && !window.__dplog_images[name]) {
                            window.__dplog_images[name] = url;
                        }
                    });
                }""")'''

content = content.replace(scroll_wait_target, scroll_wait_replacement)

# 3. 최종 DOM 파싱 단계에서 window.__dplog_images 병합
img_parse_target = '''                    let imgUrl = "";
                    let allImages = el.querySelectorAll('img');'''
img_parse_replacement = '''                    // 누적된 전역 변수에서 최우선으로 이미지 매핑
                    let imgUrl = window.__dplog_images[name] || "";
                    let allImages = el.querySelectorAll('img');'''

content = content.replace(img_parse_target, img_parse_replacement)

with open("domains/scraping/full_list_extractor.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Extractor patched to accumulate images during scroll!")
