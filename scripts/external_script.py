import re
with open("open_naver.py", "r", encoding="utf-8") as f:
    code = f.read()

# Replace the hardcoded string assignment block with file read
code = re.sub(
    r'                body_text = \(\n                    "안녕하세요, D-PLOG입니다.*?끝까지 읽어주셔서 감사합니다. 오늘도 성공적인 투자 하시길 바랍니다."\n                \)',
    '                # 하드코딩 되어있던 원고 텍스트는 이제 외부 파일(manuscript.md)에서 불러온 body_text를 사용합니다.',
    code, flags=re.DOTALL
)

# And now inject the file loading mechanism right before title locator
title_locator_part = 'print("🖋️ 제목을 입력합니다...")\n    \n    # 스마트에디터 ONE 제목 요소 탐색'
# wait, my unindent script made the spaces 4 spaces less. Let's just find "print("🖋️ 제목을 입력합니다...")"
insert_part = """    print("🖋️ 외부 원고 파일(manuscript.md)을 불러옵니다...")
    try:
        with open("manuscript.md", "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        # 첫 번째 줄을 제목으로 잡고 마크다운 기호(#) 제거
        post_title = lines[0].strip().replace("# ", "").replace("#", "")
        # 나머지 줄은 본문
        body_text = "".join(lines[1:]).strip()
        print(f"✅ 원고 로드 성공! 제목 길이: {len(post_title)}자, 본문 길이: {len(body_text)}자")
        
    except Exception as e:
        print(f"❌ 원고 파일을 읽는 중 오류 발생: {e}")
        print("기본 테스트 텍스트로 폴백(Fallback)합니다.")
        post_title = "[오늘의 시황] 기본 테스트용 블로그 포스트"
        body_text = "안녕하세요. 원고를 찾지 못하여 테스트 코드로 발송됩니다."
        
    print("🖋️ 제목을 입력합니다...")"""

code = code.replace('    print("🖋️ 제목을 입력합니다...")', insert_part)
code = code.replace('pyperclip.copy("[오늘의 시황] 美-이란 휴전 협상 결렬에도 뉴욕증시는 상승 (시사점)")', 'pyperclip.copy(post_title)')

with open("open_naver.py", "w", encoding="utf-8") as f:
    f.write(code)
print("Updated successfully!")

