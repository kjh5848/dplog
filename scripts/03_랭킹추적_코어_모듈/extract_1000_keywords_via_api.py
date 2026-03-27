import urllib.request
import urllib.parse
import time
import hashlib
import hmac
import base64
import requests
import csv
import os

# ----------------- CONFIGURATION -----------------
API_KEY = "0100000000395b40afd12ca8b77e7324fcb70115e700f994bd17c9f3c2aa48f48975a7a063"
SECRET_KEY = "AQAAAAA5W0Cv0Syot35zJPy3ARXnU1c9uiDxo+PEim1crR3wmQ=="
CUSTOMER_ID = "4117920"

SEED_KEYWORD = "부산맛집"
OUTPUT_CSV = "/Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/scripts/00_검색_데이터_세트/[키워드]_API_1000개_추출본.csv"
# -------------------------------------------------

def generate_signature(timestamp, method, path, secret_key):
    message = f"{timestamp}.{method}.{path}"
    hash_obj = hmac.new(secret_key.encode('utf-8'), message.encode('utf-8'), hashlib.sha256)
    return base64.b64encode(hash_obj.digest()).decode('utf-8')

def get_header(method, uri, api_key, secret_key, customer_id):
    timestamp = str(round(time.time() * 1000))
    signature = generate_signature(timestamp, method, uri, secret_key)
    return {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Timestamp': timestamp,
        'X-API-KEY': api_key,
        'X-Customer': str(customer_id),
        'X-Signature': signature
    }

def extract_1000_related_keywords(keyword):
    """
    네이버 검색광고 API에 시드 키워드를 던지면, 
    네이버가 자체 알고리즘으로 연관된 최대 1000개의 키워드와 검색량 데이터를 한 번에 반환합니다.
    """
    print(f"🚀 검색광고 API 호출 중... (시드 키워드: '{keyword}')")
    uri = "/keywordstool"
    method = "GET"
    url = "https://api.naver.com" + uri
    
    headers = get_header(method, uri, API_KEY, SECRET_KEY, CUSTOMER_ID)
    params = {'hintKeywords': keyword.replace(" ", ""), 'showDetail': '1'}
    
    try:
        res = requests.get(url, headers=headers, params=params)
        data = res.json()
        
        if 'keywordList' in data:
            results = []
            for item in data['keywordList']:
                rel_kw = item.get('relKeyword', '')
                pc = item.get('monthlyPcQcCnt', 0)
                mobile = item.get('monthlyMobileQcCnt', 0)
                
                # API 특성상 10 미만은 '< 10' 으로 오므로 정수화
                try: pc = int(str(pc).replace('< 10', '10'))
                except: pc = 0
                try: mobile = int(str(mobile).replace('< 10', '10'))
                except: mobile = 0
                
                results.append({
                    "파생키워드": rel_kw,
                    "월간검색수(PC)": pc,
                    "월간검색수(모바일)": mobile,
                    "총검색수": pc + mobile,
                    "경쟁정도": item.get('compIdx', ''),
                    "월평균클릭수(모바일)": item.get('monthlyAveMobileClkCnt', 0),
                    "월평균클릭률(모바일)": item.get('monthlyAveMobileCtr', 0)
                })
            return results
        else:
            print("[!] API 응답에 keywordList가 없습니다.", data)
            return []
            
    except Exception as e:
        print(f"[!] API 호출 중 에러 발생: {e}")
        return []

def main():
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    
    keywords_data = extract_1000_related_keywords(SEED_KEYWORD)
    
    if not keywords_data:
        print("❌ 추출된 키워드가 없습니다.")
        return
        
    print(f"✅ 네이버 API로부터 총 {len(keywords_data)}개의 키워드 데이터 수신 완료!")
    
    # 총 검색수 기준으로 내림차순 정렬 (검색량이 높은 순)
    keywords_data.sort(key=lambda x: x["총검색수"], reverse=True)
    
    with open(OUTPUT_CSV, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            "파생키워드", "총검색수", "월간검색수(PC)", "월간검색수(모바일)", 
            "경쟁정도", "월평균클릭수(모바일)", "월평균클릭률(모바일)"
        ])
        
        for item in keywords_data:
            comp = item["경쟁정도"]
            if comp == "HIGH": comp = "높음"
            elif comp == "MID": comp = "중간"
            elif comp == "LOW": comp = "낮음"
            
            writer.writerow([
                item["파생키워드"],
                item["총검색수"],
                item["월간검색수(PC)"],
                item["월간검색수(모바일)"],
                comp,
                item["월평균클릭수(모바일)"],
                f"{item['월평균클릭률(모바일)']}%"
            ])
            
    print(f"💾 엑셀 저장 완료 -> {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
