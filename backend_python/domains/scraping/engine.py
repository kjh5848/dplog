import httpx
import re
import json
import asyncio
from .place_detail_extractor import scrape_place_details, extract_place_id
from .naver_ads_client import get_keyword_stats
from .keyword_scoring_engine import generate_scored_keywords

class ScrapingEngine:
    """
    네이버 지도 및 각종 스크래핑 로직을 캡슐화하는 Facade (엔진) 클래스.
    """
    
    @staticmethod
    async def search_store_by_name(query: str) -> list[dict]:
        """
        네이버 지도 모바일 API(SSR) 기반 상호명 검색
        """
        if not query:
            return []
            
        url_m = "https://m.map.naver.com/search"
        params = {"query": query}
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)",
            "Referer": "https://m.map.naver.com/"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(url_m, params=params, headers=headers, timeout=5.0)
                if resp.status_code == 200:
                    html_content = resp.text
                    results = []
                    matches = re.findall(r'window\.__RQ_STREAMING_STATE__\.push\((.*?)\);', html_content)
                    
                    for json_str in matches:
                        try:
                            data = json.loads(json_str)
                            queries = data.get("queries", [])
                            for q in queries:
                                q_data = q.get("state", {}).get("data", {})
                                if isinstance(q_data, dict) and "items" in q_data:
                                    items = q_data["items"]
                                    for item in items:
                                        if "id" in item and "name" in item:
                                            results.append({
                                                "id": str(item["id"]),
                                                "name": item.get("name", ""),
                                                "category": item.get("category", ""),
                                                "address": item.get("roadAddress", "") or item.get("address", ""),
                                                "thumUrl": item.get("thumbUrl", ""),
                                                "source": "map_ssr"
                                            })
                        except Exception:
                            continue

                    unique_results = []
                    seen = set()
                    for r in results:
                        if r['id'] not in seen:
                            seen.add(r['id'])
                            unique_results.append(r)
                            
                    return unique_results
        except Exception as e:
            print(f"[ScrapingEngine] search_store_by_name error: {e}")
            
        return []

    @staticmethod
    async def deep_scrape_store(place_url: str):
        """
        URL 또는 Place ID를 기반으로 네이버 지도 딥 스크래핑을 수행.
        Playwright 브라우저 엔진을 구동합니다.
        """
        place_id_clean = await extract_place_id(place_url)
        details = await scrape_place_details(place_id_clean)
        
        if not details.get("name") and details.get("visitor_reviews", 0) == 0:
            raise ValueError("상점 추출 실패 (잘못된 URL 혹은 IP 차단)")
            
        return place_id_clean, details

    @staticmethod
    async def fetch_keyword_ads_stats(keywords: list[str]):
        """
        네이버 검색광고 API를 통해 다수 키워드의 트래픽(월간 검색량 등) 조회
        """
        return await get_keyword_stats(keywords)

    @staticmethod
    async def discover_golden_keywords(base_keyword: str, target_store_name: str, target_lat: float, target_lon: float, target_placeUrl: str = None) -> dict:
        """
        [엔진 진입점]
        가게 이름과 위경도를 바탕으로 황금키워드를 재귀적으로 발굴하고 그룹핑(High/Mid/Low)합니다.
        """
        results = await generate_scored_keywords(
            base_keyword=base_keyword,
            target_store_name=target_store_name,
            target_lat=target_lat,
            target_lon=target_lon,
            target_placeUrl=target_placeUrl
        )
        return results
