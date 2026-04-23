"""
[전수 테스트 2] Auth 도메인 - 라이선스 인증 & 폐기 테스트
- 개발모드 우회 인증
- RSA 서명 라이선스 정상 인증
- 잘못된 라이선스 거부 (401)
- 라이선스 폐기(Burn) 및 블랙리스트 확인
- 폐기된 라이선스 재사용 차단 (403)
"""
import pytest
import hashlib
import os
import jwt
from httpx import AsyncClient


def generate_test_license(license_id: str = "TEST-001", plan: str = "basic") -> str:
    """테스트용 JWT 라이선스 키 생성 (RSA 서명)"""
    keys_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "core", "auth_keys")
    private_key_path = os.path.join(keys_dir, "private_key.pem")
    
    if not os.path.exists(private_key_path):
        pytest.skip("private_key.pem 없음 - 라이선스 테스트 건너뜀")
    
    with open(private_key_path, "rb") as f:
        private_key = f.read()
    
    payload = {
        "license_id": license_id,
        "plan": plan,
    }
    token = jwt.encode(payload, private_key, algorithm="RS256")
    return token

pytestmark = pytest.mark.asyncio

DELETE_SALT = "DPLOG_DELETE_SUPER_SALT_X91"

SAMPLE_STORE = {
    "name": "인증 테스트 가게",
    "category": "음식점",
    "address": "서울시 종로구",
    "placeUrl": None,
    "phone": "010-0000-0000",
    "shopImageUrl": None,
    "shopImageThumbUrl": None,
    "keywords": None,
    "visitor_reviews": 0,
    "blog_reviews": 0,
    "saves": 0,
    "rating": 0.0,
    "scrape_status": "COMPLETED"
}


class TestLicenseVerification:
    """라이선스 인증 테스트"""

    async def test_dev_bypass_success(self, client: AsyncClient):
        """개발모드에서 'dev' 토큰 우회 인증"""
        resp = await client.post("/v1/auth/verify-license", json={"license_key": "dev"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["license_info"]["license_id"] == "DEV-TEST-ID"

    async def test_dev_bypass_token_success(self, client: AsyncClient):
        """개발모드에서 'dev-bypass-token' 우회 인증"""
        resp = await client.post("/v1/auth/verify-license", json={"license_key": "dev-bypass-token"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "success"

    async def test_invalid_license_rejected(self, client: AsyncClient):
        """잘못된 JWT 토큰 거부"""
        resp = await client.post("/v1/auth/verify-license", json={"license_key": "invalid-garbage-token"})
        assert resp.status_code == 401

    async def test_rsa_license_valid(self, client: AsyncClient):
        """실제 RSA 서명 라이선스 정상 인증"""
        token = generate_test_license("RSA-TEST-001", "premium")
        resp = await client.post("/v1/auth/verify-license", json={"license_key": token})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["license_info"]["license_id"] == "RSA-TEST-001"
        assert data["license_info"]["plan"] == "premium"


class TestLicenseBurn:
    """라이선스 폐기(Burn) 테스트"""

    async def test_dev_burn_success(self, client: AsyncClient):
        """개발모드 가게 폭파(삭제) + 라이선스 폐기"""
        # 1. 가게 등록
        await client.post("/v1/stores", json=SAMPLE_STORE)
        stores = (await client.get("/v1/stores/me")).json()
        assert len(stores) == 1

        # 2. 폭파
        resp = await client.post("/v1/auth/burn-license", json={
            "license_key": "dev",
            "delete_code": "dev"
        })
        assert resp.status_code == 200
        assert "삭제" in resp.json()["message"]

        # 3. 가게가 실제로 삭제되었는지 확인
        stores_after = (await client.get("/v1/stores/me")).json()
        assert len(stores_after) == 0

    async def test_burn_wrong_delete_code(self, client: AsyncClient):
        """잘못된 삭제 코드로 폭파 시도 → 400"""
        resp = await client.post("/v1/auth/burn-license", json={
            "license_key": "dev",
            "delete_code": "wrong-code"
        })
        assert resp.status_code == 400
        assert "삭제 코드" in resp.json()["detail"]

    async def test_rsa_burn_and_blacklist(self, client: AsyncClient):
        """RSA 라이선스 폭파 후 블랙리스트 등재, 재사용 차단"""
        # 1. 가게 등록
        await client.post("/v1/stores", json=SAMPLE_STORE)

        # 2. 라이선스 생성 및 삭제 코드 계산
        license_id = "BURN-TEST-002"
        token = generate_test_license(license_id, "basic")
        
        raw_str = f"{license_id}:{DELETE_SALT}"
        hashed = hashlib.sha256(raw_str.encode()).hexdigest()
        delete_code = f"DEL-{hashed[:8].upper()}"

        # 3. 폭파 실행
        resp = await client.post("/v1/auth/burn-license", json={
            "license_key": token,
            "delete_code": delete_code
        })
        assert resp.status_code == 200

        # 4. 블랙리스트 확인 (해당 라이선스로 인증 시도 → 403)
        verify_resp = await client.post("/v1/auth/verify-license", json={"license_key": token})
        assert verify_resp.status_code == 403
        assert "폐기" in verify_resp.json()["detail"]
