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
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
# Desktop App 패키징 시 백엔드 포트를 강제 지정합니다.
export NEXT_PUBLIC_API_URL="http://127.0.0.1:45123"
export NEXT_PUBLIC_APP_MODE="local"
npm run build
cd ..

# 2. 빌드 결과물 복사
echo "📂 [2/4] Copying Static Files to Backend..."
cd backend_python
rm -rf static_out
cp -r ../frontend_dplog/out static_out

# 3. 파이썬 환경 구성 및 Nuitka 설치 확인
echo "🐍 [3/4] Preparing Python Environment..."
if [ -d "venv" ]; then
    PYTHON="venv/bin/python"
elif [ -d ".venv" ]; then
    PYTHON=".venv/bin/python"
else
    python3 -m venv venv
    PYTHON="venv/bin/python"
fi

"$PYTHON" -m pip install --upgrade pip
"$PYTHON" -m pip install -r requirements.txt
"$PYTHON" -m pip install nuitka ordered-set zstandard

# 4. Nuitka 컴파일 (보안 및 난독화 옵션 포함)
echo "🔥 [4/4] Compiling with Nuitka..."
# --standalone: 의존성 패키지를 모두 포함하여 독립 실행 가능하게 함
# --macos-create-app-bundle: Mac용 .app 번들 생성
# --include-data-dir: 프론트엔드 빌드 결과물을 앱 번들 내부에 포함
# --remove-output: 빌드 중간 캐시 파일 삭제
NUITKA_ARGS=(
    --standalone \
    --macos-create-app-bundle \
    --include-package=playwright \
    --include-package-data=playwright \
    --include-data-dir=static_out=static_out \
    --output-filename=D-PLOG \
    --output-dir=dist/macos \
    --remove-output \
)

if [ -f "dplog.db" ]; then
    NUITKA_ARGS+=(--include-data-file=dplog.db=dplog.db)
fi

"$PYTHON" -m nuitka "${NUITKA_ARGS[@]}" main.py

echo "============================================"
echo "✅ Build Complete! App bundle is ready."
echo "📦 Output: backend_python/dist/macos/*.app"
echo "============================================"
