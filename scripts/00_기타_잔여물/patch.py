import os

base_dir = "/Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog"
scripts = [
    "scripts/2026-03-26/full_list_extractor_8_threads.py",
    "scripts/2026-03-26/full_list_extractor_10_threads.py",
    "scripts/2026-03-26/full_list_extractor_12_threads.py"
]

target_js_old = """                    // 카테고리 (이름 옆에 붙어있는 주로 옅은 회색 텍스트)
                    let catEl = el.querySelector('.lxgjv, .uzK8e, .KCMnt');
                    let category = catEl ? catEl.innerText.trim() : "";
                    
                    // 주소 정보 (동/도로명)
                    let addrEl = el.querySelector('.hY0oG, .n1h2h, .u_c_address');
                    let address = addrEl ? addrEl.innerText.trim() : "";
                    
                    // 썸네일 이미지 링크
                    let imgEl = el.querySelector('.K0PDV, .CBbl_, img');
                    let imgUrl = imgEl ? (imgEl.style.backgroundImage.slice(5,-2) || imgEl.src) : "";
                    if(imgUrl.startsWith('"') && imgUrl.endsWith('"')) imgUrl = imgUrl.slice(1, -1);
                    
                    return {
                        "상호명": name,
                        "카테고리": category,
                        "주소": address,
                        "이미지_URL": imgUrl
                    };"""

target_js_new = """                    // 카테고리 (이름 옆에 붙어있는 주로 옅은 회색 텍스트)
                    let catEl = el.querySelector('.YzBgS, .lxgjv, .uzK8e, .KCMnt');
                    let category = catEl ? catEl.innerText.trim() : "";
                    
                    // 주소 정보 (동/도로명)
                    let addrEl = el.querySelector('.suKMR, .hY0oG, .n1h2h, .u_c_address');
                    let address = addrEl ? addrEl.innerText.trim() : "";
                    
                    // 썸네일 이미지 링크
                    let imgEl = el.querySelector('.K0PDV, .CBbl_, img');
                    let imgUrl = imgEl ? (imgEl.style.backgroundImage.slice(5,-2) || imgEl.src) : "";
                    if(imgUrl && !!imgUrl.startsWith && imgUrl.startsWith('"') && imgUrl.endsWith('"')) {
                        imgUrl = imgUrl.slice(1, -1);
                    }
                    
                    // ⭐️ 네이버 플레이스 링크 병합 ⭐️
                    let placeUrl = "";
                    let placeLink = el.querySelector('a[href*="/place/"]');
                    if (placeLink) {
                        let href = placeLink.getAttribute("href") || "";
                        let match = href.match(/place\\/([0-9]+)/);
                        if (match && match[1]) {
                            placeUrl = "https://m.place.naver.com/restaurant/" + match[1] + "/home";
                        }
                    }

                    return {
                        "상호명": name,
                        "카테고리": category,
                        "주소": address,
                        "네이버_플레이스_URL": placeUrl,
                        "이미지_URL": imgUrl
                    };"""

target_df_old = """                df_res = pd.DataFrame(stores)[['키워드', '순위', '상호명', '카테고리', '주소', '이미지_URL']]"""
target_df_new = """                df_res = pd.DataFrame(stores)[['키워드', '순위', '상호명', '카테고리', '주소', '네이버_플레이스_URL', '이미지_URL']]"""

success_count = 0
for s in scripts:
    path = os.path.join(base_dir, s)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if target_df_old in content:
        content = content.replace(target_js_old, target_js_new)
        content = content.replace(target_df_old, target_df_new)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        success_count += 1
        print(f"Patched: {s}")

print(f"Total patched: {success_count}/3")
