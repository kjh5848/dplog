import urllib.request
import re
from bs4 import BeautifulSoup
from urllib.parse import quote
import json

def fetch_mobile_search(query):
    url = f"https://m.search.naver.com/search.naver?query={quote(query)}"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)'}
    )
    
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        soup = BeautifulSoup(html, 'html.parser')
        
        results = []
        
        # 최신 네이버 통합검색 장소 영역(플레이스)의 클래스 명 구조 분석
        # 대부분 <a href="?_=%2Fplace%2Fid...%23KJWqMdlUlBnuM%2BwYQBHlyYj6dQ%3D%3D" 의 상위 컨테이너 Li 태그에 위치함.
        # <li class="P7gyV"> 등등 난독화된 클래스를 씀.
        
        links = soup.select('a[href*="m.place.naver.com/place"]')
        seen = set()
        
        for a in links:
            href = a.get('href')
            pid_match = re.search(r'm\.place\.naver\.com/place/(\d+)', href)
            if not pid_match:
                continue
            pid = pid_match.group(1)
            
            if pid in seen:
                continue
            
            # 여기서 a태그의 부모-부모 li나 div를 타고 올라가서 텍스트 전체를 긁어봄
            parent = a.parent
            for _ in range(5):
                if parent and parent.name in ['li', 'div'] and len(parent.text) > 20: 
                    # 뭔가 정보가 담긴 영역이다!
                    break
                if parent:
                    parent = parent.parent
            
            name = ""
            category = ""
            address = ""
            
            if parent:
                # 상호명 유추: 보통 span이나 em 태그, 첫번째 텍스트 요소
                text_content = parent.get_text(separator='|', strip=True).split('|')
                text_content = [t for t in text_content if t and len(t)>0]
                if text_content:
                    name = text_content[0] # 가장 첫 텍스트가 상호명일 확률 99%
                    
            if name and "리뷰" not in name and "방문자" not in name and "위치" not in name:
                results.append({
                    "id": pid,
                    "name": name,
                    "category": category,
                    "address": address,
                    "thumUrl": ""
                })
                seen.add(pid)
                
        # 출력
        for r in results:
            print(f"[{r['id']}] {r['name']}")

if __name__ == "__main__":
    fetch_mobile_search("이제여기카페")
