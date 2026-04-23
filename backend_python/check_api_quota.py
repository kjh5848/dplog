import os, sys, time, hashlib, hmac, base64, httpx
sys.path.insert(0, os.path.dirname(__file__))

# .env 직접 파싱
env_path = os.path.join(os.path.dirname(__file__), '.env')
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            os.environ[k] = v.strip('"')

API_KEY     = os.environ["NAVER_API_KEY"]
SECRET_KEY  = os.environ["NAVER_SECRET_KEY"]
CUSTOMER_ID = os.environ["NAVER_CUSTOMER_ID"]

def sign(ts, method, path):
    msg = f"{ts}.{method}.{path}"
    h = hmac.new(SECRET_KEY.encode(), msg.encode(), hashlib.sha256)
    return base64.b64encode(h.digest()).decode()

def call(method, uri, params=None):
    ts = str(round(time.time() * 1000))
    headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Timestamp': ts,
        'X-API-KEY': API_KEY,
        'X-Customer': str(CUSTOMER_ID),
        'X-Signature': sign(ts, method, uri),
    }
    url = f"https://api.searchad.naver.com{uri}"
    r = httpx.get(url, headers=headers, params=params, timeout=10) if method=="GET" else None
    return r.status_code, r.text[:2000]

# 1. 키워드 도구 1회 호출 — 헤더에 사용량 정보 포함될 수 있음
print("=== /keywordstool 테스트 ===")
ts = str(round(time.time() * 1000))
uri = "/keywordstool"
headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'X-Timestamp': ts,
    'X-API-KEY': API_KEY,
    'X-Customer': str(CUSTOMER_ID),
    'X-Signature': sign(ts, "GET", uri),
}
r = httpx.get(f"https://api.searchad.naver.com{uri}", headers=headers,
              params={'hintKeywords': '성심당', 'showDetail': '1'}, timeout=10)
print("Status:", r.status_code)
# 응답 헤더에 Rate Limit 정보 확인
for k, v in r.headers.items():
    if any(x in k.lower() for x in ['rate', 'limit', 'remain', 'quota', 'x-']):
        print(f"  {k}: {v}")
print("Body:", r.text[:500])
