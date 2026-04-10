import asyncio
from .full_list_extractor import run_engine

# Playwright 브라우저 동시 실행 방지용 전역 Lock
# 동시에 두 개 이상의 스크래핑이 실행되면 0건 반환 문제가 발생하므로 직렬화
_scraping_lock = asyncio.Lock()

async def fetch_realtime_ranking(keyword: str, province: str, target_store_name: str, lat: float = None, lon: float = None) -> list:
    """
    단건 실시간 조회 탭에 쓰일 기능:
    키워드를 검색하여 플레이스의 최대 30~50개 매장 리스트를 파싱하여,
    RealtimeRank DTO 형식의 리스트로 반환합니다.
    """
    if lat is None or lon is None:
        # province 기반 대략적인 좌표 하드코딩
        province_coords = {
            "서울": (37.5665, 126.9780),
            "부산": (35.1796, 129.0756),
            "인천": (37.4563, 126.7052),
            "대구": (35.8714, 128.6014),
            "대전": (36.3504, 127.3845),
            "광주": (35.1595, 126.8526),
            "세종": (36.4800, 127.2890),
            "경기": (37.2636, 127.0286),
        }
        lat, lon = province_coords.get(province, (37.5665, 126.9780))
        
    # run_engine 호출 (전역 Lock으로 직렬화 → 동시 실행 시 0건 반환 방지)
    raw_results = []
    async with _scraping_lock:
        for attempt in range(2):
            raw_results = await run_engine(
                keywords_list=[keyword],
                concurrency=1,
                target_lat=lat,
                target_lon=lon,
                max_scroll=80,
                target_store_name=target_store_name
            )
            if raw_results:
                break
            if attempt == 0:
                print(f"[랭킹 재시도] '{keyword}' 첫 시도 빈 결과 → 1회 자동 재시도")
                await asyncio.sleep(2)
    
    # 만약 결과가 없더라도 (오타 등), 500 에러를 던지지 않고 빈 배열([])을 프론트에 정상 반환하여
    # "순위 데이터가 없습니다"라는 UI 빈 화면 상태(Empty state)를 깔끔하게 보여주도록 통과시킵니다.
    # if not raw_results:
    #     raise Exception("검색 결과를 가져오지 못했습니다. 잠시 후 다시 시도해주세요. (네이버 일시적 응답 없음)")
    # 2. 결과 가공 (RealtimeRank DTO 형태)
    formatted_results = []
    total_results = len(raw_results)
    
    for item in raw_results:
        # 네이버 아이디(shopId)는 URL에서 추출
        # 예: https://m.place.naver.com/restaurant/11111111/home
        url = item.get("네이버_플레이스_URL", "")
        shop_id = "unknown"
        if url:
            try:
                parts = url.split("/")
                for i, p in enumerate(parts):
                    if p in ["restaurant", "place"] and i+1 < len(parts):
                        shop_id = parts[i+1]
                        break
            except:
                pass
                
        # DTO 규격 매핑
        formatted_results.append({
            "shopId": shop_id,
            "shopName": item.get("상호명", ""),
            "shopImageUrl": item.get("이미지_URL", ""),
            "category": item.get("카테고리", ""),
            "placeUrl": item.get("네이버_플레이스_URL", ""),
            "address": item.get("주소", ""),
            "roadAddress": item.get("주소", ""), # 플레이스 목록에선 지번/도로명 구분이 어려움
            "visitorReviewCount": item.get("방문자리뷰", "0"),
            "blogReviewCount": item.get("블로그리뷰", "0"),
            "scoreInfo": item.get("평점", "0"),
            "saveCount": item.get("저장수", "0"),
            "rank": item.get("순위", 0),
            "naturalRank": item.get("순위", 0),  # 광고 없으므로 rank와 동일
            "isAd": False,                        # 광고 수집 안 함
            "totalCount": total_results
        })
        
    # 자연 순위 오름차순 정렬
    formatted_results = sorted(formatted_results, key=lambda x: x["rank"])
    
    return formatted_results
