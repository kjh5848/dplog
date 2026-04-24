import os
import sys
import argparse
import re
import asyncio
import pyperclip
import platform
from dotenv import load_dotenv
from playwright.async_api import async_playwright
from playwright_stealth import stealth

# ──────────────────────────────────────────────
# 환경 설정
# ──────────────────────────────────────────────

# .env.naver 파일에서 환경 변수 로드
SNS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SNS_DIR)
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env.naver"))
NAVER_ID = os.getenv("NAVER_ID")
NAVER_PW = os.getenv("NAVER_PW")

# OS별 키보드 수식어 키 (Mac: Meta, Windows/Linux: Control)
MODIFIER = "Meta" if platform.system() == "Darwin" else "Control"

import random

async def human_paste(page, text: str):
    """사람이 타이핑하는 것처럼 텍스트를 끊어서 붙여넣는다 (한국어 IME 문제 방지)"""
    idx = 0
    while idx < len(text):
        chunk_size = random.randint(4, 12)
        chunk = text[idx:idx+chunk_size]
        pyperclip.copy(chunk)
        await page.keyboard.press(f"{MODIFIER}+v")
        await asyncio.sleep(random.uniform(0.1, 0.35))
        idx += chunk_size

# ──────────────────────────────────────────────
# 원고 파서 — blog_draft.md → 구조화된 세그먼트 리스트
# ──────────────────────────────────────────────

def parse_draft(draft_path: str):
    """마크다운 원고를 읽어 제목, 해시태그, 본문 세그먼트로 분해한다.
    
    Returns:
        tuple: (title, hashtags, segments)
        - title (str): 포스트 제목
        - hashtags (str): 해시태그 문자열 (예: "#해운대술집 #장산역술집")
        - segments (list[dict]): 본문 세그먼트 리스트
          각 세그먼트 형태:
            {'type': 'text',  'content': '본문 텍스트'}
            {'type': 'heading', 'level': 2, 'content': '소제목'}
            {'type': 'quote', 'content': '인용문 텍스트'}
            {'type': 'image', 'alt': '설명', 'filename': '파일명.jpeg'}
            {'type': 'hr'}  (구분선)
            {'type': 'url',   'url': 'https://...', 'label': '텍스트'}
    """
    with open(draft_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # 제목 추출 (첫 줄)
    title = lines[0].strip().replace("# ", "").replace("#", "")
    
    # 해시태그 추출 (줄 전체가 '#태그 #태그' 패턴인 행)
    hashtags = ""
    # 마지막 해시태그 줄과 첫 해시태그 줄을 모두 수집
    hashtag_pattern = re.compile(r'^#\S+(\s+#\S+)*\s*$')
    
    segments = []
    text_buffer = []
    
    def flush_text():
        """쌓인 텍스트 버퍼를 세그먼트로 내보낸다."""
        nonlocal text_buffer
        joined = "\n".join(text_buffer).strip()
        if joined:
            segments.append({"type": "text", "content": joined})
        text_buffer = []
    
    for line in lines[1:]:  # 첫 줄(제목) 건너뜀
        stripped = line.strip()
        
        # 빈 줄 — 텍스트 버퍼에 빈 줄 유지 (문단 간격)
        if not stripped:
            text_buffer.append("")
            continue
        
        # 해시태그 전용 줄
        if hashtag_pattern.match(stripped):
            hashtags = stripped
            continue
        
        # 구분선 (---)
        if stripped == "---":
            flush_text()
            segments.append({"type": "hr"})
            continue

        heading_match = re.match(r'^(#{2,3})\s+(.+)$', stripped)
        if heading_match:
            flush_text()
            segments.append({
                "type": "heading",
                "level": len(heading_match.group(1)),
                "content": heading_match.group(2),
            })
            continue

        quote_match = re.match(r'^>\s?(.*)$', stripped)
        if quote_match:
            flush_text()
            segments.append({
                "type": "quote",
                "content": quote_match.group(1),
            })
            continue
        
        # 지도 마크다운: ![map](장소명)
        map_match = re.match(r'^!\[map\]\((.*?)\)$', stripped)
        if map_match:
            flush_text()
            segments.append({
                "type": "map",
                "name": map_match.group(1),
            })
            continue

        # 이미지 마크다운: ![alt](<filename>) 또는 ![alt](filename)
        img_match = re.match(r'^!\[(.*?)\]\(<?(.*?)>?\)$', stripped)
        if img_match:
            flush_text()
            segments.append({
                "type": "image",
                "alt": img_match.group(1),
                "filename": img_match.group(2),
            })
            continue
        
        # 링크 마크다운: [label](url)
        link_match = re.match(r'^\S*\s*\[(.*?)\]\((https?://\S+)\)\s*$', stripped)
        if link_match:
            flush_text()
            # 이모지 접두사 포함 원문 그대로 저장
            segments.append({
                "type": "url",
                "label": stripped,
                "url": link_match.group(2),
            })
            continue
        
        # URL이 섞인 일반 텍스트
        url_match = re.search(r'(https?://\S+)', stripped)
        if url_match:
            flush_text()
            segments.append({
                "type": "url",
                "label": stripped,
                "url": url_match.group(1),
            })
            continue
        
        # 일반 텍스트
        text_buffer.append(line.rstrip())
    
    flush_text()
    return title, hashtags, segments

# ──────────────────────────────────────────────
# 이미지 업로드 — FileChooser 이벤트 방식
# ──────────────────────────────────────────────

async def upload_image(page, editor_frame, image_path: str):
    """스마트에디터에 이미지를 업로드한다.
    
    전략 순서:
    1. 숨겨진 input[type="file"] 직접 주입 (가장 안정적)
    2. 실패 시 FileChooser 이벤트 폴백
    """
    abs_path = os.path.abspath(image_path)
    if not os.path.exists(abs_path):
        print(f"⚠️ 이미지 파일 없음: {abs_path}")
        return False
    
    # === 방식 A: 숨겨진 input[type="file"] 직접 주입 ===
    file_input_selectors = [
        'input[type="file"][accept*="image"]',
        'input[type="file"][accept*="video"]',
        'input[type="file"]',
    ]
    
    for sel in file_input_selectors:
        try:
            loc = editor_frame.locator(sel).first
            if await loc.count() > 0:
                await loc.set_input_files(abs_path)
                print(f"📸 [방식A] 이미지 업로드: {os.path.basename(abs_path)}")
                await asyncio.sleep(4)  # 서버 전송 + DOM 삽입 대기
                return True
        except Exception as e:
            continue
    
    # === 방식 B: 사진 버튼 클릭 → FileChooser 가로채기 ===
    photo_btn_selectors = [
        'button[data-name="image"]',
        '.se-toolbar-item-image',
        '.se-image-toolbar-button',
        'button[title*="사진"]',
    ]
    
    photo_btn = None
    for sel in photo_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                photo_btn = btn
                break
        except:
            continue
    
    if photo_btn is None:
        print(f"❌ 사진 업로드 버튼을 찾지 못했습니다: {os.path.basename(abs_path)}")
        return False
    
    try:
        async with page.expect_file_chooser(timeout=5000) as fc_info:
            await photo_btn.click()
        file_chooser = await fc_info.value
        await file_chooser.set_files(abs_path)
        print(f"📸 [방식B] 이미지 업로드: {os.path.basename(abs_path)}")
        await asyncio.sleep(4)
        return True
    except Exception as e:
        print(f"❌ 이미지 업로드 실패: {str(e)[:60]}")
        return False

# ──────────────────────────────────────────────
# 서식 유틸리티 — 볼드, 인용문, 구분선
# ──────────────────────────────────────────────

async def type_line_with_inline_styles(page, line: str):
    """마크다운 **볼드**, __밑줄__ 구문이 포함된 한 줄을 서식 적용하며 입력한다.
    
    예: "쾌적한 **분위기**와 __가족외식__" → 각각 볼드/밑줄로 입력
    """
    parts = re.split(r'(\*\*.*?\*\*|__.*?__)', line)
    
    for part in parts:
        if not part:
            continue
        
        if part.startswith("**") and part.endswith("**"):
            bold_text = part[2:-2]
            await page.keyboard.press(f"{MODIFIER}+b")
            await asyncio.sleep(0.15)
            pyperclip.copy(bold_text)
            await page.keyboard.press(f"{MODIFIER}+v")
            await asyncio.sleep(0.4)
            await page.keyboard.press(f"{MODIFIER}+b")
            await asyncio.sleep(0.15)
        elif part.startswith("__") and part.endswith("__"):
            underline_text = part[2:-2]
            await page.keyboard.press(f"{MODIFIER}+u")
            await asyncio.sleep(0.15)
            pyperclip.copy(underline_text)
            await page.keyboard.press(f"{MODIFIER}+v")
            await asyncio.sleep(0.4)
            await page.keyboard.press(f"{MODIFIER}+u")
            await asyncio.sleep(0.15)
        else:
            await human_paste(page, part)


async def type_line_with_bold(page, line: str):
    """기존 호출 호환용 래퍼."""
    await type_line_with_inline_styles(page, line)


async def select_current_line(page):
    await page.keyboard.press("Home")
    await page.keyboard.down("Shift")
    await page.keyboard.press("End")
    await page.keyboard.up("Shift")
    await asyncio.sleep(0.2)


async def apply_heading(page, editor_frame, level: str = "heading2"):
    """현재 줄에 네이버 스마트에디터 제목/소제목 스타일을 적용한다."""
    await select_current_line(page)
    paragraph_btn_selectors = [
        'button[data-name="paragraph"]',
        '.se-toolbar-item-paragraph',
        '.se-text-paragraph-button',
    ]

    opened = False
    for sel in paragraph_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                await btn.click()
                opened = True
                print(f"✅ 문단 드롭다운 열림: {sel}")
                break
        except:
            continue

    if not opened:
        print("⚠️ 문단 드롭다운을 찾지 못했습니다.")
        return False

    await asyncio.sleep(0.5)
    heading_selectors = {
        "heading2": ['[data-value="heading2"]', ':text("제목")', '.se-item-heading2'],
        "heading3": ['[data-value="heading3"]', ':text("소제목")', '.se-item-heading3'],
    }

    for sel in heading_selectors.get(level, []):
        try:
            item = editor_frame.locator(sel).first
            if await item.is_visible(timeout=2000):
                await item.click()
                print(f"✅ {level} 적용 완료")
                await asyncio.sleep(0.4)
                return True
        except:
            continue

    print(f"⚠️ {level} 메뉴 항목을 찾지 못했습니다.")
    await page.keyboard.press("Escape")
    return False


async def write_heading_segment(page, editor_frame, text: str, level: int):
    await type_line_with_inline_styles(page, text)
    heading_level = "heading2" if level == 2 else "heading3"
    applied = await apply_heading(page, editor_frame, heading_level)
    if not applied:
        await page.keyboard.press(f"{MODIFIER}+b")
        print(f"⚠️ {heading_level} 폴백: 굵은 문단으로 처리")
    await page.keyboard.press("End")
    await page.keyboard.press("Enter")
    await asyncio.sleep(0.4)
    return applied


async def insert_quotation(page, editor_frame, text: str):
    """툴바 인용구 컴포넌트로 인용문을 삽입하고, 실패하면 시각적 인용문으로 폴백한다."""
    quote_btn_selectors = [
        'button[data-name="quotation"]',
        '.se-toolbar-item-quotation',
        'button[title*="인용"]',
    ]

    quote_btn = None
    for sel in quote_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                quote_btn = btn
                print(f"✅ 인용구 버튼 발견: {sel}")
                break
        except:
            continue

    if quote_btn is None:
        print("⚠️ 인용구 버튼을 찾지 못했습니다. 텍스트 인용문으로 폴백합니다.")
        await type_line_with_inline_styles(page, f"❝ {text} ❞")
        await page.keyboard.press("Enter")
        await asyncio.sleep(0.4)
        return False

    await quote_btn.click()
    await asyncio.sleep(1)
    await type_line_with_inline_styles(page, text)
    await asyncio.sleep(0.5)
    await page.keyboard.press("ArrowDown")
    await asyncio.sleep(0.3)
    await page.keyboard.press("Enter")
    await asyncio.sleep(0.3)
    print(f"✅ 인용문 삽입 완료: {text[:30]}...")
    return True


async def insert_horizontal_line(page, editor_frame):
    """에디터에 구분선(수평선)을 삽입한다.
    
    전략: '+' 버튼 메뉴 → 구분선 선택
    실패 시 텍스트 구분자로 폴백
    """
    # '+' 버튼 클릭 시도
    plus_btn_selectors = [
        '.se-component-add-button',
        'button[data-name="component-add"]',
        '.se-add-button',
    ]
    
    plus_clicked = False
    for sel in plus_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                await btn.click()
                plus_clicked = True
                break
        except:
            continue
    
    if plus_clicked:
        await asyncio.sleep(0.5)
        
        # 구분선 메뉴 항목 클릭
        hr_selectors = [
            'button:has-text("구분선")',
            '[data-name="horizontalLine"]',
            ':text("구분선")',
        ]
        
        for sel in hr_selectors:
            try:
                item = editor_frame.locator(sel).first
                if await item.is_visible(timeout=2000):
                    await item.click()
                    print("━━ 구분선 삽입 완료")
                    await asyncio.sleep(1)
                    return True
            except:
                continue
        
        # 메뉴가 열렸지만 구분선을 못 찾으면 닫기
        await page.keyboard.press("Escape")
    
    # 폴백: 텍스트 구분자
    print("━━ 구분선 폴백: 텍스트 구분자 사용")
    pyperclip.copy("━━━━━━━━━━━━━━━━━━━━")
    await page.keyboard.press(f"{MODIFIER}+v")
    await asyncio.sleep(0.5)
    await page.keyboard.press("Enter")
    await asyncio.sleep(0.3)
    return True

# ──────────────────────────────────────────────
# 장소(지도) 자동 첨부
# ──────────────────────────────────────────────

async def insert_map(page, editor_frame, map_name: str):
    """에디터에 장소(지도)를 자동 첨부한다."""
    print(f"🗺️ 장소(지도) 첨부 시도: {map_name}")
    # 1. 상단 툴바 '장소' 버튼 클릭
    place_btn_selectors = [
        'button[data-name="place"]',
        '.se-toolbar-item-place',
        '.se-place-toolbar-button',
    ]
    place_clicked = False
    for sel in place_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                await btn.click()
                place_clicked = True
                break
        except:
            continue

    if not place_clicked:
        print("❌ 장소 버튼을 찾지 못했습니다.")
        return False

    await asyncio.sleep(1.5)

    context_frame = page
    try:
        search_input = context_frame.locator("input[placeholder*='장소'], input.search_input, .se-place-search-input").first
        if not await search_input.is_visible(timeout=3000):
            context_frame = editor_frame
            search_input = context_frame.locator("input[placeholder*='장소'], input.search_input, .se-place-search-input").first

        await search_input.click()
        await asyncio.sleep(0.5)

        # 장소명 입력
        pyperclip.copy(map_name)
        await context_frame.keyboard.press(f"{MODIFIER}+v")
        await asyncio.sleep(0.5)
        await context_frame.keyboard.press("Enter")
        await asyncio.sleep(2.0)

        # 검색 결과 텍스트를 포함하는 추가 버튼 (보통 목록의 첫번째)
        add_btn = context_frame.locator("button:has-text('추가'), .btn_add, .place_add_btn").first
        await add_btn.click(timeout=3000)
        await asyncio.sleep(0.5)

        # 확인 버튼 클릭
        confirm_btn = context_frame.locator("button:has-text('확인'), button:has-text('완료'), .btn_confirm").first
        await confirm_btn.click(timeout=3000)
        await asyncio.sleep(1)
        print(f"✅ 장소 첨부 성공: {map_name}")
        return True
    except Exception as e:
        print(f"❌ 장소 첨부 실패: {str(e)[:50]}")
        await page.keyboard.press("Escape")
        return False

# ──────────────────────────────────────────────
# 본문 입력 엔진 — 세그먼트별 분기 처리
# ──────────────────────────────────────────────

async def write_body_segments(page, editor_frame, segments: list, asset_dir: str):
    """파싱된 세그먼트 리스트를 순서대로 에디터에 입력한다."""
    
    total = len(segments)
    for idx, seg in enumerate(segments):
        seg_type = seg["type"]
        progress = f"[{idx+1}/{total}]"
        
        # ── 텍스트 세그먼트 ──
        if seg_type == "text":
            lines = seg["content"].split("\n")
            for line in lines:
                stripped = line.strip()
                if not stripped:
                    # 빈 줄 → 문단 간격
                    await page.keyboard.press("Enter")
                    await asyncio.sleep(0.2)
                    continue
                
                # **볼드**, __밑줄__ 구문 포함 여부 확인
                if "**" in stripped or "__" in stripped:
                    await type_line_with_inline_styles(page, stripped)
                else:
                    # URL이 섞인 텍스트 처리
                    url_match = re.search(r"(https?://\S+)", stripped)
                    if url_match and len(stripped) > len(url_match.group(1)):
                        # URL이 섞여있으면 분할 입력
                        parts = re.split(r"(https?://\S+)", stripped)
                        for part in parts:
                            if part:
                                pyperclip.copy(part)
                                await page.keyboard.press(f"{MODIFIER}+v")
                                await asyncio.sleep(0.4)
                                if part.startswith("http"):
                                    await page.keyboard.press("Enter")
                                    print(f"🔗 URL 임베딩 대기: {part[:40]}...")
                                    await asyncio.sleep(3.5)
                    else:
                        await human_paste(page, stripped)
                
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.3)
            
            print(f"{progress} 📝 텍스트 입력 완료 ({len(seg['content'])}자)")

        # ── 제목/소제목 세그먼트 ──
        elif seg_type == "heading":
            await write_heading_segment(page, editor_frame, seg["content"], seg["level"])
            print(f"{progress} 🧭 제목 서식 입력 완료 (H{seg['level']})")

        # ── 인용문 세그먼트 ──
        elif seg_type == "quote":
            await insert_quotation(page, editor_frame, seg["content"])
            print(f"{progress} 💬 인용문 입력 완료")
        
        # ── 이미지 세그먼트 ──
        elif seg_type == "image":
            image_path = os.path.join(asset_dir, seg["filename"])
            success = await upload_image(page, editor_frame, image_path)
            if success:
                print(f"{progress} 📸 [{seg['alt']}] 이미지 삽입 성공")
                # 이미지 삽입 후 커서를 아래로 이동
                await page.keyboard.press("Escape")
                await asyncio.sleep(0.3)
                await page.keyboard.press("End")
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.5)
            else:
                print(f"{progress} ⚠️ [{seg['alt']}] 이미지 삽입 실패 — 건너뜀")
        
        # ── 지도 세그먼트 ──
        elif seg_type == "map":
            success = await insert_map(page, editor_frame, seg["name"])
            if success:
                await page.keyboard.press("Escape")
                await asyncio.sleep(0.3)
                await page.keyboard.press("End")
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.5)

        # ── 구분선 세그먼트 ──
        elif seg_type == "hr":
            await insert_horizontal_line(page, editor_frame)
            print(f"{progress} ━━ 구분선")
        
        # ── URL 세그먼트 ──
        elif seg_type == "url":
            pyperclip.copy(seg["label"])
            await page.keyboard.press(f"{MODIFIER}+v")
            await asyncio.sleep(0.5)
            
            # URL이 단독이면 OGP 임베딩을 위해 Enter + 대기
            if seg["label"].strip().startswith("http"):
                await page.keyboard.press("Enter")
                print(f"{progress} 🔗 URL 임베딩 대기: {seg['url'][:40]}...")
                await asyncio.sleep(3.5)
            else:
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.5)
            
            print(f"{progress} 🔗 URL 입력 완료")

# ──────────────────────────────────────────────
# 메인 실행 함수
# ──────────────────────────────────────────────

async def open_naver_homepage(store_name: str = "철이네"):
    # ── 1. 원고 파싱 ──
    asset_dir = os.path.join(BASE_DIR, "asset", store_name)
    draft_path = os.path.join(asset_dir, "blog_draft.md")
    
    if not os.path.isdir(asset_dir):
        print(f"❌ 매장 폴더가 존재하지 않습니다: {asset_dir}")
        return 1
    
    print(f"🏪 대상 매장: {store_name}")
    
    try:
        post_title, hashtags, segments = parse_draft(draft_path)
        img_count = sum(1 for s in segments if s["type"] == "image")
        text_count = sum(1 for s in segments if s["type"] == "text")
        print(f"✅ 원고 파싱 완료! 제목: {len(post_title)}자 | "
              f"세그먼트: {len(segments)}개 (텍스트 {text_count}, 이미지 {img_count})")
        if hashtags:
            print(f"🏷️ 해시태그: {hashtags}")
    except Exception as e:
        print(f"❌ 원고 파일 읽기 실패: {e}")
        return 1
    
    # ── 2. Playwright 엔진 실행 ──
    async with async_playwright() as p:
        # 브라우저 실행 (Stealth 아키텍처: AutomationControlled 무력화)
        browser = await p.chromium.launch(
            headless=False,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars'
            ]
        )
        
        # 브라우저 컨텍스트 생성 (세션 유지)
        session_file = os.path.join(BASE_DIR, "naver_session.json")
        context_options = {
            'viewport': {'width': 1280, 'height': 900},
            'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                          'AppleWebKit/537.36 (KHTML, like Gecko) '
                          'Chrome/120.0.0.0 Safari/537.36',
        }
        
        if os.path.exists(session_file):
            print("💾 기존 세션 파일 로드 중...")
            context_options['storage_state'] = session_file
        
        context = await browser.new_context(**context_options)
        await context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
        )
        page = await context.new_page()
        await stealth(page)
        
        # ── 3. 에디터 접근 및 로그인 ──
        print("🌐 네이버 블로그 에디터 접근을 시도합니다...")
        write_url = "https://blog.naver.com/kjuh5848/postwrite"
        await page.goto(write_url)
        await page.wait_for_load_state("networkidle")
        
        needs_login = "nidlogin.login" in page.url or "nid.naver.com" in page.url
        
        if needs_login:
            print("⚠️ 세션 만료. 로그인을 진행합니다...")
            blog_login_url = (
                "https://nid.naver.com/nidlogin.login?mode=form"
                "&url=https://blog.naver.com/kjuh5848/postwrite"
            )
            if "mode=form" not in page.url:
                await page.goto(blog_login_url)
                await page.wait_for_load_state("networkidle")
            
            await page.wait_for_selector("#id", state="visible")
            
            if not (NAVER_ID and NAVER_PW):
                print("❌ .env.naver에서 NAVER_ID/NAVER_PW를 찾을 수 없습니다.")
                await browser.close()
                return
            
            await asyncio.sleep(1.2)
            
            # ID 붙여넣기
            pyperclip.copy(NAVER_ID)
            await page.click("#id")
            await page.keyboard.press(f"{MODIFIER}+v")
            await asyncio.sleep(0.8)
            
            # PW 붙여넣기
            pyperclip.copy(NAVER_PW)
            await page.click("#pw")
            await page.keyboard.press(f"{MODIFIER}+v")
            await asyncio.sleep(0.7)
            
            pyperclip.copy("")  # 클립보드 비우기 (보안)
            
            print("🚀 로그인 수행 중...")
            await page.click(".btn_login")
            
            print("⏳ 에디터 리다이렉트 대기...")
            await asyncio.sleep(5)
            
            # 로그인 후 에디터로 정상 이동했는지 확인
            if "postwrite" not in page.url:
                print("🔄 에디터 페이지로 재접근합니다...")
                await page.goto(write_url)
                await page.wait_for_load_state("networkidle")
                await asyncio.sleep(3)
        else:
            print("✅ 기존 세션 유효! 로그인 건너뜀.")
        
        # ── 4. 에디터 프레임 획득 및 초기화 ──
        try:
            # iframe 내부 탐색
            editor_frame = page
            for frame in page.frames:
                if frame.name == "mainFrame":
                    editor_frame = frame
                    break
            
            # 팝업 간섭 제거 (이전 글 불러오기 등)
            print("🛡️ 에디터 팝업 간섭 제거...")
            try:
                popup = editor_frame.locator(".se-popup, .se-popup-alert").first
                if await popup.is_visible(timeout=6000):
                    cancel_btn = popup.get_by_text("취소").first
                    await cancel_btn.click(timeout=3000)
                    print("✅ 팝업 취소 완료")
                    await asyncio.sleep(1)
                else:
                    print("👍 팝업 없음")
            except:
                pass
            
            # Escape 연타 (잔여 모달 닫기)
            await page.keyboard.press("Escape")
            await asyncio.sleep(0.3)
            await page.keyboard.press("Escape")
            await asyncio.sleep(0.5)
            
            # 도움말 사이드바 닫기
            try:
                help_btn = editor_frame.locator(
                    ".se-help-panel-close-button, button[title*='도움말']"
                ).first
                if await help_btn.is_visible(timeout=3000):
                    await help_btn.click()
                    print("✅ 도움말 사이드바 닫음")
            except:
                pass
            
            # ── 5. 제목 입력 ──
            print("🖋️ 제목을 입력합니다...")
            await asyncio.sleep(6)  # 에디터 완전 렌더링 대기
            
            title_locator = None
            title_selectors = [
                ".se-title-input",
                "[placeholder='제목']",
                ".se-placeholder",
                "div[contenteditable='true']",
            ]
            for sel in title_selectors:
                try:
                    loc = editor_frame.locator(sel).first
                    if await loc.is_visible(timeout=3000):
                        title_locator = loc
                        print(f"✅ 제목 요소 발견: {sel}")
                        break
                except:
                    continue
            
            if title_locator:
                # 세션 저장 (로그인 성공 확인 후)
                if needs_login:
                    await context.storage_state(path=session_file)
                    print("💾 세션 저장 완료")
                
                await title_locator.click()
                await asyncio.sleep(0.5)
                
                # 기존 제목 전체 선택 후 덮어쓰기
                await page.keyboard.press(f"{MODIFIER}+a")
                await asyncio.sleep(0.2)
                
                pyperclip.copy(post_title)
                await page.keyboard.press(f"{MODIFIER}+v")
                await asyncio.sleep(1)
                print(f"✅ 제목 설정 완료: {post_title}")
            else:
                print("⚠️ 제목 요소를 찾지 못했습니다.")
            
            # ── 6. 본문 입력 ──
            print("🖋️ 본문을 입력합니다...")
            
            # 제목 → 본문으로 커서 이동
            await page.keyboard.press("Enter")
            await asyncio.sleep(1)
            
            # 본문 영역 포커스 확보
            try:
                await editor_frame.locator(".se-main-container").click(
                    position={"x": 50, "y": 150}, timeout=3000
                )
            except:
                pass
            await asyncio.sleep(1.0)
            
            # 좌측 정렬
            try:
                left_btn = editor_frame.locator('button[data-name="align-left"]').first
                if await left_btn.is_visible(timeout=1000):
                    await left_btn.click()
                    await asyncio.sleep(0.5)
            except:
                pass
            
            # 세그먼트별 본문 입력 실행
            await write_body_segments(page, editor_frame, segments, asset_dir)
            
            # ── 7. 해시태그 입력 ──
            if hashtags:
                await asyncio.sleep(0.5)
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.3)
                pyperclip.copy(hashtags)
                await page.keyboard.press(f"{MODIFIER}+v")
                await asyncio.sleep(0.8)
                print(f"🏷️ 해시태그 입력 완료: {hashtags}")
            
            await asyncio.sleep(1.5)
            
            # ── 8. 발행 ──
            print("🚀 포스트 발행을 시작합니다...")
            try:
                context_frame = editor_frame
                try:
                    publish_btn = editor_frame.locator(
                        "button:has-text('발행'):visible, "
                        "a:has-text('발행'):visible, .btn_publish"
                    ).first
                    await publish_btn.click(timeout=3000, force=True)
                    print("✅ 1차 발행 메뉴 열림")
                except:
                    publish_btn = page.locator(
                        "button:has-text('발행'):visible, "
                        "a:has-text('발행'):visible, .btn_publish"
                    ).first
                    await publish_btn.click(timeout=3000, force=True)
                    context_frame = page
                    print("✅ 1차 발행 메뉴 열림 (페이지)")
                
                await asyncio.sleep(2.5)
                
                # 2차 최종 발행 버튼
                publish_final = context_frame.locator(
                    "button:has-text('발행'):visible, "
                    "a:has-text('발행'):visible"
                ).last
                await publish_final.click(timeout=5000, force=True)
                print("🎉 포스팅 발행 완료!")
                
                await asyncio.sleep(5)
            except Exception as e:
                print(f"⚠️ 발행 버튼 클릭 실패: {str(e)[:50]}")
        
        except Exception as e:
            print(f"⚠️ 에디터 제어 중 오류: {e}")
            print("💡 iframe 구조 또는 네트워크 지연 가능성")
        
        print("💡 15초 후 브라우저가 자동 종료됩니다.")
        await asyncio.sleep(15)
        await browser.close()
        print("🛑 브라우저 정상 종료.")
    
    return 0  # 정상 종료


def main():
    """CLI 진입점: --store 인자로 매장명을 지정할 수 있습니다."""
    parser = argparse.ArgumentParser(description="네이버 블로그 자동 발행")
    parser.add_argument(
        "--store", "-s",
        default="철이네",
        help="발행할 매장명 (scripts/asset/ 하위 폴더명, 기본값: 철이네)"
    )
    args = parser.parse_args()
    
    exit_code = asyncio.run(open_naver_homepage(store_name=args.store))
    sys.exit(exit_code or 0)


if __name__ == "__main__":
    main()
