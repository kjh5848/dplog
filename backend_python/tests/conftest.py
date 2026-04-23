"""
전수 테스트를 위한 공통 Fixture 정의
- 테스트 전용 인메모리 SQLite DB
- FastAPI TestClient
- JWT 라이선스 키 생성 유틸
"""
import os
import sys
import pytest

# 프로젝트 루트를 PYTHONPATH에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# 테스트용 환경변수 오버라이드 (인메모리 DB)
os.environ["DATABASE_URL"] = "sqlite+aiosqlite://"
os.environ["NEXT_PUBLIC_APP_MODE"] = "local"

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import init_db, engine
from sqlmodel import SQLModel


@pytest.fixture(autouse=True)
async def setup_db():
    """각 테스트마다 깨끗한 DB 테이블 초기화"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    # 테스트 후 정리
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest.fixture
async def client():
    """비동기 HTTP 테스트 클라이언트"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
