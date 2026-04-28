"""
시스템 상태/백업 API 테스트
"""
import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_system_status_sanitized(client: AsyncClient):
    resp = await client.get("/v1/system/status")
    assert resp.status_code == 200

    data = resp.json()
    assert data["backend"]["connected"] is True
    assert data["backend"]["version"]
    assert "database" in data
    assert "staticAssets" in data

    payload_text = str(data)
    assert "dplog_local_license" not in payload_text
    assert "license_key" not in payload_text


async def test_database_backup_missing_file_returns_404(client: AsyncClient):
    resp = await client.get("/v1/system/backup/db")
    assert resp.status_code == 404
