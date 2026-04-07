import re
import json

try:
    with open("m_search_result.html", "r", encoding="utf-8") as f:
        html_content = f.read()

    items = []
    
    # 1. 정규표현식으로 JSON 데이터를 찾아 추출
    nlu_match = re.search(r'naver\.search\.ext\.nmb\.salt\.nlu\s*=\s*(.*?);', html_content)
    if nlu_match:
        try:
            nlu_data_str = nlu_match.group(1).strip()
            if nlu_data_str.startswith("'") and nlu_data_str.endswith("'"):
                nlu_data_str = nlu_data_str[1:-1]
            nlu_data = json.loads(nlu_data_str)
            if 'queryResult' in nlu_data:
                qr = nlu_data['queryResult']
                items.append({
                    "id": qr.get('bizId', ''),
                    "name": qr.get('dbQuery', {}).get('name', qr.get('q', '')),
                    "category": qr.get('queryType', ''),
                    "address": "상세 주소 필요",
                    "method": "JSON NLU 데이터"
                })
        except Exception as e:
            pass
            
            
    # 2. 플레이스 상세 페이지 링크 정규식 매칭
    # <a href="https://m.place.naver.com/restaurant/1788811842?entry=plt" role="button">
    # <span class="GHAhO">이제여기카페</span><span class="lnJFt">카페</span>
    place_blocks = re.finditer(r'href="[^"]*?m\.place\.naver\.com/(?:restaurant|place|hairshop|hospital)/(\d+)[^"]*?".*?>.*?<span class="[^"]*?">([^<]+)</span>.*?<span class="[^"]*?">([^<]+)</span>', html_content)
    
    seen_ids = set()
    for block in place_blocks:
        place_id = block.group(1)
        if place_id in seen_ids: continue
        name = block.group(2)
        category = block.group(3)
        if len(name) > 1 and "리뷰" not in name:
            items.append({
                "id": place_id,
                "name": name,
                "category": category,
                "address": "",
                "method": "HTML 정규식 추출"
            })
            seen_ids.add(place_id)
            
    # 출력
    print(json.dumps(items, ensure_ascii=False, indent=2))
        
except Exception as e:
    print(f"전체 에러: {e}")
