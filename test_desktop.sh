#!/bin/bash
# D-PLOG 데스크탑 환경 빠른 시뮬레이션 스크립트 (Nuitka 패키징 생략)
# 패키징에 시간이 오래 걸리므로, 실제 패키징된 환경(Static 서빙 + 로컬 FastAPI)과 
# 100% 동일하게 동작하는지 테스트할 때 사용합니다.

set -e

echo "============================================"
echo "🚀 D-PLOG 데스크탑 환경 시뮬레이션 (패키징 제외)"
echo "============================================"

# 1. 프론트엔드 정적 빌드
echo "📦 [1/3] Building Next.js Frontend..."
cd frontend_dplog
# Desktop App 시뮬레이션을 위해 백엔드 포트를 강제 지정
export NEXT_PUBLIC_API_URL="http://127.0.0.1:45123"
export NEXT_PUBLIC_APP_MODE="local"
npm run build
cd ..

# 2. 빌드 결과물을 파이썬 폴더로 복사
echo "📂 [2/3] Copying Static Files to Backend..."
cd backend_python
rm -rf static_out
cp -r ../frontend_dplog/out static_out

# 3. 파이썬 환경 구동
echo "🐍 [3/3] Running Python Backend (Simulating Packaged App)..."
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# 패키징된 앱처럼 실행
python main.py
