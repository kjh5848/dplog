"""
D-PLOG AI Worker - FastAPI 메인 애플리케이션
"""

from fastapi import FastAPI
from app.routers import health

# FastAPI 앱 생성
app = FastAPI(
    title="D-PLOG AI Worker",
    description="D-PLOG AI 워커 서버 (Bedrock RAG + 공공데이터 파이프라인)",
    version="0.1.0",
)

# 라우터 등록
app.include_router(health.router, tags=["Health"])
