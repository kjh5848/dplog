import re
import os

with open("open_naver.py", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update Context loading & checking logic
old_context_block = """        # 2. 새로운 브라우저 컨텍스트 및 페이지 열기 (Mac 환경 User Agent로 변경)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        # [핵심 돌파 기술 ⭐] W3C Webdriver 강제 덮어쓰기
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        
        page = await context.new_page()
        
        print("🌐 네이버 블로그 '새 글쓰기' 전용 로그인 페이지로 접속합니다...")
        
        # 3. 다이렉트로 로그인 페이지(블로그 새 글쓰기 리다이렉트) 이동
        blog_login_url = "https://nid.naver.com/nidlogin.login?mode=form&url=https://blog.naver.com/guftp12/postwrite"
        await page.goto(blog_login_url)
        
        print("✅ 로그인 페이지 접속 완료!")
        await page.wait_for_load_state("networkidle")
        
        # 4. 아이디/비밀번호 입력 (클립보드 방식)
        print("🔑 아이디와 비밀번호를 입력합니다 (클립보드 방식)...")
        await page.wait_for_selector("#id", state="visible")
        
        if NAVER_ID and NAVER_PW:"""

new_context_block = """        # 2. 새로운 브라우저 컨텍스트 및 페이지 열기 (Mac 환경 User Agent로 변경 & 세션 유지)
        session_file = "naver_session.json"
        if os.path.exists(session_file):
            print("💾 기존 세션 파일 로드 중...")
            context = await browser.new_context(
                viewport={'width': 1280, 'height': 900},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                storage_state=session_file
            )
        else:
            context = await browser.new_context(
                viewport={'width': 1280, 'height': 900},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        page = await context.new_page()
        
        print("🌐 네이버 블로그 에디터 접근을 시도합니다...")
        
        write_url = "https://blog.naver.com/guftp12/postwrite"
        await page.goto(write_url)
        await page.wait_for_load_state("networkidle")
        
        needs_login = False
        if "nidlogin.login" in page.url or "nid.naver.com" in page.url:
            needs_login = True
            print("⚠️ 세션이 없거나 만료되었습니다. 로그인을 진행합니다...")
            blog_login_url = "https://nid.naver.com/nidlogin.login?mode=form&url=https://blog.naver.com/guftp12/postwrite"
            if "mode=form" not in page.url:
                await page.goto(blog_login_url)
                await page.wait_for_load_state("networkidle")
            
            print("🔑 아이디와 비밀번호를 입력합니다 (클립보드 방식)...")
            await page.wait_for_selector("#id", state="visible")
        else:
            print("✅ 기존 세션이 유효합니다! 로그인을 건너뜁니다.")
        
        if needs_login and NAVER_ID and NAVER_PW:"""

# 2. Update After-Login Session save
old_post_login = """            # 5. 로그인 버튼 클릭
            print("🚀 로그인 수행 중...")
            await page.click(".btn_login")
            
            # 6. 스마트에디터 렌더링 대기
            print("⏳ 로그인 완료! 타겟 블로그 '새 글쓰기(에디터)' 화면 렌더링을 기다립니다...")
            # 네이버 블로그는 iframe(mainFrame) 안에 에디터를 띄우는 경우가 많습니다.
            await asyncio.sleep(4) # 리다이렉트 전환을 위한 안전 대기"""

new_post_login = """            # 5. 로그인 버튼 클릭
            print("🚀 로그인 수행 중...")
            await page.click(".btn_login")
            
            # 6. 스마트에디터 렌더링 대기 및 세션 저장
            print("⏳ 로그인 중... 에디터 리다이렉트를 대기합니다.")
            try:
                await page.wait_for_url("**/postwrite**", timeout=15000)
                await context.storage_state(path=session_file)
                print("💾 새로운 세션 정보(naver_session.json)가 저장되었습니다!")
            except:
                print("⚠️ 에디터 리다이렉트 대기 시간 초과! (계속 진행합니다)")
            await asyncio.sleep(4)"""

# 3. Update Body typing to add smart parser
old_body_typing = """                # 줄바꿈 단위로 쪼개기
                body_lines = body_text.split('\\n')
                
                for i, line in enumerate(body_lines):
                    if line.strip():  # 빈 줄이 아닌 텍스트가 있을 경우
                        pyperclip.copy(line)
                        await page.keyboard.press(f"{modifier}+v")
                        # 한 줄을 다 적어내고 잠시 호흡하는(고민하는) 느낌 주기
                        await asyncio.sleep(1.2)
                    
                    # 마지막 줄이 아니라면 반드시 실제로 Enter 키보드를 누르기
                    if i < len(body_lines) - 1:
                        await page.keyboard.press("Enter")
                        # 줄이 바뀌는 사이트를 기다려줌
                        await asyncio.sleep(0.4) """

new_body_typing = """                import re
                body_lines = body_text.split('\\n')
                
                for i, line in enumerate(body_lines):
                    if line.strip():
                        # 스마트 URL 분리기 (문장에 URL이 섞여있으면 분할)
                        url_match = re.search(r"(https?://\S+)", line)
                        
                        if url_match and len(line.strip()) > len(url_match.group(1)):
                            parts = re.split(r"(https?://\S+)", line)
                            for part in parts:
                                if part:
                                    pyperclip.copy(part)
                                    await page.keyboard.press(f"{modifier}+v")
                                    await asyncio.sleep(0.5)
                                    
                                    if part.startswith("http"):
                                        await page.keyboard.press("Enter")
                                        print(f"🔗 스마트 파서: URL 임베딩({part}) 생성을 위해 3초간 기다립니다...")
                                        await asyncio.sleep(3.5)
                        else:
                            # 섞여 있지 않은 일반 문장 또는 단독 URL
                            pyperclip.copy(line)
                            await page.keyboard.press(f"{modifier}+v")
                            
                            if line.strip().startswith("http"):
                                await page.keyboard.press("Enter")
                                print("🔗 단독 URL 감지! OGP 임베딩을 위해 3초 대기...")
                                await asyncio.sleep(3.5)
                                continue # 밑에서 중복으로 엔터 안치게 스킵
                            else:
                                await asyncio.sleep(1.2)
                    
                    if i < len(body_lines) - 1:
                        await page.keyboard.press("Enter")
                        await asyncio.sleep(0.4) """

if old_context_block in code and old_post_login in code and old_body_typing in code:
    code = code.replace(old_context_block, new_context_block)
    code = code.replace(old_post_login, new_post_login)
    code = code.replace(old_body_typing, new_body_typing)
    with open("open_naver.py", "w", encoding="utf-8") as f:
        f.write(code)
    print("Replaced successfully!")
else:
    print("Not found! Lines check:")
    print("Context:", old_context_block in code)
    print("PostLogin:", old_post_login in code)
    print("BodyTyping:", old_body_typing in code)

