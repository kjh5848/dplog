"""원시적인 형태의 싱글스레드 네이버 플레이스 스크래퍼 초기버전입니다."""

import requests
import json
import re

def fetch_naver_place(place_id):
    url = f"https://m.place.naver.com/restaurant/{place_id}/home"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
    }

    print(f"[*] Fetching {url} with HTTP requests...")
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    html = response.text
    
    extracted_data = {}
    
    
    apollo_match = re.search(r'window\.__APOLLO_STATE__\s*=\s*({.+?});', html)
    if apollo_match:
        try:
            apollo_state = json.loads(apollo_match.group(1))
            
            # Recursively find review counts
            def find_reviews(obj):
                if isinstance(obj, dict):
                    if 'visitorReviewCount' in obj and 'blogReviewCount' in obj:
                        extracted_data['visitor_reviews'] = obj.get('visitorReviewCount')
                        extracted_data['blog_reviews'] = obj.get('blogReviewCount')
                        extracted_data['bookmark_count'] = obj.get('bookmarkCount')
                        extracted_data['store_name'] = obj.get('name')
                        extracted_data['category'] = obj.get('category')
                    for k, v in obj.items():
                        find_reviews(v)
                elif isinstance(obj, list):
                    for item in obj:
                        find_reviews(item)
            
            find_reviews(apollo_state)
            
            # Extract Menus
            menus = []
            for key, val in apollo_state.items():
                if key.startswith('Menu:'):
                    menus.append({
                        'name': val.get('name'),
                        'price': val.get('price'),
                        'desc': val.get('desc')
                    })
            extracted_data['menus'] = menus
            
            # Extract Top Reviews
            reviews = []
            for key, val in apollo_state.items():
                if key.startswith('FsasReview:'):
                    reviews.append(val.get('title') or val.get('name') or val.get('content'))
            extracted_data['recent_reviews'] = reviews[:5]
            
            print(f"[+] Business Name: {extracted_data.get('store_name')}")
            print(f"[+] Visitor Reviews: {extracted_data.get('visitor_reviews')}")
            print(f"[+] Blog Reviews: {extracted_data.get('blog_reviews')}")
            print(f"[+] Bookmarks: {extracted_data.get('bookmark_count')}")
            print(f"[+] Menus Extracted: {len(extracted_data.get('menus', []))}")
            for m in extracted_data.get('menus', []):
                print(f"    - {m['name']} : {m['price']}원")
            
            with open("naver_place_extracted.json", "w", encoding="utf-8") as f:
                json.dump(extracted_data, f, ensure_ascii=False, indent=2)
                
            return True
        except Exception as e:
            print(f"[-] Error parsing APOLLO_STATE JSON: {e}")
    else:
        print("[-] Could not find __APOLLO_STATE__ in the HTML.")
    
    return False

if __name__ == "__main__":
    place_id = "37982226" # 푸짐한뒷고기
    success = fetch_naver_place(place_id)
