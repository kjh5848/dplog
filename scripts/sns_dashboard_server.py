import os
import asyncio
from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import datetime
from playwright.async_api import async_playwright
import platform

app = FastAPI(title="SNS Session Dashboard")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
NAVER_SESSION_FILE = os.path.join(SCRIPT_DIR, "naver_session.json")
INSTA_SESSION_FILE = os.path.join(SCRIPT_DIR, "insta_session.json")

# 템플릿 마운트가 굳이 필요 없이 단일 HTML 제공용으로 라우트 분리
# (html 코드는 동일 폴더의 sns_dashboard.html 에서 읽어 반환)

@app.get("/", response_class=HTMLResponse)
async def get_dashboard():
    html_path = os.path.join(SCRIPT_DIR, "sns_dashboard.html")
    if not os.path.exists(html_path):
        return "<h1>대시보드 HTML 파일(sns_dashboard.html)이 없습니다.</h1>"
    with open(html_path, "r", encoding="utf-8") as f:
        return f.read()

def get_file_status(filepath):
    if os.path.exists(filepath):
        mtime = os.path.getmtime(filepath)
        dt = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
        size_kb = round(os.path.getsize(filepath) / 1024, 1)
        return {"status": "active", "last_updated": dt, "size": f"{size_kb} KB"}
    return {"status": "missing", "last_updated": "-", "size": "-"}

@app.get("/api/status")
async def get_all_status():
    return {
        "naver": get_file_status(NAVER_SESSION_FILE),
        "instagram": get_file_status(INSTA_SESSION_FILE)
    }

# --- 자동 로그인/세션 생성 라우트 ---
# (실제 환경에서는 브라우저 팝업을 띄우는 코드를 백그라운드로 실행합니다)

async def run_naver_login():
    """네이버 100% 자동 로그인 스크립트 실행 (세션 추출 목적)"""
    from dotenv import load_dotenv
    import pyperclip
    
    load_dotenv(dotenv_path=os.path.join(SCRIPT_DIR, ".env.naver"))
    nid = os.getenv("NAVER_ID")
    npw = os.getenv("NAVER_PW")
    
    if not nid or not npw:
        print("네이버 계정 정보가 설정되지 않았습니다.")
        return
        
    MODIFIER = "Meta" if platform.system() == "Darwin" else "Control"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=['--disable-blink-features=AutomationControlled'])
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        await page.goto("https://nid.naver.com/nidlogin.login?mode=form")
        await page.wait_for_selector("#id", state="visible")
        await asyncio.sleep(1)
        
        pyperclip.copy(nid)
        await page.click("#id")
        await page.keyboard.press(f"{MODIFIER}+v")
        await asyncio.sleep(0.5)
        
        pyperclip.copy(npw)
        await page.click("#pw")
        await page.keyboard.press(f"{MODIFIER}+v")
        await asyncio.sleep(0.5)
        
        pyperclip.copy("")
        await page.click(".btn_login")
        await asyncio.sleep(4)
        
        # 홈 화면 또는 내 정보 화면으로 갔는지 확인
        await page.goto("https://www.naver.com/")
        await asyncio.sleep(2)
        
        await context.storage_state(path=NAVER_SESSION_FILE)
        print("네이버 세션 갱신 완료")
        await browser.close()


async def run_insta_login():
    """인스타그램 100% 자동 로그인 스크립트 실행 (세션 추출 목적)"""
    from dotenv import load_dotenv
    import pyperclip
    
    load_dotenv(dotenv_path=os.path.join(SCRIPT_DIR, ".env.naver"))
    iid = os.getenv("INSTA_ID")
    ipw = os.getenv("INSTA_PW")
    
    if not iid or not ipw:
        print("인스타그램 계정 정보가 설정되지 않았습니다.")
        return
        
    MODIFIER = "Meta" if platform.system() == "Darwin" else "Control"
    
    async with async_playwright() as p:
        # iPhone 속여서 진입 (모바일 레이아웃)
        browser = await p.chromium.launch(headless=False, args=['--disable-blink-features=AutomationControlled'])
        context = await browser.new_context(
            **p.devices["iPhone 13"]
        )
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        page = await context.new_page()
        
        # 유저가 요청한 juble_table 피드로 접속
        await page.goto("https://www.instagram.com/juble_table/")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        
        # 로그인 폼이 떠있지 않고 앱 유도 모달/화면이라면 '로그인'을 눌러 폼을 호출합니다
        inputs = await page.locator("input").count()
        if inputs < 2:
            print("📱앱 유도 화면/모달 감지. 우회 시작...")
            try:
                # 1단계: 모달의 X(닫기) 버튼이 있다면 먼저 치워버립니다.
                if await page.locator("svg[aria-label='닫기']").count() > 0:
                    await page.locator("svg[aria-label='닫기']").first.locator("..").click()
                    await asyncio.sleep(1)
                    
                # 2단계: 상단 헤더에 숨어있는 '로그인' 텍스트를 찾아서 강제(force) 클릭합니다. 모달에 가려져 있어도 강전송됩니다.
                await page.locator("text=로그인").first.click(force=True)
                await asyncio.sleep(3)
            except Exception as e:
                print("⚠️ 로그인 버튼 탐색 실패:", e)

        inputs = await page.locator("input").count()
        if inputs >= 2:
            pyperclip.copy(iid)
            await page.locator("input[name='username']").first.click()
            await page.keyboard.press(f"{MODIFIER}+v")
            await asyncio.sleep(0.5)
            
            pyperclip.copy(ipw)
            await page.locator("input[name='password']").first.click()
            await page.keyboard.press(f"{MODIFIER}+v")
            await asyncio.sleep(0.5)
            
            # 로그인 버튼 (모바일 웹 구조 변동 대응)
            try:
                # '로그인' 이라는 정확한 텍스트를 가진 버튼(혹은 div 역할 버튼) 중 가장 마지막 것(모바일 중앙 버튼) 
                login_btn = page.get_by_text("로그인", exact=True).last
                await login_btn.click()
            except:
                await page.keyboard.press("Enter")
                
            await asyncio.sleep(5) # 로그인 넘어갈 때까지 대기
            
            # 팝업 제거 시도 (정보 저장 여부 등)
            try:
                if await page.get_by_text("나중에 하기").is_visible(timeout=3000):
                    await page.get_by_text("나중에 하기").first.click()
            except: pass
            
        await asyncio.sleep(2)
        await context.storage_state(path=INSTA_SESSION_FILE)
        print("인스타그램 세션 갱신 완료")
        await browser.close()


@app.post("/api/login/naver")
async def trigger_naver_login(background_tasks: BackgroundTasks):
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(SCRIPT_DIR, ".env.naver"))
    if not os.getenv("NAVER_ID") or not os.getenv("NAVER_PW"):
        return {"error": "네이버 계정 정보(NAVER_ID/PW)가 .env 파일에 없습니다. 입력 후 다시 시도하세요."}
        
    background_tasks.add_task(run_naver_login)
    return {"message": "네이버 자동 로그인 봇이 가동되었습니다."}

@app.post("/api/login/insta")
async def trigger_insta_login(background_tasks: BackgroundTasks):
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(SCRIPT_DIR, ".env.naver"))
    if not os.getenv("INSTA_ID") or not os.getenv("INSTA_PW"):
        return {"error": "인스타그램 계정 정보(INSTA_ID/PW)가 .env 파일에 없습니다. 파일 저장(Ctrl+S) 후 다시 시도하세요."}
        
    background_tasks.add_task(run_insta_login)
    return {"message": "인스타 자동 로그인 봇이 가동되었습니다. 화면에 창이 뜰 때까지 기다려주세요!"}

@app.delete("/api/session/{platform}")
async def delete_session(platform: str):
    file_path = NAVER_SESSION_FILE if platform == "naver" else INSTA_SESSION_FILE
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"{platform} 세션이 삭제되었습니다."}
    return {"message": "세션 파일이 이미 없습니다."}

@app.post("/api/publish/insta")
async def trigger_insta_publish(background_tasks: BackgroundTasks):
    import subprocess
    def run_script():
        # open_insta.py 자체가 독립 스크립트로 동작하므로 파이썬으로 직접 실행
        script_path = os.path.join(SCRIPT_DIR, "sns_publish", "open_insta.py")
        subprocess.run(["python", script_path])
    background_tasks.add_task(run_script)
    return {"message": "인스타그램 업로드 봇이 출동했습니다! 창을 확인하세요."}
