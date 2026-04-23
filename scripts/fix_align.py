import re

with open("open_naver.py", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Remove the sentence and modify the body format
# 2. Add Enter key to drop from title to body
# 3. Add left align logic if necessary? If left align is needed, usually the shortcut in windows for naive smarteditor is not standard.
# We will just write a python script to replace the body part.

old_body_logic = """                print("🖋️ 본문을 입력합니다...")
                # 스마트에디터 ONE 본문 요소 탐색 ("본문" 텍스트가 숨김(se-blind) 속성에 잡히는 취약점 우회)
                try:
                    # 1순위: 에디터 본체 메인 컨테이너 직접 클릭
                    await editor_frame.locator(".se-main-container").click(timeout=5000)
                except:
                    print("⚠️ 컨테이너 클릭 실패. 키보드 네비게이션(Tab)으로 포커스 이동을 시도합니다.")
                    # 2순위: 제목에서 Tab 키를 눌러 본문으로 포커스 넘기기
                    await page.keyboard.press("Tab")
                    await asyncio.sleep(0.5)
                
                # 본문 타이핑 (뉴스 시사점 내용)
                body_text = (
                    "안녕하세요. D-PLOG입니다.\\n\\n"
                    "방금 들어온 소식에 따르면, 미국과 이란의 휴전 협상이 결렬된 상황임에도 불구하고 뉴욕증시는 일제히 상승 마감했습니다.\\n"
                    "관련 기사: https://www.mk.co.kr/news/stock/12016028\\n\\n"
                    "[투자 시사점 및 인사이트]\\n"
                    "1. 시장의 공포 선반영: 협상 결렬이라는 악재에도 시장이 흔들리지 않은 것은, 이미 지정학적 리스크가 증시에 충분히 선반영되었다는 의미로 해석됩니다.\\n"
                    "2. 물밑 대화 기대감: 표면적인 결렬에도 양극단의 전시 상황으로 치닫지 않고, 물밑에서 외교적 접촉이 계속될 것이라는 투자자들의 신뢰가 작용했습니다.\\n"
                    "3. 투자 전략: 일시적 지정학적 노이즈에 휩쓸리기보다는, 빅테크 등 우량 자산 중심의 장기적인 포트폴리오를 유지하는 것이 중요해 보입니다.\\n\\n"
                    "본 포스팅은 D-PLOG Playwright 자동화 엔진을 통해 테스트 발행되었습니다."
                )
                await page.keyboard.type(body_text, delay=30)
                await asyncio.sleep(1)"""

new_body_logic = """                print("🖋️ 본문을 입력합니다...")
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

# In case old_body_logic uses exact indent matching:
if old_body_logic in code:
    code = code.replace(old_body_logic, new_body_logic)
    with open("open_naver.py", "w", encoding="utf-8") as f:
        f.write(code)
    print("Replaced successfully!")
else:
    print("Could not find the exact old block.")

