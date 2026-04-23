#!/bin/bash
# D-PLOG Edge Node Build Script for macOS
# 이 스크립트는 프론트엔드(Next.js)를 정적 빌드한 후,
# 백엔드(Python) 디렉토리로 복사하여 Nuitka를 통해 단일 실행 파일(.app)로 컴파일합니다.

set -e

echo "============================================"
echo "🚀 D-PLOG Edge Node Packaging Started (Mac) "
echo "============================================"

# 1. 프론트엔드 빌드 (Next.js Static Export)
echo "📦 [1/4] Building Next.js Frontend..."
cd frontend_dplog
npm install
# Desktop App 패키징 시 백엔드 포트를 강제 지정합니다.
export NEXT_PUBLIC_API_URL="http://127.0.0.1:45123"
npm run build
cd ..

# 2. 빌드 결과물 복사
echo "📂 [2/4] Copying Static Files to Backend..."
cd backend_python
rm -rf static_out
cp -r ../frontend_dplog/out static_out

# 3. 파이썬 환경 구성 및 Nuitka 설치 확인
echo "🐍 [3/4] Preparing Python Environment..."
# 가상환경 활성화 (필요 시 수정)
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

pip install -r requirements.txt
pip install nuitka

# 4. Nuitka 컴파일 (보안 및 난독화 옵션 포함)
echo "🔥 [4/4] Compiling with Nuitka..."
# --standalone: 의존성 패키지를 모두 포함하여 독립 실행 가능하게 함
# --macos-create-app-bundle: Mac용 .app 번들 생성
# --include-data-dir: 프론트엔드 빌드 결과물을 바이너리 내부에 포함
# --remove-output: 빌드 중간 캐시 파일 삭제
python -m nuitka \
    --standalone \
    --macos-create-app-bundle \
    --include-data-dir=static_out=static_out \
    --include-data-file=dplog.db=dplog.db \
    --output-filename=D-PLOG \
    --remove-output \
    main.py

echo "============================================"
echo "✅ Build Complete! App bundle is ready."
echo "============================================"
