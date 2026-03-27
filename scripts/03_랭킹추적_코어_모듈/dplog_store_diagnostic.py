"""최종 추출된 상점 데이터를 D-PLOG 백엔드로 전송하거나 진단 보고서 규격에 맞게 포매팅하는 스크립트입니다."""

import urllib.request
import urllib.parse
import json
import re
import csv
import time
import random
import hmac
import hashlib
import base64
import requests

# ----------------- CONFIGURATION -----------------
API_KEY = "0100000000395b40afd12ca8b77e7324fcb70115e700f994bd17c9f3c2aa48f48975a7a063"
SECRET_KEY = "AQAAAAA5W0Cv0Syot35zJPy3ARXnU1c9uiDxo+PEim1crR3wmQ=="
CUSTOMER_ID = "4117920"

STORE_NAME = "푸짐한뒷고기"
BASE_KEYWORDS = ["시청고기집", "시청뒷고기"]  # 중복 제거
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

def get_search_volume(keyword):
    uri = "/keywordstool"
    method = "GET"
    url = "https://api.naver.com" + uri
    
    headers = get_header(method, uri, API_KEY, SECRET_KEY, CUSTOMER_ID)
    normalized_kw = keyword.replace(" ", "")
    params = {'hintKeywords': normalized_kw, 'showDetail': '1'}
    
    try:
        res = requests.get(url, headers=headers, params=params)
        data = res.json()
        
        if 'keywordList' in data:
            for item in data['keywordList']:
                if item['relKeyword'].replace(' ', '') == normalized_kw:
                    pc = item.get('monthlyPcQcCnt', 0)
                    mobile = item.get('monthlyMobileQcCnt', 0)
                    try: pc = int(str(pc).replace('< 10', '10'))
                    except: pc = 0
                    try: mobile = int(str(mobile).replace('< 10', '10'))
                    except: mobile = 0
                    
                    return pc + mobile
    except:
        pass
    return 0

def get_autocomplete(keyword):
    encoded = urllib.parse.quote(keyword)
    url = f"https://ac.search.naver.com/nx/ac?q={encoded}&con=1&rev=4&q_enc=UTF-8&st=100&r_format=json&t_koreng=1"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    })
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if 'items' in data and len(data['items']) > 0:
                return [item[0] for item in data['items'][0]] 
    except:
        pass
    return []

def get_related(keyword):
    encoded = urllib.parse.quote(keyword)
    url = f"https://search.naver.com/search.naver?query={encoded}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    })
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8')
            area_match = re.search(r'<div class="lst_related_srch_wrap">(.+?)</div>\s*</div>', html, re.DOTALL)
            if not area_match:
                area_match = re.search(r'<ul class(?:.*?)lst_related_srch(.*?)</ul>', html, re.DOTALL)     
            if area_match:
                texts = re.findall(r'<div class="tit">([^<]+)</div>', area_match.group(0))
                if texts: return ", ".join(texts)
                texts2 = re.findall(r'>([^<]+)</a>', area_match.group(0))
                texts2 = [t.strip() for t in texts2 if t.strip() and "<" not in t]
                if texts2: return ", ".join(texts2)
    except:
        pass
    return "(미제공)"

def check_exposure(keyword, store_name):
    """
    해당 키워드로 네이버 통합검색 시 1페이지 HTML 내에 
    가게명(푸짐한뒷고기)이 존재하는지 확인하여 노출 여부 판단
    """
    encoded = urllib.parse.quote(keyword)
    url = f"https://search.naver.com/search.naver?query={encoded}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    })
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8')
            # 띄어쓰기 없이 비교를 위해 공백 제거
            clean_html = html.replace(' ', '')
            clean_store = store_name.replace(' ', '')
            return clean_store in clean_html
    except:
        return False

def main():
    print(f"[{STORE_NAME}] SEO 진단 시작 (대상 키워드: {BASE_KEYWORDS})\n")
    
    seen_keywords = set()
    results = [] # {level, keyword, total_search, exposed}
    
    # 중복 및 무의미한 키워드 필터 검사기능
    def process_keyword(kw, level, parent=None):
        if not kw or kw == "(미제공)" or kw in seen_keywords:
            return
        seen_keywords.add(kw)
        
        # IP 차단 방지 (노출 체크시에도 네이버 통합검색 접근하므로 딜레이 필요)
        time.sleep(random.uniform(0.3, 0.7))
        
        exposed = check_exposure(kw, STORE_NAME)
        total_search = get_search_volume(kw)
        
        results.append({
            'level': level,
            'keyword': kw,
            'total_search': total_search,
            'exposed': exposed,
            'parent': parent
        })
        ex_str = "🟢 O" if exposed else "🔴 X"
        p_str = f"({parent}에서 파생) " if parent else ""
        print(f"[계층 {level}] {p_str}'{kw}' | 검색량: {total_search} | 노출: {ex_str}")

    print("====================== [1. 데이터 수집] ======================")
    for kw1 in BASE_KEYWORDS:
        # 1계층: 대표키워드
        process_keyword(kw1, 1)
        
        # 2계층: 자동완성 검색어
        auto_kws = get_autocomplete(kw1)
        for kw2 in auto_kws:
            process_keyword(kw2, 2, parent=kw1)
            
            # 3계층: 연관 검색어
            time.sleep(random.uniform(0.3, 0.7))
            rel_str = get_related(kw2)
            if rel_str != "(미제공)":
                rel_kws = [k.strip() for k in rel_str.split(",")]
                for kw3 in rel_kws:
                    process_keyword(kw3, 3, parent=kw2)
                    
    print("\n====================== [2. 진단 결과 분석] ======================")
    
    # 1. 노출 통계
    total_count = len(results)
    exposed_count = sum(1 for r in results if r['exposed'])
    not_exposed_count = total_count - exposed_count
    
    print(f"\n📊 총 추출 키워드: {total_count}개")
    print(f"✨ 1페이지 노출 키워드 수: {exposed_count}개")
    print(f"❌ 1페이지 미노출 키워드 수: {not_exposed_count}개")
    
    # 2. 대표키워드 일치 및 방향성 진단
    print("\n🎯 [현재 노출 중인 키워드 목록]")
    for r in sorted([r for r in results if r['exposed']], key=lambda x: x['total_search'], reverse=True):
        print(f" -> '{r['keyword']}' (계층 {r['level']} / 검색량 {r['total_search']}건)")
        
    if exposed_count == 0:
         print(" -> ⚠️ 심각: 가게가 1페이지에 노출되는 관련 키워드가 단 하나도 없습니다.")
         
    # 3. 고갈증/블루오션 키워드 추천 알고리즘
    # 검색량이 100~5000 사이이면서 노출이 안 되어있는 키워드 중 검색량 Top 5
    opportunities = [r for r in results if not r['exposed'] and 100 <= r['total_search'] <= 5000]
    opportunities = sorted(opportunities, key=lambda x: x['total_search'], reverse=True)[:5]
    
    print("\n💡 [마케팅 집중 추천 타겟 키워드 (블루오션)]")
    print(" (검색량이 유의미하면서 현재 우리 가게가 장악하지 못한 키워드)")
    for i, r in enumerate(opportunities, 1):
        print(f" {i}. '{r['keyword']}' (검색량 {r['total_search']}건 / 계층 {r['level']})")

    # CSV 저장
    csv_file = "/Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/store_diagnosis_pujimhan.csv"
    with open(csv_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["계층", "파생출처", "키워드", "월간검색량", "가게노출여부"])
        for r in results:
            writer.writerow([r['level'], r['parent'] or "-", r['keyword'], r['total_search'], "O" if r['exposed'] else "X"])
            
    print(f"\n✅ 엑셀 리포트 병합 완료: {csv_file}")

if __name__ == "__main__":
    main()
