import re

with open("domains/scraping/full_list_extractor.py", "r", encoding="utf-8") as f:
    text = f.read()

# We need to replace the entire "stores = await page.evaluate(...)"" block.
start_str = "stores = await page.evaluate('''() => {"
if start_str not in text:
    start_str = "stores = await page.evaluate('''async () => {"

end_str = "}).filter(x => x['상호명'] !== \"알수없음\");\n            }''')"
if end_str not in text:
    end_str = "return results;\n            }''')"

start_idx = text.find("stores = await page.evaluate('''")
if start_idx == -1:
    print("Cannot find start")

# Find the end of the evaluate block by looking for "''')"
end_idx = text.find("''')", start_idx) + 4

evaluate_code = """stores = await page.evaluate('''async () => {
                let items = document.querySelectorAll('li.VLTHu, li.UEzoS, li.plk0Q, div.YwYLL');
                if(items.length === 0) {
                    let ul = Array.from(document.querySelectorAll('ul')).sort((a,b) => b.children.length - a.children.length)[0];
                    if(ul) items = ul.children;
                }
                
                let results = [];
                for (let el of Array.from(items)) {
                    let nameEl = el.querySelector('.YwYLL, .TYaxT, .place_bluelink, .tzwk0, .h69bs');
                    let name = nameEl ? nameEl.innerText.replace(/\\n/g, '').trim() : "알수없음";
                    if (name === "알수없음") continue;

                    let imgUrl = window.__dplog_images && window.__dplog_images[name] ? window.__dplog_images[name] : "";
                    
                    if (!imgUrl) {
                        el.scrollIntoView({ block: "center" });
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
                    }

                    let category = "";
                    let address = "";
                    let rating = "0";
                    let isAd = "N";
                    
                    let spans = el.querySelectorAll('.KCMnt, .eDFkU, span');
                    for(let i=0; i<spans.length; i++) {
                        let txt = spans[i].innerText.trim();
                        if(txt.includes('별점')) {
                            rating = txt.replace('별점', '').trim();
                        } else if (txt.length > 0 && txt.length <= 15 && !txt.includes('거리') && !txt.includes('리뷰') && !txt.includes('위치')) {
                            category = txt;
                        }
                    }
                    
                    let addrEl = el.querySelector('.Pb4bU, .h69bs');
                    if (addrEl) address = addrEl.innerText.trim();

                    let visitorReview = "0";
                    let blogReview = "0";
                    let saves = "0";
                    
                    let textNodes = el.querySelectorAll('span, p, div');
                    for(let i=0; i<textNodes.length; i++) {
                        if(textNodes[i].innerText) {
                            let text = textNodes[i].innerText.replace(/\\n/g, '').trim();
                            if(text.includes("광고") && text.length <= 5) {
                                isAd = "Y(광고)";
                            }
                            if(text.startsWith("방문자리뷰") && text !== "방문자리뷰") {
                                visitorReview = text.replace("방문자리뷰", "").trim();
                            } else if(text.startsWith("블로그리뷰") && text !== "블로그리뷰") {
                                blogReview = text.replace("블로그리뷰", "").trim();
                            } else if(text.startsWith("저장") && text !== "저장") {
                                saves = text.replace("저장", "").trim();
                            }
                        }
                    }
                    
                    let placeUrl = "";
                    let placeLink = el.querySelector('a[href*="/place/"], a[href*="/restaurant/"], a.tzwk0, a.P7b_J, a[href*="searchad"]');
                    if (placeLink) {
                        let linkHref = placeLink.getAttribute("href") || "";
                        let match = linkHref.match(/(?:place|restaurant)\\/([0-9]+)/);
                        if (match && match[1]) {
                            placeUrl = "https://m.place.naver.com/restaurant/" + match[1] + "/home";
                        } else if (linkHref.startsWith("http")) { 
                            placeUrl = linkHref;
                        } else if (linkHref.startsWith("/")) {
                            placeUrl = "https://m.place.naver.com" + linkHref;
                        }
                    } else {
                        isAd = "Y(광고)";
                    }

                    results.push({
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
            }''')"""

new_text = text[:start_idx] + evaluate_code + text[end_idx:]

with open("domains/scraping/full_list_extractor.py", "w", encoding="utf-8") as f:
    f.write(new_text)

print("Extractor completely rewritten!")
