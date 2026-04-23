import os

with open("open_naver.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
in_if_block = False

# We need to change:
#         if needs_login and NAVER_ID and NAVER_PW:
# to:
#         if needs_login:
#             if not (NAVER_ID and NAVER_PW):
#                 print("❌ .env.naver 파일에서 NAVER_ID 또는 NAVER_PW를 찾을 수 없습니다.")
#                 await browser.close()
#                 return
# and then keep the login code indented, BUT unindent the try block starting with "메인 프레임인지 iframe 내부인지 탐색"

i = 0
while i < len(lines):
    line = lines[i]
    if "if needs_login and NAVER_ID and NAVER_PW:" in line:
        new_lines.append(line.replace("if needs_login and NAVER_ID and NAVER_PW:", "if needs_login:\n            if not (NAVER_ID and NAVER_PW):\n                print(\"❌ .env.naver 파일에서 NAVER_ID 또는 NAVER_PW를 찾을 수 없습니다.\")\n                await browser.close()\n                return"))
        in_if_block = True
        i += 1
        continue
    
    if in_if_block:
        if "try:" in line and lines[i+1].find("메인 프레임인지 iframe 내부인지 탐색") != -1:
            in_if_block = False
            # Unindent the try: and everything after it by 4 spaces!
            # wait, actually the try block goes all the way down.
            # I will just write a loop to unindent everything until the else: block.
            break
            
        else:
            new_lines.append(line)
            i += 1
            continue
            
    new_lines.append(line)
    i += 1

# Now we need to unindent everything from "try:" until the "else:" corresponding to the old "if NAVER_ID"
if not in_if_block:
    while i < len(lines):
        line = lines[i]
        if line.startswith("        else:") and lines[i+1].find("❌ .env.naver 파일에서") != -1:
            # Skip the else block entirely because we handled it above
            i += 2
            continue
            
        if line.startswith("            ") and len(line.strip()) > 0:
            # Unindent by 4 spaces
            new_lines.append(line[4:])
        else:
            new_lines.append(line)
        i += 1

with open("open_naver.py", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Indentation fixed successfully!")

