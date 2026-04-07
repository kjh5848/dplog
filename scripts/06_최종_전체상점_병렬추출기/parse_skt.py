import json
import re

def test():
    with open('m_search_result.html', 'r', encoding='utf-8') as f:
        html = f.read()

    skt_match = re.search(r'window\.__skt_data__\s*=\s*(.*?});\s*</script>', html)
    if not skt_match:
        print("No skt data")
        return

    try:
        data = json.loads(skt_match.group(1))
        # print("keys:", data.keys())
        
        # 장소 정보는 보통 어디에 들어있을까?
        # data["search"] 나 data["local"] 에 있을텐데
        
        # 키워드로 찾아보자 "이제여기카페"
        import jsonpath_ng.ext as jp
        
        # 무지성으로 전역 탐색해서 "name": "이제여기카페" 랑 비슷한게 있는지보자.
        def find_places(obj, results):
            if isinstance(obj, dict):
                # 네이버 지역 검색의 전형적인 필드: id, name, category, thumUrl 등
                if 'id' in obj and 'name' in obj and 'category' in obj:
                    # m.place 형태이거나, place_id 로 보이는지
                    if str(obj['id']).isdigit() and len(str(obj['id'])) > 5:
                        results.append(obj)
                
                # 재귀 탐색
                for v in obj.values():
                    find_places(v, results)
            elif isinstance(obj, list):
                for v in obj:
                    find_places(v, results)

        found_places = []
        find_places(data, found_places)
        
        # 중복 제거 (id 기준)
        unique_places = {}
        for p in found_places:
            if p['id'] not in unique_places:
                unique_places[p['id']] = {
                    "id": p['id'],
                    "name": p.get('name'),
                    "category": p.get('category'),
                    "address": p.get('address') or p.get('roadAddress') or p.get('addressText'),
                    "thumUrl": p.get('thumUrl') or p.get('image') or p.get('imageUrl')
                }
                
        print(f"Found {len(unique_places)} places inside JSON.")
        for p in list(unique_places.values())[:3]:
            print(p)

    except Exception as e:
        print(e)

if __name__ == "__main__":
    test()
