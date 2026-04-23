import re

with open("open_naver.py", "r", encoding="utf-8") as f:
    code = f.read()

old_typing_logic = """                print("🖋️ 제목을 입력합니다...")
                # 스마트에디터 ONE 제목 요소 탐색
                title_locator = editor_frame.locator("span.se-placeholder, span").filter(has_text="제목").first
                await title_locator.wait_for(state="visible", timeout=15000)
                await title_locator.click()
                
                # 한글 자소분리/커서점프 버그(IME 문제)를 피하기 위해 insert_text 사용 (한 번에 타이핑 효과)
                await page.keyboard.insert_text("[오늘의 시황] 美-이란 휴전 협상 결렬에도 뉴욕증시는 상승 (시사점)")
                await asyncio.sleep(1)
                
                print("🖋️ 본문을 입력합니다...")
                # 본문 영역을 명시적으로 클릭하여 포커스 이동 (Enter로 넘어갈 시 꼬임 방지)
                try:
                    await editor_frame.locator(".se-component-content, .se-text-paragraph, .se-main-container").first.click(timeout=3000)
                except:
                    # 클릭 실패 시 Fallback으로 제목 칸에서 Tab 이동 (Enter는 가끔 두 번 눌리거나 씹힘 방지)
                    await page.keyboard.press("Tab")
                await asyncio.sleep(1.0)
                    
                # 텍스트 좌측 정렬 (기본설정이 가운데 정렬일 수 있으므로 툴바 제어 시도)
                try:
                    left_align_btn = editor_frame.locator('button[data-name="align-left"]').first
                    if await left_align_btn.is_visible(timeout=1000):
                        await left_align_btn.click()
                except:
                    pass"""

new_typing_logic = """                print("🖋️ 제목을 입력합니다...")
                import pyperclip
                import platform
                
                # 스마트에디터 ONE 제목 요소 탐색
                title_locator = editor_frame.locator("span.se-placeholder, span").filter(has_text="제목").first
                await title_locator.wait_for(state="visible", timeout=15000)
                await title_locator.click()
                await asyncio.sleep(0.5)
                
                # 한글 IME 및 비동기 렌더링 꼬임 완벽 방지를 위해 클립보드 붙여넣기 사용
                pyperclip.copy("[오늘의 시황] 美-이란 휴전 협상 결렬에도 뉴욕증시는 상승 (시사점)")
                modifier = "Meta" if platform.system() == "Darwin" else "Control"
                await page.keyboard.press(f"{modifier}+v")
                await asyncio.sleep(1)
                
                print("🖋️ 본문을 입력합니다...")
                # 제목에서 Enter를 누르면 본문으로 커서가 정확하게 넘어가는 SmartEditor ONE의 동작을 활용
                await page.keyboard.press("Enter")
                await asyncio.sleep(1)
                
                # 혹시나 Enter가 안 먹혔을 경우 대비하여 본문 공간 빈곳 명시적 클릭 시도
                try:
                    # 제목 위가 아닌 에디터 중앙 하단의 빈 공간을 클릭하도록 se-main-container 타겟 지정
                    await editor_frame.locator(".se-main-container").click(position={"x": 50, "y": 200}, timeout=2000)
                except:
                    pass
                await asyncio.sleep(0.5)
                    
                # 텍스트 좌측 정렬 (기본설정이 가운데 정렬일 수 있으므로 툴바 제어 시도)
                try:
                    left_align_btn = editor_frame.locator('button[data-name="align-left"]').first
                    if await left_align_btn.is_visible(timeout=1000):
                        await left_align_btn.click()
                        await asyncio.sleep(0.5)
                        # 정렬 버튼 누른 후 에디터로 다시 포커스를 가져오기 위한 조치
                        await page.keyboard.press("Enter")
                except:
                    pass"""

if old_typing_logic in code:
    code = code.replace(old_typing_logic, new_typing_logic)
    with open("open_naver.py", "w", encoding="utf-8") as f:
        f.write(code)
    print("Replaced successfully!")
else:
    print("Not found! Lines check:")
    import sys
    lines = code.splitlines()
    for i, line in enumerate(lines):
        if "제목을 입력합니다" in line:
            print("\\n".join(lines[i:i+40]))

