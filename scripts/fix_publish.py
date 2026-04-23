import re

with open("open_naver.py", "r", encoding="utf-8") as f:
    code = f.read()

old_block = """                print("🚀 포스트 발행을 시작합니다...")
                try:
                    # 1. 1차 발행 메뉴 버튼 클릭 (우측 상단)
                    publish_btn_1 = editor_frame.locator('button, a').filter(has_text="발행").first
                    await publish_btn_1.click(timeout=5000)
                    print("✅ 1차 발행 메뉴를 열었습니다.")
                    await asyncio.sleep(3) # 발행 설정 레이어 애니메이션 대기
                    
                    # 2. 2차 최종 발행 버튼 클릭 (설정 레이어 내부 하단)
                    # "발행" 이라는 텍스트를 가진 마지막 요소가 보통 최종 완료 버튼임
                    publish_btn_2 = editor_frame.locator('button, a').filter(has_text="발행").last
                    await publish_btn_2.click(timeout=5000)
                    print("🎉 2차 최종 발행 버튼을 클릭했습니다! 포스팅 완전 완료!")
                    
                    # 발행 후 리다이렉트를 위해 넉넉히 대기
                    await asyncio.sleep(5)
                except Exception as e:
                    print(f"⚠️ 발행 버튼 클릭 실패: {str(e)[:50]}")"""

new_block = """                print("🚀 포스트 발행을 시작합니다...")
                try:
                    # 1. 1차 발행 메뉴 버튼 클릭 (우측 상단)
                    context_frame = editor_frame
                    try:
                        publish_btn_1 = editor_frame.locator('button, a, span').filter(has_text="발행").first
                        await publish_btn_1.click(timeout=3000)
                        print("✅ iframe 내부에서 1차 발행 메뉴를 열었습니다.")
                    except:
                        publish_btn_1 = page.locator('button, a, span').filter(has_text="발행").first
                        await publish_btn_1.click(timeout=3000)
                        context_frame = page
                        print("✅ 최상단 페이지 창에서 1차 발행 메뉴를 열었습니다.")
                        
                    await asyncio.sleep(2.5)
                    
                    # 2. 2차 최종 발행 버튼 클릭 (설정 레이어 내부 하단)
                    publish_btn_2 = context_frame.locator('button, a, span').filter(has_text="발행").last
                    await publish_btn_2.click(timeout=5000)
                    print("🎉 2차 최종 발행 버튼을 클릭했습니다! 포스팅 완전 완료!")
                    
                    await asyncio.sleep(5)
                except Exception as e:
                    print(f"⚠️ 발행 버튼 클릭 실패: {str(e)[:50]}")"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open("open_naver.py", "w", encoding="utf-8") as f:
        f.write(code)
    print("Replaced successfully!")
else:
    print("Not found! Here is the actual block:")
    import sys
    lines = code.splitlines()
    for i, line in enumerate(lines):
        if "포스트 발행" in line:
            print("\n".join(lines[i:i+20]))

