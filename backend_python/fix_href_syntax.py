with open("domains/scraping/full_list_extractor.py", "r", encoding="utf-8") as f:
    content = f.read()

target = '''                    let placeLink = el.querySelector('a[href*="/place/"], a[href*="/restaurant/"], a.tzwk0, a.P7b_J');
                    if (placeLink) {
                        let href = placeLink.getAttribute("href") || "";
                        // 일반적인 /restaurant/ID/home 패턴 또는 /place/ID 추출
                        let match = href.match(/(?:place|restaurant)\\\\/([0-9]+)/);
                        if (match && match[1]) {
                            placeUrl = "https://m.place.naver.com/restaurant/" + match[1] + "/home";
                        } else if (href && href.startsWith("http")) { // 파워링크 광고 등
                            placeUrl = href;
                        } else if (href && href.startsWith("/")) {
                            placeUrl = "https://m.place.naver.com" + href;
                        }'''

replacement = '''                    let placeLink = el.querySelector('a[href*="/place/"], a[href*="/restaurant/"], a.tzwk0, a.P7b_J');
                    if (placeLink) {
                        let linkHref = placeLink.getAttribute("href") || "";
                        // 일반적인 /restaurant/ID/home 패턴 또는 /place/ID 추출
                        let match = linkHref.match(/(?:place|restaurant)\\\\/([0-9]+)/);
                        if (match && match[1]) {
                            placeUrl = "https://m.place.naver.com/restaurant/" + match[1] + "/home";
                        } else if (linkHref && linkHref.startsWith("http")) { // 파워링크 광고 등
                            placeUrl = linkHref;
                        } else if (linkHref && linkHref.startsWith("/")) {
                            placeUrl = "https://m.place.naver.com" + linkHref;
                        }'''

content = content.replace("let href", "let linkHref").replace("href.match", "linkHref.match").replace("href.startsWith", "linkHref.startsWith").replace("href;", "linkHref;")

with open("domains/scraping/full_list_extractor.py", "w", encoding="utf-8") as f:
    f.write(content)
