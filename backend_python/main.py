import os
import sys
import time
import socket
import threading
import subprocess
from datetime import datetime
from dotenv import load_dotenv

print(f"\n[{datetime.now()}] ====== D-PLOG App Started ======")

load_dotenv()  # .env 파일에서 환경변수 로드

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.database import init_db
from domains.stores.router import router as stores_router
from domains.auth.router import router as auth_router

# ---------------------------------------------------------
# 1. 포트 자동 할당 및 브라우저 런처 (Chrome App Mode)
# ---------------------------------------------------------
def kill_process_on_port(port):
    import platform
    system = platform.system()
    if system == "Darwin" or system == "Linux":
        try:
            subprocess.run(f"lsof -ti:{port} | xargs kill -9", shell=True, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    elif system == "Windows":
        try:
            out = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True)
            for line in out.decode().splitlines():
                if "LISTENING" in line:
                    parts = line.strip().split()
                    pid = parts[-1]
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, stderr=subprocess.DEVNULL)
        except Exception:
            pass

GLOBAL_PORT = int(os.getenv("PORT", 45123))

def open_browser_app_mode(port):
    time.sleep(1.5)  # 서버 구동 대기
    url = f"http://127.0.0.1:{port}"
    chrome_path_mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    chrome_path_win = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    chrome_path_win_x86 = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    # 독립적인 크롬 프로필을 사용하여 쿠키 격리 및 네이티브 Single Instance(중복 실행 방지) 적용
    profile_dir = os.path.expanduser("~/.dplog/chrome_profile")
    
    cmd = None
    if os.path.exists(chrome_path_mac):
        cmd = [chrome_path_mac, f"--app={url}", f"--user-data-dir={profile_dir}", "--no-first-run", "--no-default-browser-check"]
    elif os.path.exists(chrome_path_win):
        cmd = [chrome_path_win, f"--app={url}", f"--user-data-dir={profile_dir}", "--no-first-run", "--no-default-browser-check"]
    elif os.path.exists(chrome_path_win_x86):
        cmd = [chrome_path_win_x86, f"--app={url}", f"--user-data-dir={profile_dir}", "--no-first-run", "--no-default-browser-check"]
    else:
        # 크롬이 정규 경로에 없을 경우 기본 브라우저 실행
        import webbrowser
        webbrowser.open(url)
        return
        
    try:
        subprocess.Popen(cmd)
    except Exception as e:
        print(f"브라우저 런처 실행 실패: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    
    # --- [취약점 패치 1] Zombie PENDING Tasks 방어 ---
    from core.database import engine
    from sqlmodel.ext.asyncio.session import AsyncSession
    from sqlmodel import select
    from domains.stores.model import Store
    
    try:
        async with AsyncSession(engine) as session:
            stmt = select(Store).where(Store.scrape_status == "PENDING")
            result = await session.execute(stmt)
            pending_stores = result.scalars().all()
            for store in pending_stores:
                store.scrape_status = "FAILED"
            if pending_stores:
                await session.commit()
                print(f"⚡ [System] 시작 시점의 PENDING 상태 상점 {len(pending_stores)}개를 FAILED로 강제 초기화했습니다.")
    except Exception as e:
        print(f"⚡ [System] PENDING 상태 롤백 실패: {e}")
    # ------------------------------------------------

    # [Task 반영] 버전 업데이트 알림(Version Checker) 로직은 추후 추가 예정
    threading.Thread(target=open_browser_app_mode, args=(GLOBAL_PORT,), daemon=True).start()
    yield

app = FastAPI(title="D-PLOG Edge Node API", version="1.0.0", lifespan=lifespan)

# CORS 적용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stores_router, prefix="/v1/stores")
app.include_router(auth_router, prefix="/v1/auth")

@app.get("/api/check-update")
async def check_update():
    """
    AWS Lightsail의 중앙 서버와 통신하여 현재 데스크탑 앱의 버전이 최신인지 확인합니다.
    """
    current_version = "1.0.0"
    
    # [TODO] 향후 AWS Lightsail API가 구축되면 활성화
    # try:
    #     import httpx
    #     async with httpx.AsyncClient() as client:
    #         response = await client.get("https://dplog.io/api/version", timeout=3.0)
    #         latest_version = response.json().get("version", current_version)
    # except Exception:
    #     latest_version = current_version
        
    # [개발 단계] 중앙 서버 API가 아직 없으므로 강제 업데이트 모달이 뜨지 않도록 동일 버전 반환
    latest_version = current_version 
    
    return {
        "isUpdateAvailable": current_version != latest_version,
        "currentVersion": current_version,
        "latestVersion": latest_version,
        "downloadUrl": "https://dplog.io"
    }

# ---------------------------------------------------------
# 2. 패키징 동적 경로 탐색 (Nuitka 호환)
# ---------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Nuitka로 패키징된 상태라면 static_out 폴더가 같은 경로에 있음
if os.path.isdir(os.path.join(BASE_DIR, "static_out")):
    FRONTEND_OUT_DIR = os.path.join(BASE_DIR, "static_out")
else:
    # 개발 환경에서는 상위 폴더의 frontend_dplog/out을 참조
    FRONTEND_OUT_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend_dplog", "out")

if os.path.isdir(FRONTEND_OUT_DIR):
    next_assets_dir = os.path.join(FRONTEND_OUT_DIR, "_next")
    if os.path.isdir(next_assets_dir):
        app.mount("/_next", StaticFiles(directory=next_assets_dir), name="next-static")

    static_media_dir = os.path.join(BASE_DIR, "static")
    if not os.path.exists(static_media_dir):
        os.makedirs(static_media_dir, exist_ok=True)
    app.mount("/static", StaticFiles(directory=static_media_dir), name="static-media")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"], response_class=FileResponse)
    async def serve_nextjs_ui(request: Request, full_path: str):
        if full_path.startswith("api/") or full_path.startswith("v1/"):
            raise HTTPException(status_code=404, detail="API Route Not Found")
        
        target_path = os.path.join(FRONTEND_OUT_DIR, full_path)
        if os.path.isfile(target_path):
            return FileResponse(target_path)
            
        html_target_path = target_path + ".html"
        if os.path.isfile(html_target_path):
            return FileResponse(html_target_path)
        
        index_path = os.path.join(FRONTEND_OUT_DIR, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        
        raise HTTPException(status_code=404, detail="UI index.html not found.")
else:
    print(f"⚠️ 경고: '{FRONTEND_OUT_DIR}' 폴더가 없습니다. 프론트엔드 정적 빌드가 필요합니다.")

# ---------------------------------------------------------
# 3. Uvicorn 단독 실행 블록 (Nuitka Entry Point)
# ---------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    kill_process_on_port(GLOBAL_PORT)
    print(f"🚀 D-PLOG 엣지 노드 기동 완료! (포트: {GLOBAL_PORT})")
    print(f"🌐 프론트엔드 서빙 경로: {FRONTEND_OUT_DIR}")
    # Nuitka 빌드본에서는 reload 옵션을 반드시 끄고, 
    # 문자열("main:app")이 아닌 앱 객체(app)를 직접 넘겨야 모듈 참조 에러가 나지 않습니다.
    uvicorn.run(app, host="127.0.0.1", port=GLOBAL_PORT, reload=False)
