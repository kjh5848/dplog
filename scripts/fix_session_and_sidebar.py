import os

with open("open_naver.py", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update session storage logic to be saved after reaching editor
old_redirect_logic = """            try:
                await page.wait_for_url("**/postwrite**", timeout=15000)
                await context.storage_state(path=session_file)
                print("💾 새로운 세션 정보(naver_session.json)가 저장되었습니다!")
            except:
                print("⚠️ 에디터 리다이렉트 대기 시간 초과! (계속 진행합니다)")
            await asyncio.sleep(4)"""
            
new_redirect_logic = """            await asyncio.sleep(5) # 리다이렉트가 일어나길 잠시 대기"""

old_title_logic = """                # 스마트에디터 ONE 제목 요소 탐색
                title_locator = editor_frame.locator("span.se-placeholder, span").filter(has_text="제목").first
                await title_locator.wait_for(state="visible", timeout=15000)
                await title_locator.click()
                await asyncio.sleep(0.5)"""

new_title_logic = """                # 스마트에디터 ONE 제목 요소 탐색
                title_locator = editor_frame.locator("span.se-placeholder, span").filter(has_text="제목").first
                await title_locator.wait_for(state="visible", timeout=15000)
                
                if needs_login:
                    # 에디터 렌더링이 확인되었으므로 이 시점에서 세션을 저장합니다.
                    await context.storage_state(path=session_file)
                    print("💾 스마트에디터 진입에 성공하여 새로운 세션 정보(naver_session.json)를 저장했습니다!")
                    
                await title_locator.click()
                await asyncio.sleep(0.5)"""

# 2. Fix the publish button logic to force click or evaluate click
old_publish = """                    try:
                        publish_btn_1 = editor_frame.locator("button:has-text('발행'):visible, a:has-text('발행'):visible").first
                        await publish_btn_1.click(timeout=3000)
                        print("✅ iframe 내부에서 1차 발행 메뉴를 열었습니다.")
                    except:
                        publish_btn_1 = page.locator("button:has-text('발행'):visible, a:has-text('발행'):visible").first
                        await publish_btn_1.click(timeout=3000)
                        context_frame = page
                        print("✅ 최상단 페이지 창에서 1차 발행 메뉴를 열었습니다.")"""

new_publish = """                    try:
                        # 발행 버튼이 도움말 레이어 등에 가려져 있을 수 있으므로 force=True 옵션 부여
                        publish_btn_1 = editor_frame.locator("button:has-text('발행'):visible, a:has-text('발행'):visible, .btn_publish").first
                        await publish_btn_1.click(timeout=3000, force=True)
                        print("✅ iframe 내부에서 1차 발행 메뉴를 열었습니다.")
                    except:
                        publish_btn_1 = page.locator("button:has-text('발행'):visible, a:has-text('발행'):visible, .btn_publish").first
                        await publish_btn_1.click(timeout=3000, force=True)
                        context_frame = page
                        print("✅ 최상단 페이지 창에서 1차 발행 메뉴를 열었습니다.")"""

old_publish2 = """                    publish_btn_2 = context_frame.locator("button:has-text('발행'):visible, a:has-text('발행'):visible").last
                    await publish_btn_2.click(timeout=5000)"""
new_publish2 = """                    publish_btn_2 = context_frame.locator("button:has-text('발행'):visible, a:has-text('발행'):visible").last
                    await publish_btn_2.click(timeout=5000, force=True)"""

if old_redirect_logic in code and old_title_logic in code and old_publish in code and old_publish2 in code:
    code = code.replace(old_redirect_logic, new_redirect_logic)
    code = code.replace(old_title_logic, new_title_logic)
    code = code.replace(old_publish, new_publish)
    code = code.replace(old_publish2, new_publish2)
    with open("open_naver.py", "w", encoding="utf-8") as f:
        f.write(code)
    print("Replaced successfully!")
else:
    print("Not found! Lines check:")
    print("redirect:", old_redirect_logic in code)
    print("title:", old_title_logic in code)
    print("publish:", old_publish in code)
    print("publish2:", old_publish2 in code)

