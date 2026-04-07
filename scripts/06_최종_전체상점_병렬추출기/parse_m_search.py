import urllib.request
from bs4 import BeautifulSoup
import re
from urllib.parse import quote

def fetch_mobile_search(query):
    url = f"https://m.search.naver.com/search.naver?query={quote(query)}&sm=mtb_hty.top&where=m"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)'}
    )
    
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        soup = BeautifulSoup(html, 'html.parser')
        
        results = []
        
        # 'KJB_api_KJWqMdlUlBnuM' 같은 스크립트 데이터 안에 장소 정보가 있거나,
        # 혹은 모바일에서 흔히 뜨는 .P7gyV 같은 플레이스 리스트 항목 클래스를 탐색해야 함.
        # 근데 클래스명이 자주 바뀌므로 범용적으로 구조 탐색:
        # a 태그 중 href에 m.place.naver.com/place/가 있는 것을 찾음!
        
        place_links = soup.find_all('a', href=re.compile(r'm\.place\.naver\.com/place/\d+'))
        seen_ids = set()
        
        for a in place_links:
            href = a.get('href')
            match = re.search(r'm\.place\.naver\.com/place/(\d+)', href)
            if match:
                pid = match.group(1)
                
                if pid in seen_ids:
                    continue
                seen_ids.add(pid)
                
                # a 태그 안에 들어있는 텍스트나, 그 부모 컨테이너 안에 들어있는 텍스트를 조사하자.
                # 보통 a 태그 내부의 첫번째 <span> 이나 <strong class="name"> 등에 상호명이 있음
                
                name_text = a.text.strip()
                # 텍스트가 "방문자리뷰", "블로그리뷰", "길찾기" 이런거면 스킵
                if len(name_text) > 0 and not any(k in name_text for k in ["리뷰", "길찾기", "상세보기", "예약", "지도", "전화"]):
                    results.append({
                        "id": pid,
                        "name": name_text, # 대충 이 태그 안의 텍스트가 상호명일 확률이 높음
                        "address": "", # 이 방식으로 주소와 카테고리를 동시에 긁어오긴 어렵지만 이름이라도 긁어보자.
                        "category": ""
                    })
                    
        print(f"Basic BS4 Extract: Found {len(results)} items")
        for r in results:
            print(f"- {r['id']} : {r['name']}")

        # 만약 스크립트 안에 JSON이 있다면.. 정규식 검색
        next_data = re.search(r'id="__NEXT_DATA__".*?>(.*?)</script>', html)
        if next_data:
            print("Found __NEXT_DATA__")
            
        return results

if __name__ == "__main__":
    fetch_mobile_search("이제여기카페")
