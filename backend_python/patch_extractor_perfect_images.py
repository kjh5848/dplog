with open("domains/scraping/full_list_extractor.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the final page.evaluate to be async and scroll item-by-item
target = '''            # 모든 DOM이 렌더링된 현 시점의 List 박스들을 순회하며 각 5개의 필드를 채굴
            stores = await page.evaluate(\'''() => {
                let items = document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL');
                // 혹시 클래스명이 모두 바뀌었을 경우를 방지하는 Fallback: 제일 긴 리스트 컨테이너 내의 li
                if(items.length === 0) {
                    let ul = Array.from(document.querySelectorAll('ul')).sort((a,b) => b.children.length - a.children.length)[0];
                    if(ul) items = ul.children;
                }
                
                return Array.from(items).map(el => {
                    // 고유 상호명 (예: "애돈촌돼지국밥 부산시청본점")
                    let nameEl = el.querySelector('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
                    let name = nameEl ? nameEl.innerText.replace(/\\n/g, '').trim() : "알수없음";

                    // 누적된 전역 변수에서 최우선으로 이미지 매핑
                    let imgUrl = window.__dplog_images[name] || "";
                    let allImages = el.querySelectorAll('img');
                    for (let img of allImages) {
                        if (img.src && !img.src.includes('data:image/gif') && !img.src.includes('data:image/svg')) {
                            imgUrl = img.src;
                            break;
                        } else if (img.getAttribute('data-lazy')) {
                            imgUrl = img.getAttribute('data-lazy');
                            break;
                        }
                    }
                    if (!imgUrl) {
                        let bgEl = el.querySelector('.K0PDV, .CBbl_');
                        if (bgEl && bgEl.style && bgEl.style.backgroundImage) {
                            imgUrl = bgEl.style.backgroundImage.slice(5, -2).replace(/['"]/g, "");
                        }
                    }'''

replacement = '''            # 모든 DOM이 렌더링된 현 시점의 List 박스들을 순회하며 각 5개의 필드를 채굴
            stores = await page.evaluate(\'''async () => {
                let items = document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL');
                // 혹시 클래스명이 모두 바뀌었을 경우를 방지하는 Fallback: 제일 긴 리스트 컨테이너 내의 li
                if(items.length === 0) {
                    let ul = Array.from(document.querySelectorAll('ul')).sort((a,b) => b.children.length - a.children.length)[0];
                    if(ul) items = ul.children;
                }
                
                let results = [];
                for (let el of Array.from(items)) {
                    // 고유 상호명 (예: "애돈촌돼지국밥 부산시청본점")
                    let nameEl = el.querySelector('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
                    let name = nameEl ? nameEl.innerText.replace(/\\n/g, '').trim() : "알수없음";
                    if (name === "알수없음") continue;

                    // 1) 즉시 탐색
                    let imgUrl = window.__dplog_images && window.__dplog_images[name] ? window.__dplog_images[name] : "";
                    
                    // 2) 가상 DOM 갱신을 위해 뷰포트로 요소 끌고 오기 (정밀 스크롤)
                    if (!imgUrl) {
                        el.scrollIntoView({ block: "center" });
                        // 약간 대기하여 React Virtual DOM이 img를 그릴 시간을 확보
                        await new Promise(r => setTimeout(r, 60)); 
                    }
                    
                    let allImages = el.querySelectorAll('img');
                    for (let img of allImages) {
                        if (img.src && !img.src.includes('data:image/gif') && !img.src.includes('data:image/svg')) {
                            imgUrl = img.src;
                            break;
                        } else if (img.getAttribute('data-lazy')) {
                            imgUrl = img.getAttribute('data-lazy');
                            break;
                        }
                    }
                    if (!imgUrl) {
                        let bgEl = el.querySelector('.K0PDV, .CBbl_');
                        if (bgEl && bgEl.style && bgEl.style.backgroundImage) {
                            imgUrl = bgEl.style.backgroundImage.slice(5, -2).replace(/['"]/g, "");
                        }
                    }'''

if target in content:
    content = content.replace(target, replacement)
    
    # Also fix the end of evaluate
    end_target = '''                    return {
                        "상호명": name,
                        "광고여부": isAd,
                        "카테고리": category,
                        "주소": address,
                        "방문자리뷰": visitorReview,
                        "블로그리뷰": blogReview,
                        "저장수": saves,
                        "평점": rating,
                        "네이버_플레이스_URL": placeUrl,
                        "이미지_URL": imgUrl
                    };
                }).filter(x => x['상호명'] !== "알수없음");
            }\''')'''

    end_replacement = '''                    results.push({
                        "상호명": name,
                        "광고여부": isAd,
                        "카테고리": category,
                        "주소": address,
                        "방문자리뷰": visitorReview,
                        "블로그리뷰": blogReview,
                        "저장수": saves,
                        "평점": rating,
                        "네이버_플레이스_URL": placeUrl,
                        "이미지_URL": imgUrl
                    });
                }
                return results;
            }\''')'''
    content = content.replace(end_target, end_replacement)

# AD 링크 방어
ad_link_target = '''                    let placeUrl = "";
                    let placeLink = el.querySelector('a[href*="/place/"]');
                    if (placeLink) {'''
ad_link_replacement = '''                    let placeUrl = "";
                    // 모바일 네이버 플레이스의 링크 구조 (보통 클래스명 활용)
                    let placeLink = el.querySelector('a[href*="/place/"], a[href*="/restaurant/"], a.tzwk0, a.P7b_J');
                    if (placeLink) {
                        let href = placeLink.getAttribute("href") || "";
                        // 일반적인 /restaurant/ID/home 패턴 또는 /place/ID 추출
                        let match = href.match(/(?:place|restaurant)\\/([0-9]+)/);
                        if (match && match[1]) {
                            placeUrl = "https://m.place.naver.com/restaurant/" + match[1] + "/home";
                        } else if (href && href.startsWith("http")) { // 파워링크 광고 등
                            placeUrl = href;
                        } else if (href && href.startsWith("/")) {
                            placeUrl = "https://m.place.naver.com" + href;
                        }'''
if ad_link_target in content:
    content = content.replace(ad_link_target, ad_link_replacement)

with open("domains/scraping/full_list_extractor.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Extractor Patched!")
