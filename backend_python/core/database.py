import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

# 향후 배포 및 AWS 중앙 DB 이관을 고려하여, 초기 환경(SaaS 런칭 전 MVP)은 로컬 SQLite를 사용합니다.
# SQLite는 비동기 드라이버인 aiosqlite 를 사용합니다. (스크래핑 속도가 프레임 드랍을 일으키지 않도록)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
# 로컬 개발/설치형 배포 시에는 file DB를 사용
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{os.path.join(BASE_DIR, 'dplog.db')}")

# 엔진 생성 (SQLite 동시성 옵션 추가)
engine = create_async_engine(
    DATABASE_URL, 
    echo=True, # 테스트용 SQL 로깅 시 True
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# AsyncSession 팩토리 클래스
async_session_maker = sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# 의존성 주입(Dependency Injection)을 위한 FastAPI 세션 제공자
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

# 앱 초기 구동 시 테이블 자동 생성 유틸리티 (추후 Alembic으로 이관 권장)
async def init_db():
    async with engine.begin() as conn:
        # SQLModel로 선언된 모든 테이블을 DB에 밀어넣습니다.
        await conn.run_sync(SQLModel.metadata.create_all)
