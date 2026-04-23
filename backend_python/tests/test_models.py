"""
[전수 테스트 4] 데이터베이스 & 모델 테스트
- SQLModel 테이블 생성/삭제 정상 동작
- Store, TrackedKeyword, KeywordRankHistory 관계(Relationship) 검증
- BlacklistedLicense 유니크 제약 조건
- DTO 스키마(StoreCreateRequest, TrackRequest 등) 직렬화/역직렬화
"""
import pytest
from datetime import datetime, timezone

pytestmark = pytest.mark.asyncio


class TestModels:
    """SQLModel 엔티티 및 DTO 테스트"""

    def test_store_base_defaults(self):
        """StoreBase 기본값 확인"""
        from domains.stores.model import StoreBase
        store = StoreBase(name="테스트", category="음식점", address="서울")
        assert store.visitor_reviews == 0
        assert store.blog_reviews == 0
        assert store.saves == 0
        assert store.rating == 0.0
        assert store.scrape_status == "PENDING"

    def test_store_create_request_inherits_base(self):
        """StoreCreateRequest가 StoreBase 필드를 상속하는지 확인"""
        from domains.stores.model import StoreCreateRequest
        req = StoreCreateRequest(
            name="테스트가게",
            category="카페",
            address="부산시"
        )
        assert req.name == "테스트가게"
        assert req.scrape_status == "PENDING"

    def test_store_update_request_optional(self):
        """StoreUpdateRequest의 모든 필드가 Optional인지"""
        from domains.stores.model import StoreUpdateRequest
        req = StoreUpdateRequest()
        assert req.name is None
        assert req.category is None
        assert req.address is None
        assert req.placeUrl is None
        assert req.phone is None

    def test_track_request_schema(self):
        """TrackRequest DTO 검증"""
        from domains.stores.model import TrackRequest
        req = TrackRequest(keyword="강남맛집", province="서울")
        assert req.keyword == "강남맛집"
        assert req.province == "서울"

    def test_chart_request_defaults(self):
        """ChartRequest 기본값 확인"""
        from domains.stores.model import ChartRequest
        req = ChartRequest(trackInfoIds=[1, 2, 3])
        assert req.interval == "daily"
        assert req.startDate is None

    def test_utc_now_helper(self):
        """get_utc_now가 timezone-aware datetime을 반환하는지"""
        from domains.stores.model import get_utc_now
        now = get_utc_now()
        assert now.tzinfo is not None
        assert now.tzinfo == timezone.utc


class TestDatabaseRelationships:
    """DB 관계(Relationship) 무결성 테스트"""

    async def test_store_with_review_tags(self, client):
        """Store 등록 후 review_tags 관계 존재 확인"""
        resp = await client.post("/v1/stores", json={
            "name": "관계 테스트 가게",
            "category": "한식",
            "address": "서울시 종로구",
            "placeUrl": None,
            "phone": None,
            "shopImageUrl": None,
            "shopImageThumbUrl": None,
            "keywords": None,
            "visitor_reviews": 0,
            "blog_reviews": 0,
            "saves": 0,
            "rating": 0.0,
            "scrape_status": "COMPLETED"
        })
        store_id = resp.json()["id"]
        
        detail_resp = await client.get(f"/v1/stores/{store_id}")
        data = detail_resp.json()
        assert isinstance(data["review_tags"], list)
        assert isinstance(data["recent_reviews"], list)

    async def test_tracked_keyword_creation(self, client):
        """TrackedKeyword 직접 DB 생성 테스트"""
        from core.database import async_session_maker
        from domains.stores.model import Store, TrackedKeyword

        async with async_session_maker() as session:
            store = Store(name="추적 테스트", category="맛집", address="서울")
            session.add(store)
            await session.commit()
            await session.refresh(store)

            tracked = TrackedKeyword(
                store_id=store.id,
                keyword="강남맛집",
                province="서울"
            )
            session.add(tracked)
            await session.commit()
            await session.refresh(tracked)

            assert tracked.id is not None
            assert tracked.keyword == "강남맛집"
            assert tracked.store_id == store.id
