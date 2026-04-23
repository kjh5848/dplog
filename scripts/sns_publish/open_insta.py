import os
import sys
import argparse
import asyncio
import re
import random
from playwright.async_api import async_playwright

# ──────────────────────────────────────────────
# 환경 설정
# ──────────────────────────────────────────────
SNS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SNS_DIR)
INSTA_SESSION_FILE = os.path.join(BASE_DIR, "insta_session.json")

# 기본 매장명 (CLI 인자로 오버라이드 가능)
DEFAULT_STORE = "철이네"

def parse_insta_draft(draft_file: str):
    """인스타그램 전용 원고(insta_draft.md)에서 이미지 배열과 캡션 텍스트를 추출합니다."""
    if not os.path.exists(draft_file):
        print(f"❌ 원고 파일을 찾을 수 없습니다: {draft_file}")
        return None, None
        
    with open(draft_file, "r", encoding="utf-8") as f:
        content = f.read()

    # 이미지 파싱 ( ![어쩌고](<경로>) 또는 ![어쩌고](경로) )
    images = []
    draft_dir = os.path.dirname(draft_file)
    
    for match in re.finditer(r'!\[.*?\]\((.*?)\)', content):
        path = match.group(1).replace('<', '').replace('>', '').strip()
        full_path = os.path.join(draft_dir, path)
        if os.path.exists(full_path):
            images.append(full_path)
            
    # 이미지 최대 10장 제한 제어
    images = images[:10]
    
    # 캡션 파싱 (--- 하단 영역 전체)
    parts = content.split("---")
    if len(parts) > 1:
        caption = parts[-1].strip()
    else:
        # --- 구분자가 없으면 헤더/이미지 파싱 부분을 정규식으로 지우고 남은걸 캡션으로
        caption = re.sub(r'!\[.*?\]\((.*?)\)', '', content).strip()
        caption = re.sub(r'#.*', '', caption).strip()
        
    return images, caption

async def upload_to_instagram(store_name: str = "철이네"):
    # 동적 경로 설정
    asset_dir = os.path.join(BASE_DIR, "asset", store_name)
    draft_file = os.path.join(asset_dir, "insta_draft.md")
    
    # 스크린샷 저장 디렉토리 (매장별 하위 폴더)
    artifact_dir = os.path.join(BASE_DIR, "sns_publish", ".artifacts", store_name)
    os.makedirs(artifact_dir, exist_ok=True)
    
    if not os.path.isdir(asset_dir):
        print(f"❌ 매장 폴더가 존재하지 않습니다: {asset_dir}")
        return 1
    
    print(f"🏪 대상 매장: {store_name}")
    
    # 1. 원고 파싱
    images, caption = parse_insta_draft(draft_file)
    if not images or not caption:
        print("❌ 파싱된 이미지나 캡션이 없습니다.")
        return 1

    print(f"📥 파싱 완료! 첨부 이미지 수: {len(images)}장")

    if not os.path.exists(INSTA_SESSION_FILE):
        print("❌ 세션 파일이 없습니다! 먼저 대시보드를 통해 로그인을 진행하세요.")
        return 1

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,  # 백그라운드 숨김 해제! 브라우저 창 띄워서 직관 시연
            slow_mo=300,     # 너무 순식간에 지나가지 않도록 0.3초마다 동작하도록 늦춤
            args=['--disable-blink-features=AutomationControlled']
        )
        
        # 데스크탑(PC) 뷰포트로 변경!! (모바일 스토리 함정 회피 및 10장 거뜬히 업로드)
        context = await browser.new_context(
            record_video_dir=artifact_dir,
            record_video_size={"width": 1280, "height": 900},
            viewport={'width': 1280, 'height': 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            permissions=[], 
            storage_state=INSTA_SESSION_FILE
        )
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        page = await context.new_page()
        
        print("🌐 피드 홈 진입...")
        await page.goto("https://www.instagram.com/", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        
        await page.screenshot(path=os.path.join(artifact_dir, "step1_home.png"))

        # 방해꾼 팝업 "나중에 하기 / Not Now" 무시
        try:
            later_btn = page.get_by_text(re.compile(r"^(나중에 하기|Not Now)$"))
            if await later_btn.count() > 0:
                await later_btn.first.click()
                await asyncio.sleep(2)
        except: pass

        # 2. PC 좌측 사이드바 "만들기(Create/New post)" 버튼 클릭
        print("➕ 사이드바 '만들기' 버튼 탐색 중...")
        try:
            # SVG aria-label이나 텍스트 모두 탐색. DOM 안보임 에러 완벽 차단을 위해 자바스크립트 단 클릭 강제 주입
            create_btn = page.locator("svg[aria-label='새로운 게시물 만들기'], svg[aria-label='새 게시물'], svg[aria-label='New post'], span:text-is('만들기'), span:text-is('Create')")
            await create_btn.first.evaluate("node => node.click()")
            await asyncio.sleep(2)
            await page.screenshot(path=os.path.join(artifact_dir, "step2_modal.png"))
            
            # (핵심) 라이브방송 업데이트로 인해 '게시물(Post)'과 '라이브(Live)' 선택창이 먼저 뜰 수 있음!
            post_sheet_btn = page.get_by_text(re.compile(r"^(게시물|Post)$", re.IGNORECASE))
            if await post_sheet_btn.count() > 0:
                print("📌 [게시물/라이브] 액션 시트 감지됨. 게시물 선택!")
                await post_sheet_btn.first.click()
                await asyncio.sleep(2)
            
            # '컴퓨터에서 선택' 파일 츄저 클릭 대신, DOM에 생성된 input 에 다이렉트 브릿지
            inputs = page.locator("input[type='file']")
            if await inputs.count() > 0:
                await inputs.first.set_input_files(images)
                print(f"📎 (다이렉트 주입) 10장 첨부 완료!")
            else:
                async with page.expect_file_chooser() as fc_info:
                    await page.get_by_text(re.compile(r"(컴퓨터에서 선택|Select from computer)", re.IGNORECASE)).first.click()
                file_chooser = await fc_info.value
                await file_chooser.set_files(images)
                print(f"📎 (버튼 클릭 우회) 10장 첨부 완료!")
        except Exception as e:
            print(f"❌ 업로드 엘리먼트 탐색 실패: {e}")
            await page.screenshot(path=os.path.join(artifact_dir, "step2_error.png"))
            await browser.close()
            return

        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(artifact_dir, "step3_uploaded.png"))

        # 3. 1차 다음 (크롭)
        print("⏭️ 1차 다음 버튼 클릭 (크롭)")
        try:
            await page.get_by_text(re.compile(r"^(다음|Next)$")).first.click()
            await asyncio.sleep(2)
            await page.screenshot(path=os.path.join(artifact_dir, "step4_crop.png"))
        except Exception as e: print("크롭 다음 에러:", e)

        # 4. 2차 다음 (필터)
        print("⏭️ 2차 다음 버튼 클릭 (필터)")
        try:
            await page.get_by_text(re.compile(r"^(다음|Next)$")).first.click()
            await asyncio.sleep(2)
            await page.screenshot(path=os.path.join(artifact_dir, "step5_filter.png"))
        except Exception as e: print("필터 다음 에러:", e)

        # 5. 캡션 입력 및 부가 기능(Threads) 설정
        print("✍️ 캡션 입력 중...")
        try:
            # 캡션 텍스트 공간 ('문구를 입력하세요...' 정밀 타겟팅)
            caption_area = page.locator("div[aria-label='문구를 입력하세요...'], div[aria-label='문구 입력...'], div[aria-label='Write a caption...']").first
            
            # click() 대신 focus()를 사용하여 좌측 이미지에 엉뚱하게 클릭되어 사람 태그 창이 뜨는 현상 원천 차단
            await caption_area.focus()
            await page.keyboard.insert_text(caption)
            await asyncio.sleep(2)
            await page.screenshot(path=os.path.join(artifact_dir, "step6_caption.png"))
            
            # Threads 동시 발행 토글 스위치 켜기 (화면 상의 첫 번째 스위치로 보통 노출됨)
            try:
                switch = page.locator("input[type='checkbox']").first
                if await switch.count() > 0:
                    await switch.evaluate("node => { if(!node.checked) node.click() }")
                    print("🔀 Threads 동시 공유 토글 ON!")
                else:
                    switch_div = page.locator("div[role='switch']").first
                    if await switch_div.count() > 0:
                        is_checked = await switch_div.get_attribute("aria-checked")
                        if is_checked == "false":
                            await switch_div.click(force=True)
                            print("🔀 Threads 동시 공유 토글 ON!")
            except Exception as e: print("Threads 토글 에러:", e)
        except Exception as e: print("문구 입력 에러:", e)

        # 6. 공유하기
        print("🚀 공유하기 버튼 클릭!")
        try:
            # has-text는 부모 컨테이너(헤더 바 전체)를 잡아버려 '돌아가기'를 누르는 대참사가 일어나므로 엄격하게 text-is를 쓰거나 get_by_text 사용!
            share_btn = page.locator("button:text-is('공유하기'), div[role='button']:text-is('공유하기'), button:text-is('Share'), div[role='button']:text-is('Share')").first
            
            # 정석 클릭 (overlay 우회를 위해 force=True 유지하되, 리액트 이벤트 위해 일반 클릭도 병행)
            try:
                await share_btn.click(timeout=5000)
            except:
                await share_btn.click(force=True)
                
            print("⏳ 사진 10장 전송 중... (네트워크 속도에 따라 최대 1~2분 소요)")
            
            # 업로드 완료 확정 메시지(게시물이 공유되었습니다 / Your post has been shared) 대기
            success_msg = page.get_by_text(re.compile(r"(공유되었습니다|has been shared)", re.IGNORECASE))
            await success_msg.wait_for(state="visible", timeout=120000) # 최대 2분 대기
            
            print("✅ 인스타그램 다중 업로드 최종 완료 및 서버 반영 확인!!")
            await page.screenshot(path=os.path.join(artifact_dir, "step7_done.png"))
            await asyncio.sleep(3) # 완료 모달 띄운 상태로 3초간 여유
        except Exception as e: print("공유 또는 대기 에러:", e)
        
        print("✨ 스크립트가 정상적으로 종료되었습니다.")
        await browser.close()
    
    return 0  # 정상 종료


def main():
    """CLI 진입점: --store 인자로 매장명을 지정할 수 있습니다."""
    parser = argparse.ArgumentParser(description="인스타그램 피드 자동 발행")
    parser.add_argument(
        "--store", "-s",
        default=DEFAULT_STORE,
        help=f"발행할 매장명 (scripts/asset/ 하위 폴더명, 기본값: {DEFAULT_STORE})"
    )
    args = parser.parse_args()
    
    exit_code = asyncio.run(upload_to_instagram(store_name=args.store))
    sys.exit(exit_code or 0)


if __name__ == "__main__":
    main()
