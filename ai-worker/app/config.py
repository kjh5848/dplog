"""
D-PLOG AI Worker 설정 모듈
- pydantic-settings 기반 환경변수 로드
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """AI 워커 서버 환경변수 설정"""

    # AWS 자격증명
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "ap-northeast-2"

    # Bedrock
    bedrock_kb_id: str = ""
    bedrock_model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"

    # OpenSearch
    opensearch_endpoint: str = ""

    # 공공데이터 포털
    data_go_kr_api_key: str = ""

    # Spring Boot 메인 서버 연동
    spring_boot_callback_url: str = "http://localhost:8080"

    # 내부 통신 API 키
    ai_worker_api_key: str = "dev-ai-worker-key"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


# 싱글턴 인스턴스
settings = Settings()
