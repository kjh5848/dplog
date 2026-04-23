"""
[전수 테스트 1] Stores 도메인 - CRUD & 비즈니스 로직 테스트
- 가게 등록 (POST)
- 가게 목록 조회 (GET /me)
- 가게 상세 조회 (GET /{store_id})
- 가게 1개 제한 (409 Conflict)
- 가게 동기화 (POST /{store_id}/sync)
"""
import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


# ========================================
# 헬퍼: 테스트용 가게 등록 데이터
# ========================================
SAMPLE_STORE = {
    "name": "테스트 치킨집",
    "category": "치킨,닭강정",
    "address": "서울특별시 강남구 역삼동 123-45",
    "placeUrl": None,  # 딥 스크래핑 트리거 방지
    "phone": "02-1234-5678",
    "shopImageUrl": None,
    "shopImageThumbUrl": None,
    "keywords": None,
    "visitor_reviews": 0,
    "blog_reviews": 0,
    "saves": 0,
    "rating": 0.0,
    "scrape_status": "COMPLETED"
}


class TestStoreRegistration:
    """가게 등록 관련 테스트"""

    async def test_register_store_success(self, client: AsyncClient):
        """정상적인 가게 등록"""
        resp = await client.post("/v1/stores", json=SAMPLE_STORE)
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "테스트 치킨집"
        assert data["category"] == "치킨,닭강정"
        assert data["id"] is not None

    async def test_register_store_duplicate_409(self, client: AsyncClient):
        """가게 중복 등록 시 409 에러"""
        # 첫 번째 등록
        await client.post("/v1/stores", json=SAMPLE_STORE)
        # 두 번째 등록 시도 → 409
        resp = await client.post("/v1/stores", json=SAMPLE_STORE)
        assert resp.status_code == 409
        assert "1개만" in resp.json()["detail"]

    async def test_register_store_with_place_url_triggers_pending(self, client: AsyncClient):
        """placeUrl 제공 시 scrape_status가 PENDING으로 설정되는지 확인"""
        store_with_url = dict(SAMPLE_STORE)
        store_with_url["placeUrl"] = "https://m.place.naver.com/restaurant/12345/home"
        resp = await client.post("/v1/stores", json=store_with_url)
        assert resp.status_code == 200
        data = resp.json()
        assert data["scrape_status"] == "PENDING"


class TestStoreRead:
    """가게 조회 관련 테스트"""

    async def test_get_my_stores_empty(self, client: AsyncClient):
        """등록된 가게가 없을 때 빈 배열 반환"""
        resp = await client.get("/v1/stores/me")
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_get_my_stores_with_data(self, client: AsyncClient):
        """가게 등록 후 목록 조회"""
        await client.post("/v1/stores", json=SAMPLE_STORE)
        resp = await client.get("/v1/stores/me")
        assert resp.status_code == 200
        stores = resp.json()
        assert len(stores) == 1
        assert stores[0]["name"] == "테스트 치킨집"

    async def test_get_store_detail_success(self, client: AsyncClient):
        """가게 상세 조회 성공"""
        create_resp = await client.post("/v1/stores", json=SAMPLE_STORE)
        store_id = create_resp.json()["id"]
        
        resp = await client.get(f"/v1/stores/{store_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "테스트 치킨집"
        assert "review_tags" in data
        assert "recent_reviews" in data

    async def test_get_store_detail_not_found(self, client: AsyncClient):
        """존재하지 않는 가게 조회 시 404"""
        resp = await client.get("/v1/stores/9999")
        assert resp.status_code == 404

    async def test_sync_store_not_found(self, client: AsyncClient):
        """존재하지 않는 가게 동기화 시 404"""
        resp = await client.post("/v1/stores/9999/sync")
        assert resp.status_code == 404


class TestFindMyRankInfo:
    """find_my_rank_info 헬퍼 함수 단위 테스트"""

    def test_empty_data_returns_none(self):
        """빈 데이터 입력 시 None 반환"""
        from domains.stores.router import find_my_rank_info
        from domains.stores.model import Store

        store = Store(name="테스트", category="맛집", address="서울")
        result, found = find_my_rank_info([], store)
        assert result is None
        assert found is False

    def test_match_by_place_url_shop_id(self):
        """placeUrl의 shopId로 매칭"""
        from domains.stores.router import find_my_rank_info
        from domains.stores.model import Store

        store = Store(
            name="테스트",
            category="맛집",
            address="서울",
            placeUrl="https://m.place.naver.com/restaurant/12345/home"
        )
        realtime_data = [
            {"shopId": "12345", "shopName": "테스트 치킨", "rank": 3},
            {"shopId": "99999", "shopName": "다른 가게", "rank": 1},
        ]
        result, found = find_my_rank_info(realtime_data, store)
        assert found is True
        assert result["shopId"] == "12345"

    def test_match_by_name_partial(self):
        """이름 부분 일치로 매칭"""
        from domains.stores.router import find_my_rank_info
        from domains.stores.model import Store

        store = Store(name="성심당", category="빵", address="대전")
        realtime_data = [
            {"shopId": "111", "shopName": "성심당 본점", "rank": 1},
        ]
        result, found = find_my_rank_info(realtime_data, store)
        assert found is True
        assert result["shopName"] == "성심당 본점"

    def test_no_match_returns_none_with_success(self):
        """매칭 실패 시 None 반환하되 is_success=True"""
        from domains.stores.router import find_my_rank_info
        from domains.stores.model import Store

        store = Store(name="없는가게", category="x", address="x")
        realtime_data = [
            {"shopId": "111", "shopName": "전혀다른가게", "rank": 1},
        ]
        result, found = find_my_rank_info(realtime_data, store)
        assert result is None
        assert found is True
