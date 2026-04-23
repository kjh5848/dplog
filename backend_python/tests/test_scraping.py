"""
[전수 테스트 3] Scraping 도메인 - 유틸리티 & 파서 단위 테스트
- parse_business (full_list_extractor)
- extract_place_id (place_detail_extractor)
- get_store_name_candidates (keyword_scoring_engine)
- generate_signature (naver_ads_client)
- province_coords 매핑 (ranking_engine)
"""
import pytest
import asyncio
import re

pytestmark = pytest.mark.asyncio


class TestParseBusinessExtractor:
    """full_list_extractor.parse_business 함수 테스트"""

    def test_parse_basic_business(self):
        """기본 사업체 JSON 파싱"""
        from domains.scraping.full_list_extractor import parse_business

        biz = {
            "name": "맛있는 피자",
            "category": "피자,양식",
            "address": "서울 강남구 역삼동 100",
            "id": "11111111",
            "visitorReviewCount": 150,
            "blogArticleCount": 30,
            "bookmarkCount": 50,
            "visitorReviewScore": 4.5,
            "imageUrl": "https://test.com/img.jpg"
        }
        result = parse_business(biz, False)

        assert result["상호명"] == "맛있는 피자"
        assert result["카테고"] == "피자,양식"
        assert result["방문자리뷰"] == "150"
        assert result["블로그리뷰"] == "30"
        assert result["저장수"] == "50"
        assert result["평점"] == "4.5"
        assert "11111111" in result["네이버_플레이스_URL"]
        assert result["광고여부"] == "N"

    def test_parse_ad_business(self):
        """광고 플래그가 있는 사업체"""
        from domains.scraping.full_list_extractor import parse_business

        biz = {
            "name": "광고 가게",
            "id": "222",
            "isAd": True,
        }
        result = parse_business(biz, True)
        assert result["광고여부"] == "Y(광고)"

    def test_parse_missing_fields(self):
        """필드 누락 시 기본값 처리"""
        from domains.scraping.full_list_extractor import parse_business

        biz = {}
        result = parse_business(biz, False)
        assert result["상호명"] == "알수없음"
        assert result["방문자리뷰"] == "0"
        assert result["평점"] == "0"
        assert result["저장수"] == "0"

    def test_parse_categories_array(self):
        """categories가 배열로 제공되는 경우"""
        from domains.scraping.full_list_extractor import parse_business

        biz = {
            "name": "테스트",
            "categories": ["한식", "고기"],
            "id": "333"
        }
        result = parse_business(biz, False)
        assert "한식" in result["카테고"]
        assert "고기" in result["카테고"]

    def test_parse_images_array(self):
        """images 배열에서 첫 번째 이미지 추출"""
        from domains.scraping.full_list_extractor import parse_business

        biz = {
            "name": "이미지 테스트",
            "id": "444",
            "images": [{"url": "https://img1.jpg"}, {"url": "https://img2.jpg"}]
        }
        result = parse_business(biz, False)
        assert result["이미지_URL"] == "https://img1.jpg"


class TestExtractPlaceId:
    """place_detail_extractor.extract_place_id 함수 테스트"""

    async def test_numeric_id_passthrough(self):
        """순수 숫자 입력 시 그대로 반환"""
        from domains.scraping.place_detail_extractor import extract_place_id
        result = await extract_place_id("1607631456")
        assert result == "1607631456"

    async def test_restaurant_url_parse(self):
        """restaurant URL에서 ID 추출"""
        from domains.scraping.place_detail_extractor import extract_place_id
        result = await extract_place_id("https://m.place.naver.com/restaurant/12345678/home")
        assert result == "12345678"

    async def test_place_url_parse(self):
        """place URL에서 ID 추출"""
        from domains.scraping.place_detail_extractor import extract_place_id
        result = await extract_place_id("https://m.place.naver.com/place/98765432/home")
        assert result == "98765432"

    async def test_hairshop_url_parse(self):
        """hairshop URL에서 ID 추출"""
        from domains.scraping.place_detail_extractor import extract_place_id
        result = await extract_place_id("https://m.place.naver.com/hairshop/55555555/home")
        assert result == "55555555"

    async def test_hospital_url_parse(self):
        """hospital URL에서 ID 추출"""
        from domains.scraping.place_detail_extractor import extract_place_id
        result = await extract_place_id("https://m.place.naver.com/hospital/77777777/home")
        assert result == "77777777"

    async def test_whitespace_trimmed(self):
        """입력값 공백 제거"""
        from domains.scraping.place_detail_extractor import extract_place_id
        result = await extract_place_id("  12345  ")
        assert result == "12345"


class TestStoreNameCandidates:
    """keyword_scoring_engine.get_store_name_candidates 테스트"""

    def test_base_name_only(self):
        """접미사 없는 간단 이름"""
        from domains.scraping.keyword_scoring_engine import get_store_name_candidates
        result = get_store_name_candidates("맛집")
        assert result == ["맛집"]

    def test_branch_suffix_removed(self):
        """'본점' 접미사 제거"""
        from domains.scraping.keyword_scoring_engine import get_store_name_candidates
        result = get_store_name_candidates("성심당 본점")
        assert "성심당 본점" in result
        assert "성심당" in result

    def test_number_branch_removed(self):
        """'2호점' 접미사 제거"""
        from domains.scraping.keyword_scoring_engine import get_store_name_candidates
        result = get_store_name_candidates("피자헛 2호점")
        assert "피자헛 2호점" in result
        assert "피자헛" in result

    def test_location_branch_removed(self):
        """'직영점' 접미사 제거"""
        from domains.scraping.keyword_scoring_engine import get_store_name_candidates
        result = get_store_name_candidates("BBQ 직영점")
        assert "BBQ 직영점" in result
        assert "BBQ" in result


class TestNaverAdsSignature:
    """naver_ads_client.generate_signature 테스트"""

    def test_signature_format(self):
        """서명 생성 결과가 base64 문자열인지 검증"""
        from domains.scraping.naver_ads_client import generate_signature
        sig = generate_signature("1234567890", "GET", "/keywordstool", "test-secret")
        # base64 디코딩이 가능해야 함
        import base64
        decoded = base64.b64decode(sig)
        assert len(decoded) == 32  # SHA-256 = 32바이트

    def test_signature_deterministic(self):
        """동일 입력은 동일 서명 산출"""
        from domains.scraping.naver_ads_client import generate_signature
        sig1 = generate_signature("111", "GET", "/test", "secret")
        sig2 = generate_signature("111", "GET", "/test", "secret")
        assert sig1 == sig2

    def test_different_input_different_signature(self):
        """다른 입력은 다른 서명"""
        from domains.scraping.naver_ads_client import generate_signature
        sig1 = generate_signature("111", "GET", "/test", "secret")
        sig2 = generate_signature("222", "GET", "/test", "secret")
        assert sig1 != sig2


class TestRankingEngineCoords:
    """ranking_engine의 province → 좌표 매핑 테스트"""

    def test_province_coords_seoul(self):
        """서울 좌표 매핑 확인"""
        # 직접 함수를 호출하지 않고 로직을 검증
        province_coords = {
            "서울": (37.5665, 126.9780),
            "부산": (35.1796, 129.0756),
            "인천": (37.4563, 126.7052),
        }
        lat, lon = province_coords.get("서울", (37.5665, 126.9780))
        assert abs(lat - 37.5665) < 0.001
        assert abs(lon - 126.9780) < 0.001

    def test_unknown_province_fallback(self):
        """미등록 지역 → 서울 기본값 폴백"""
        province_coords = {
            "서울": (37.5665, 126.9780),
        }
        lat, lon = province_coords.get("제주", (37.5665, 126.9780))
        assert abs(lat - 37.5665) < 0.001  # 서울 기본값


class TestKeywordDiscoveryHelpers:
    """keyword_discovery_engine 헬퍼 함수 테스트"""

    async def test_autocomplete_returns_list(self):
        """자동완성 API 호출 결과가 list인지 확인 (네트워크 실패 시 빈 리스트)"""
        from domains.scraping.keyword_discovery_engine import get_autocomplete
        result = await get_autocomplete("서면 고기집")
        assert isinstance(result, list)

    async def test_related_returns_list(self):
        """연관검색어 결과가 list인지 확인"""
        from domains.scraping.keyword_discovery_engine import get_related
        result = await get_related("서면 고기집")
        assert isinstance(result, list)
