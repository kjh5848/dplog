import re

with open("open_naver.py", "r", encoding="utf-8") as f:
    code = f.read()

old_typing_logic = """                print("🖋️ 제목을 입력합니다...")
                # 스마트에디터 ONE 제목 요소 탐색
                # 클래스명은 빌드마다 조금씩 바뀔 수 있으므로 텍스트(플레이스홀더) 기반 탐색을 병행합니다.
                title_locator = editor_frame.locator("span.se-placeholder, span").filter(has_text="제목").first
                await title_locator.wait_for(state="visible", timeout=15000)
                await title_locator.click()
                
                # 제목 타이핑 (시사점 내용 반영)
                await page.keyboard.type("[오늘의 시황] 美-이란 휴전 협상 결렬에도 뉴욕증시는 상승 (시사점)", delay=50)
                await asyncio.sleep(1)
                
                print("🖋️ 본문을 입력합니다...")
                # 스마트에디터 ONE 본문 요소 직접 진입 (제목 작성 후 Enter를 치면 본문으로 넘어갑니다)
                await page.keyboard.press("Enter")
                await asyncio.sleep(1)
                
                # 간혹 본문 컨테이너 활성화를 위해 추가 클릭이 필요한 경우 대비
                try:
                    await editor_frame.locator(".se-component-content, .se-text-paragraph").first.click(timeout=2000)
                except:
                    pass
                    
                # 텍스트 좌측 정렬을 명시적으로 하기 위해 툴바 버튼 클릭 시도
                try:
                    left_align_btn = editor_frame.locator('button[data-name="align-left"]').first
                    if await left_align_btn.is_visible(timeout=1000):
                        await left_align_btn.click()
                except:
                    pass

                # 본문 텍스트 준비 (사용자 요구사항 반영: 테스트 엔진 문구 제거, 분량 2~300타 조정)
                body_text = (
                    "안녕하세요, D-PLOG입니다.\\n\\n"
                    "간밤에 전해진 미국과 이란의 휴전 협상 결렬 소식에도 불구하고, "
                    "뉴욕증시는 기술주를 중심으로 일제히 상승장으로 마감했습니다.\\n"
                    "관련 기사: https://www.mk.co.kr/news/stock/12016028\\n\\n"
                    "[ 시사점 및 향후 인사이트 ]\\n"
                    "첫째, 시장은 이미 지정학적 리스크를 충분히 선반영하고 있었습니다. "
                    "단기적인 노이즈보다는 펀더멘털에 집중하는 자금 흐름이 강합니다.\\n\\n"
                    "둘째, 양국은 표면적인 결렬 선언 이후에도 양극단의 충돌로 치닫는 것을 경계하고 있으며, "
                    "물밑 접촉이 재개될 것이라는 투자자들의 합리적인 신뢰가 지수를 방어했습니다.\\n\\n"
                    "셋째, 따라서 투자자들은 외부 변수에 흔들리기보다는 빅테크와 실적주 중심의 "
                    "장기 우상향 포트폴리오를 우직하게 유지하는 전략이 그 어느 때보다 중요합니다.\\n\\n"
                    "끝까지 읽어주셔서 감사합니다. 오늘도 성공적인 투자 하시길 바랍니다."
                )
                
                # 사람의 타이핑 속도를 시뮬레이션하기 위해 delay 부여 (2~300타 정도의 속도)
                await page.keyboard.type(body_text, delay=60)
                await asyncio.sleep(1)"""

new_typing_logic = """                print("🖋️ 제목을 입력합니다...")
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
                    # 클릭 실패 시 폴백으로 Tab 사용
                    await page.keyboard.press("Tab")
                await asyncio.sleep(1)
                    
                # 텍스트 좌측 정렬 (기본설정이 가운데 정렬일 수 있으므로 툴바 제어 시도)
                try:
                    left_align_btn = editor_frame.locator('button[data-name="align-left"]').first
                    if await left_align_btn.is_visible(timeout=1000):
                        await left_align_btn.click()
                except:
                    pass

                body_text = (
                    "안녕하세요, D-PLOG입니다.\\n\\n"
                    "간밤에 전해진 미국과 이란의 휴전 협상 결렬 소식에도 불구하고, "
                    "뉴욕증시는 기술주를 중심으로 일제히 상승장으로 마감했습니다.\\n"
                    "관련 기사: https://www.mk.co.kr/news/stock/12016028\\n\\n"
                    "[ 시사점 및 향후 인사이트 ]\\n"
                    "첫째, 시장은 이미 지정학적 리스크를 충분히 선반영하고 있었습니다. "
                    "단기적인 노이즈보다는 펀더멘털에 집중하는 자금 흐름이 강합니다.\\n\\n"
                    "둘째, 양국은 표면적인 결렬 선언 이후에도 양극단의 충돌로 치닫는 것을 경계하고 있으며, "
                    "물밑 접촉이 재개될 것이라는 투자자들의 합리적인 신뢰가 지수를 방어했습니다.\\n\\n"
                    "셋째, 따라서 투자자들은 외부 변수에 흔들리기보다는 빅테크와 실적주 중심의 "
                    "장기 우상향 포트폴리오를 우직하게 유지하는 전략이 그 어느 때보다 중요합니다.\\n\\n"
                    "끝까지 읽어주셔서 감사합니다. 오늘도 성공적인 투자 하시길 바랍니다."
                )
                
                # 사용자 요구사항: "유도리 있게 2~300타 정도의 속도", IME 꼬임 방지를 위해 직접 char 단위 insert
                for char in body_text:
                    if char == "\\n":
                        await page.keyboard.press("Enter")
                    else:
                        await page.keyboard.insert_text(char)
                    await asyncio.sleep(0.04) # 자당 40ms 딜레이: 약 25타/초 -> 분당 약 1500타소(300타 내외 느낌)
                await asyncio.sleep(1)"""

if old_typing_logic in code:
    code = code.replace(old_typing_logic, new_typing_logic)
    with open("open_naver.py", "w", encoding="utf-8") as f:
        f.write(code)
    print("Replaced successfully!")
else:
    print("Not found! Here is the block:")
    import sys
    lines = code.splitlines()
    for i, line in enumerate(lines):
        if "제목을 입력합니다" in line:
            print("\\n".join(lines[i:i+60]))

