"""D-PLOG 메인 시스템에서 DB와 연동하기 위해 설계된 키워드별 연산 코어 파이썬 모듈입니다."""

import urllib.request
import urllib.parse
import json
import re
import csv
import time
import random
import hashlib
import hmac
import base64
import requests
from playwright.sync_api import sync_playwright

# ----------------- CONFIGURATION -----------------
API_KEY = "0100000000395b40afd12ca8b77e7324fcb70115e700f994bd17c9f3c2aa48f48975a7a063"
SECRET_KEY = "AQAAAAA5W0Cv0Syot35zJPy3ARXnU1c9uiDxo+PEim1crR3wmQ=="
CUSTOMER_ID = "4117920"

keywords = [
    "시청고기집", "시청뒷고기"
]
STORE_NAME = "푸짐한뒷고기"
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
    """네이버 검색광고 API를 통해 월간 검색량 및 클릭수 등 통합 지표 조회"""
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
                    # 1. 검색수
                    pc = item.get('monthlyPcQcCnt', 0)
                    mobile = item.get('monthlyMobileQcCnt', 0)
                    try: pc = int(str(pc).replace('< 10', '10'))
                    except: pc = 0
                    try: mobile = int(str(mobile).replace('< 10', '10'))
                    except: mobile = 0
                    
                    # 2. 클릭수
                    pc_clk = item.get('monthlyAvePcClkCnt', 0)
                    mobile_clk = item.get('monthlyAveMobileClkCnt', 0)
                    
                    # 3. 클릭률(CTR)
                    pc_ctr = item.get('monthlyAvePcCtr', 0)
                    mobile_ctr = item.get('monthlyAveMobileCtr', 0)
                    
                    # 4. 경쟁정도 & 노출광고수
                    comp_idx = item.get('compIdx', "")
                    if comp_idx == "HIGH": comp_idx = "높음"
                    elif comp_idx == "MID": comp_idx = "중간"
                    elif comp_idx == "LOW": comp_idx = "낮음"
                    
                    pl_avg_depth = item.get('plAvgDepth', 0)
                    
                    return {
                        "pc": pc, "mobile": mobile, "total": pc + mobile,
                        "pc_clk": pc_clk, "mobile_clk": mobile_clk,
                        "pc_ctr": f"{pc_ctr}%", "mobile_ctr": f"{mobile_ctr}%",
                        "comp": comp_idx, "ads": pl_avg_depth
                    }
    except Exception as e:
        pass
    
    return {
        "pc": 0, "mobile": 0, "total": 0,
        "pc_clk": 0, "mobile_clk": 0,
        "pc_ctr": "0%", "mobile_ctr": "0%",
        "comp": "-", "ads": 0
    }

def get_autocomplete(keyword):
    encoded = urllib.parse.quote(keyword)
    url = f"https://ac.search.naver.com/nx/ac?q={encoded}&con=1&rev=4&q_enc=UTF-8&st=100&r_format=json&t_koreng=1"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36'
    })
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if 'items' in data and len(data['items']) > 0:
                all_auto_kws = [item[0] for item in data['items'][0]] 
                return all_auto_kws
    except:
        pass
    return []

def get_related(keyword):
    encoded = urllib.parse.quote(keyword)
    url = f"https://search.naver.com/search.naver?query={encoded}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36'
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

def get_mobile_recommendations(keyword, page):
    encoded = urllib.parse.quote(keyword)
    page.goto(f"https://m.search.naver.com/search.naver?query={encoded}")
    page.wait_for_load_state('networkidle', timeout=5000)
    page.wait_for_timeout(1000)
    
    js_code = """
    () => {
        let results = { "많이찾는": [], "보면좋은": [] };
        const extractSection = (headerText) => {
            let texts = new Set();
            let headers = Array.from(document.querySelectorAll('span, div, h2, h3, strong')).filter(el => el.innerText.trim() === headerText);
            for (let header of headers) {
                let container = header.closest('.api_subject_bx') || header.closest('section') || header.parentElement.parentElement.parentElement;
                if (container) {
                    let links = container.querySelectorAll('a[href*="?where=m"], a[href*="search.naver"]');
                    links.forEach(a => {
                        let text = a.innerText.trim().replace(/\\n/g, " ");
                        text = text.replace(/요즘 인기|\\.\\.\\./g, "").trim();
                        if(text && text !== headerText && !text.includes("정보확인")) {
                            texts.add(text);
                        }
                    });
                }
            }
            return Array.from(texts);
        };
        results['많이찾는'] = extractSection("함께 많이 찾는");
        results['보면좋은'] = extractSection("함께 보면 좋은");
        return results;
    }
    """
    try:
        data = page.evaluate(js_code)
        return data
    except:
        return { "많이찾는": [], "보면좋은": [] }

def format_with_metrics(keywords):
    if not keywords:
        return "(없음)"
    
    formatted = []
    for kw in keywords:
        metrics = get_search_volume(kw)
        pc = metrics['pc']
        m_vol = metrics['mobile']
        comp = metrics['comp']
        formatted.append(f"{kw} [PC:{pc}/M:{m_vol}/경쟁:{comp}]")
    
    return ", ".join(formatted)

def check_exposure(keyword):
    """
    모바일 통합검색 페이지를 호출하여 특정 가게명(STORE_NAME)이 문서에 몇 번 노출되는지 단순 카운트
    """
    url = f"https://m.search.naver.com/search.naver?query={urllib.parse.quote(keyword)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    }
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            return resp.text.count(STORE_NAME)
    except Exception:
        pass
    return 0

def main():
    csv_file = "/Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/store_diagnosis_pujimhan_vertical.csv"
    print(f"🔥 매장 맞춤형 수직 엑셀 파이프라인 (푸짐한뒷고기) (결과물: {csv_file})\\n")
    
    # ----------------- IN-MEMORY CACHE FOR API CALLS -----------------
    metric_cache = {}
    def get_metrics_cached(kw):
        if kw not in metric_cache:
            metric_cache[kw] = get_search_volume(kw)
        return metric_cache[kw]
    # -----------------------------------------------------------------

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True
        )
        page = context.new_page()

        with open(csv_file, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            # 깔끔한 세로형 데이터 구조 (각 키워드가 온전한 행을 차지함)
            writer.writerow([
                "기준키워드", "계층", "파생키워드", "키워드출처",
                "월간검색수(PC)", "월간검색수(모바일)", 
                "월평균클릭수(PC)", "월평균클릭수(모바일)", 
                "월평균클릭률(PC)", "월평균클릭률(모바일)", 
                "경쟁정도", "월평균노출광고수", "노출건수(모바일)"
            ])
            
            def save_row(base_kw, level, current_kw, source_type):
                metrics = get_metrics_cached(current_kw)
                exposure = check_exposure(current_kw)
                writer.writerow([
                    base_kw, level, current_kw, source_type,
                    metrics["pc"], metrics["mobile"], 
                    metrics["pc_clk"], metrics["mobile_clk"], 
                    metrics["pc_ctr"], metrics["mobile_ctr"], 
                    metrics["comp"], metrics["ads"],
                    exposure
                ])
                print(f"  [{level}계층 - {source_type}] {current_kw} (검색: {metrics['total']} / 노출: {exposure}건 / 경쟁: {metrics['comp']})")
        
            for main_kw in keywords:
                print(f"\\n=======================================================")
                print(f"[{main_kw}] 심층 분석 시작 (모든 파생 경로 개별행 처리 중)...")
                
                # 메인키워드 자체 저장 (1계층)
                save_row(main_kw, 1, main_kw, "메인키워드")
                
                auto_kws = get_autocomplete(main_kw)
                for index, auto_kw in enumerate(auto_kws, 1):
                    # 1. 자동완성_키워드 처리 (2계층)
                    save_row(main_kw, 2, auto_kw, "자동완성")
                    
                    # 2. 연관검색어 크롤링 (PC) 처리 (3계층)
                    time.sleep(random.uniform(0.3, 0.7))
                    rel_kws_str = get_related(auto_kw)
                    if rel_kws_str and rel_kws_str != "(미제공)":
                        for rel in rel_kws_str.split(", "):
                            if rel.strip():
                                save_row(main_kw, 3, rel.strip(), "연관검색어")
                    
                    # 3. 모바일 추천 영역 처리 (Playwright) (3계층)
                    mobile_data = get_mobile_recommendations(auto_kw, page)
                    
                    for kw in mobile_data.get('많이찾는', []):
                        save_row(main_kw, 3, kw, "함께많이찾는(모바일)")
                        
                    for kw in mobile_data.get('보면좋은', []):
                        save_row(main_kw, 3, kw, "함께보면좋은(모바일)")
                        
                print(f"=======================================================\\n")

        browser.close()
    print(f"\\n✅ 완료! 검색량 데이터 확장 및 수직구조 변환 완성: {csv_file}")

if __name__ == "__main__":
    main()
