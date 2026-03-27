"""
헬스 체크 라우터
- GET /health — 서버 상태 확인
- GET /health/bedrock — Bedrock 연결 확인
"""

from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "ok",
        "service": "dplog-ai-worker",
        "version": "0.1.0",
    }


@router.get("/health/bedrock")
async def bedrock_health_check():
    """Bedrock 연결 확인 (boto3 클라이언트 초기화 테스트)"""
    try:
        import boto3

        client = boto3.client(
            "bedrock-runtime",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id or None,
            aws_secret_access_key=settings.aws_secret_access_key or None,
        )

        # 클라이언트 생성 성공 여부만 확인 (실제 호출은 하지 않음)
        return {
            "status": "ok",
            "region": settings.aws_region,
            "model_id": settings.bedrock_model_id,
            "message": "Bedrock 클라이언트 초기화 성공",
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Bedrock 연결 실패: {str(e)}",
        }
