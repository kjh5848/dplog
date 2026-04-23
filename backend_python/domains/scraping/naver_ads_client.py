import os
import time
import hashlib
import hmac
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("NAVER_API_KEY")
SECRET_KEY = os.getenv("NAVER_SECRET_KEY")
CUSTOMER_ID = os.getenv("NAVER_CUSTOMER_ID")

def generate_signature(timestamp, method, path, secret_key):
    message = f"{timestamp}.{method}.{path}"
    hash_obj = hmac.new(secret_key.encode('utf-8'), message.encode('utf-8'), hashlib.sha256)
    return base64.b64encode(hash_obj.digest()).decode('utf-8')

def get_header(method, uri):
    if not all([API_KEY, SECRET_KEY, CUSTOMER_ID]):
        raise ValueError("Missing Naver Ads API credentials in .env")
        
    timestamp = str(round(time.time() * 1000))
    signature = generate_signature(timestamp, method, uri, SECRET_KEY)
    return {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Timestamp': timestamp,
        'X-API-KEY': API_KEY,
        'X-Customer': str(CUSTOMER_ID),
        'X-Signature': signature
    }

async def get_keyword_stats(keywords_list: list) -> list:
    """
    대량의 키워드를 5개씩 Chunk 단위로 잘라 네이버 검색광고 API를 비동기 병합 호출합니다.
    """
    if not keywords_list:
        return []
        
    uri = "/keywordstool"
    method = "GET"
    url = "https://api.searchad.naver.com" + uri
    
    headers = get_header(method, uri)
    all_results = []
    
    # 5개씩 chunk 생성
    chunk_size = 5
    chunks = [keywords_list[i:i + chunk_size] for i in range(0, len(keywords_list), chunk_size)]
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for chunk in chunks:
            hint_keywords = ",".join([kw.replace(" ", "") for kw in chunk])
            params = {'hintKeywords': hint_keywords, 'showDetail': '1'}
            try:
                res = await client.get(url, headers=headers, params=params)
                if res.status_code == 200:
                    data = res.json()
                    if 'keywordList' in data:
                        for item in data['keywordList']:
                            rel_kw = item.get('relKeyword', "")
                            # 입력한 키워드 묶음(chunk) 중에 매칭되는 것만 담음
                            matched = False
                            for ck in chunk:
                                if ck.replace(" ","") == rel_kw.replace(" ",""):
                                    matched = True
                                    rel_kw = ck # 원래 스페이싱 유지
                                    break
                            
                            if not matched: continue
                            
                            pc = item.get('monthlyPcQcCnt', 0)
                            mobile = item.get('monthlyMobileQcCnt', 0)
                            try: pc = int(str(pc).replace('< 10', '10'))
                            except: pc = 0
                            try: mobile = int(str(mobile).replace('< 10', '10'))
                            except: mobile = 0
                            
                            total = pc + mobile
                            
                            pc_clk = item.get('monthlyAvePcClkCnt', 0.0)
                            mobile_clk = item.get('monthlyAveMobileClkCnt', 0.0)
                            try: pc_clk = float(pc_clk)
                            except: pc_clk = 0.0
                            try: mobile_clk = float(mobile_clk)
                            except: mobile_clk = 0.0
                            
                            all_results.append({
                                "keyword": rel_kw,
                                "pc_vol": pc,
                                "mobile_vol": mobile,
                                "total_vol": total,
                                "pc_click_cnt": pc_clk,
                                "mobile_click_cnt": mobile_clk,
                                "pc_click_rate": round(item.get('monthlyAvePcClkRate', 0.0), 2),
                                "mobile_click_rate": round(item.get('monthlyAveMobileClkRate', 0.0), 2),
                                "comp_level": item.get('compIdx', '보통'),
                                "ads_count": item.get('plAvgDepth', 0)
                            })
            except Exception as e:
                print(f"[네이버 광고 API 에러] Chunk 조회 실패: {e}")
                
    return all_results

if __name__ == "__main__":
    import asyncio
    print(asyncio.run(get_keyword_stats(["시청고기집", "미남스시"])))
