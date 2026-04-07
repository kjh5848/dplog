import urllib.request
from urllib.parse import quote
import re
import json

def test():
    query = "이제여기카페"
    url = f"https://m.search.naver.com/search.naver?query={quote(query)}"
    
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9'
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            # 패턴 1: window.__skt_data__ 에서 JSON 확보하는 방법
            # 패턴 2: html 내에서 <a href="?_=%2Fplace%2F1155523467%23KJWqMdlUlBnuM%2BwYQBHlyYj6dQ%3D%3D"... 추출하는 방법
            
            # 1. m.place.naver.com/place/ID 추출 (간단한 방법)
            matches = re.findall(r'm\.place\.naver\.com/place/(\d+)', html)
            pids = list(dict.fromkeys(matches)) # 순서 유지 중복 제거
            
            results = []
            
            # 추출된 ID가 있다면 html 내에서 주변 텍스트(상호명)를 대충 매칭하거나, JSON 덩어리가 있는지 찾아본다.
            # 모바일 통합검색의 장소 결과는 보통 JSON 임베딩(<script>window.__skt_data__ = ...</script>)에 들어있다.
            skt_match = re.search(r'window\.__skt_data__\s*=\s*(\{.*?\});\s*</script>', html)
            if skt_match:
                skt_json = json.loads(skt_match.group(1))
                # print("SKT Data keys:", skt_json.keys())
            
            print("Found Place IDs:", pids)
            with open("m_search_result.html", "w", encoding="utf-8") as f:
                f.write(html)
                
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test()
