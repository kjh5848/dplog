import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from core.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="D-PLOG Edge Node API", version="1.0.0", lifespan=lifespan)

# CORS 적용 (개발용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from domains.stores.router import router as stores_router
app.include_router(stores_router, prefix="/v1/stores")

# 프론트엔드 정적 파일 경로 (Next.js 빌드 산출물 폴더)
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
FRONTEND_OUT_DIR = os.path.join(BASE_DIR, "frontend_dplog", "out")

if os.path.isdir(FRONTEND_OUT_DIR):
    # 정적 에셋(_next 폴더 등)은 직접 효율적으로 서빙
    next_assets_dir = os.path.join(FRONTEND_OUT_DIR, "_next")
    if os.path.isdir(next_assets_dir):
        app.mount("/_next", StaticFiles(directory=next_assets_dir), name="next-static")

    static_media_dir = os.path.join(os.path.dirname(__file__), "static")
    if not os.path.exists(static_media_dir):
        os.makedirs(static_media_dir, exist_ok=True)
    app.mount("/static", StaticFiles(directory=static_media_dir), name="static-media")

    # [핵심] Catch-All Route (SPA 라우팅 지원)
    # 어떤 URL 주소를 치고 들어와도, 실제 파일이 없으면 index.html을 반환해야 Next.js (클라이언트 라우팅)가 작동합니다.
    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"], response_class=FileResponse)
    async def serve_nextjs_ui(request: Request, full_path: str):
        # 1. 만약 백엔드 API 호출인데 없는 주소라면 404를 명확히 떨군다.
        if full_path.startswith("api/") or full_path.startswith("v1/"):
            raise HTTPException(status_code=404, detail="API Route Not Found")
        
        # 2. 요청한 물리적 파일이 있으면(ex: /favicon.ico, /images/logo.png) 그대로 내려준다.
        target_path = os.path.join(FRONTEND_OUT_DIR, full_path)
        if os.path.isfile(target_path):
            return FileResponse(target_path)
            
        # 2-5. Next.js Static Export는 확장자 없는 경로에 대해 .html 파일을 생성함 (ex: /dashboard/stores/new -> /dashboard/stores/new.html)
        html_target_path = target_path + ".html"
        if os.path.isfile(html_target_path):
            return FileResponse(html_target_path)
        
        # 3. 브라우저 라우팅(ex: 동적 경로) 등 물리 파일이 없는 경우 index.html 반환 (Fallback)
        # 단, 정적 빌드에서는 가급적 위 2-5단계에서 처리되는 것이 이상적입니다.
        index_path = os.path.join(FRONTEND_OUT_DIR, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        
        raise HTTPException(status_code=404, detail="UI index.html not found.")
else:
    print(f"⚠️ 경고: '{FRONTEND_OUT_DIR}' 폴더가 존재하지 않습니다. 먼저 프론트엔드 환경에서 'npm run build' 를 실행하여 정적 자산을 추출하세요.")
