import os
import boto3
from dotenv import load_dotenv
from botocore.exceptions import NoCredentialsError

# 환경 변수 로드
load_dotenv(".env")

bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")

# 헤더 인젝터
def inject_bearer_token(request, **kwargs):
    if bearer_token:
        request.headers.add_header("Authorization", f"Bearer {bearer_token}")

try:
    # 빈 자격증명으로 초기화 (botocore 서명 에러 방지를 위해 의미 없는 값 넣기)
    client = boto3.client(
        "bedrock-runtime",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy"
    )
    
    # http 요청 직전에 헤더 강제 주입
    client.meta.events.register("request-created.bedrock-runtime", inject_bearer_token)
    
    # 테스트 호출 (Bedrock 모델 목록 조회 등, 여기서는 간단히 모델 invoke 에러 체크)
    # bedrock-runtime은 모델 호출만 가능하므로, 간단히 예외 발생 여부만 봅니다.
    print("Boto3 클라이언트 초기화 및 Interceptor 등록 성공.")
    
except Exception as e:
    print(f"Error: {e}")
