from __future__ import annotations

import argparse
import asyncio
import os
import platform
import re
import sys

import pyperclip
from dotenv import load_dotenv
from playwright.async_api import async_playwright

try:
    from playwright_stealth import Stealth
except ImportError:
    Stealth = None
    from playwright_stealth import stealth as legacy_stealth
else:
    legacy_stealth = None

try:
    from naver_editor.context import align_left, dismiss_editor_chrome, focus_body, get_editor_frame
    from naver_editor.formatting import insert_quote, set_post_title, write_heading_segment
    from naver_editor.map import insert_map
    from naver_editor.media import upload_media_group
    from naver_editor.probe import print_editor_dom_probe, print_formatting_evidence
    from naver_editor.publish import click_publish
    from naver_editor.typing import human_paste, paste_text, type_inline_text
except ImportError:
    from .naver_editor.context import align_left, dismiss_editor_chrome, focus_body, get_editor_frame
    from .naver_editor.formatting import insert_quote, set_post_title, write_heading_segment
    from .naver_editor.map import insert_map
    from .naver_editor.media import upload_media_group
    from .naver_editor.probe import print_editor_dom_probe, print_formatting_evidence
    from .naver_editor.publish import click_publish
    from .naver_editor.typing import human_paste, paste_text, type_inline_text


SNS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SNS_DIR)
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env.naver"))
NAVER_ID = os.getenv("NAVER_ID")
NAVER_PW = os.getenv("NAVER_PW")

MODIFIER = "Meta" if platform.system() == "Darwin" else "Control"
WRITE_URL = "https://blog.naver.com/kjuh5848/postwrite"
BROWSER_LAUNCH_ARGS = [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-infobars",
]


def parse_draft(draft_path: str):
    """마크다운 원고를 제목, 해시태그, 본문 세그먼트로 분해한다."""
    with open(draft_path, "r", encoding="utf-8") as draft_file:
        lines = draft_file.readlines()

    if not lines:
        raise ValueError(f"원고가 비어 있습니다: {draft_path}")

    title = lines[0].strip().replace("# ", "").replace("#", "")
    hashtags = ""
    hashtag_pattern = re.compile(r"^#\S+(\s+#\S+)*\s*$")
    segments = []
    text_buffer = []

    def flush_text() -> None:
        nonlocal text_buffer
        joined = "\n".join(text_buffer).strip()
        if joined:
            segments.append({"type": "text", "content": joined})
        text_buffer = []

    for line in lines[1:]:
        stripped = line.strip()

        if not stripped:
            text_buffer.append("")
            continue

        if hashtag_pattern.match(stripped):
            hashtags = stripped
            continue

        if stripped == "---":
            flush_text()
            segments.append({"type": "quote", "content": "이어서 확인할 포인트입니다."})
            continue

        heading_match = re.match(r"^(#{2,3})\s+(.+)$", stripped)
        if heading_match:
            flush_text()
            segments.append(
                {
                    "type": "heading",
                    "level": len(heading_match.group(1)),
                    "content": heading_match.group(2),
                }
            )
            continue

        quote_match = re.match(r"^>\s?(.*)$", stripped)
        if quote_match:
            flush_text()
            segments.append({"type": "quote", "content": quote_match.group(1)})
            continue

        map_match = re.match(r"^!\[map\]\((.*?)\)$", stripped)
        if map_match:
            flush_text()
            segments.append({"type": "map", "name": map_match.group(1)})
            continue

        image_match = re.match(r"^!\[(.*?)\]\(<?(.*?)>?\)$", stripped)
        if image_match:
            flush_text()
            segments.append(
                {
                    "type": "image",
                    "alt": image_match.group(1),
                    "filename": image_match.group(2),
                }
            )
            continue

        link_match = re.match(r"^\S*\s*\[(.*?)\]\((https?://\S+)\)\s*$", stripped)
        if link_match:
            flush_text()
            segments.append({"type": "url", "label": stripped, "url": link_match.group(2)})
            continue

        url_match = re.search(r"(https?://\S+)", stripped)
        if url_match:
            flush_text()
            segments.append({"type": "url", "label": stripped, "url": url_match.group(1)})
            continue

        text_buffer.append(line.rstrip())

    flush_text()
    return title, hashtags, segments


def print_draft_summary(post_title: str, hashtags: str, segments: list[dict]) -> None:
    image_count = sum(1 for segment in segments if segment["type"] == "image")
    text_count = sum(1 for segment in segments if segment["type"] == "text")
    print(
        f"✅ 원고 파싱 완료! 제목: {len(post_title)}자 | "
        f"세그먼트: {len(segments)}개 (텍스트 {text_count}, 이미지/GIF {image_count})"
    )
    if hashtags:
        print(f"🏷️ 해시태그: {hashtags}")


async def ensure_logged_in(page) -> bool:
    needs_login = "nidlogin.login" in page.url or "nid.naver.com" in page.url
    if not needs_login:
        print("✅ 기존 세션 유효! 로그인 건너뜀.")
        return False

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
        raise RuntimeError(".env.naver에서 NAVER_ID/NAVER_PW를 찾을 수 없습니다.")

    await asyncio.sleep(1.2)
    pyperclip.copy(NAVER_ID)
    await page.click("#id")
    await page.keyboard.press(f"{MODIFIER}+v")
    await asyncio.sleep(0.8)

    pyperclip.copy(NAVER_PW)
    await page.click("#pw")
    await page.keyboard.press(f"{MODIFIER}+v")
    await asyncio.sleep(0.7)
    pyperclip.copy("")

    print("🚀 로그인 수행 중...")
    await page.click(".btn_login")
    print("⏳ 에디터 리다이렉트 대기...")
    await asyncio.sleep(5)

    if "postwrite" not in page.url:
        print("🔄 에디터 페이지로 재접근합니다...")
        await page.goto(WRITE_URL)
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(3)

    return True


async def launch_chromium(playwright):
    try:
        return await playwright.chromium.launch(headless=False, args=BROWSER_LAUNCH_ARGS)
    except Exception as error:
        if "Executable doesn't exist" not in str(error):
            raise
        print("⚠️ Playwright Chromium 바이너리가 없어 시스템 Chrome으로 재시도합니다.")
        return await playwright.chromium.launch(
            channel="chrome",
            headless=False,
            args=BROWSER_LAUNCH_ARGS,
        )


async def apply_stealth(page) -> None:
    if Stealth:
        await Stealth().apply_stealth_async(page)
        return
    await legacy_stealth(page)


async def write_text_line(page, line: str) -> None:
    if "**" in line or "__" in line:
        await type_inline_text(page, line, MODIFIER)
        return

    url_match = re.search(r"(https?://\S+)", line)
    if url_match and len(line) > len(url_match.group(1)):
        parts = re.split(r"(https?://\S+)", line)
        for part in parts:
            if not part:
                continue
            await paste_text(page, part, MODIFIER)
            await asyncio.sleep(0.4)
            if part.startswith("http"):
                await page.keyboard.press("Enter")
                print(f"🔗 URL 임베딩 대기: {part[:40]}...")
                await asyncio.sleep(3.5)
        return

    await human_paste(page, line, MODIFIER)


async def write_text_segment(page, content: str) -> None:
    for line in content.split("\n"):
        stripped = line.strip()
        if not stripped:
            await page.keyboard.press("Enter")
            await asyncio.sleep(0.2)
            continue

        await write_text_line(page, stripped)
        await page.keyboard.press("Enter")
        await asyncio.sleep(0.3)


async def write_url_segment(page, segment: dict) -> None:
    await paste_text(page, segment["label"], MODIFIER)
    await asyncio.sleep(0.5)

    if segment["label"].strip().startswith("http"):
        await page.keyboard.press("Enter")
        print(f"🔗 URL 임베딩 대기: {segment['url'][:40]}...")
        await asyncio.sleep(3.5)
    else:
        await page.keyboard.press("Enter")
        await asyncio.sleep(0.5)


def collect_consecutive_images(segments: list[dict], start_index: int, asset_dir: str) -> tuple[list[dict], list[str], int]:
    image_segments = []
    image_paths = []
    index = start_index
    while index < len(segments) and segments[index]["type"] == "image":
        image_segments.append(segments[index])
        image_paths.append(os.path.join(asset_dir, segments[index]["filename"]))
        index += 1
    return image_segments, image_paths, index


async def write_body_segments(page, editor_frame, segments: list[dict], asset_dir: str) -> None:
    total = len(segments)
    index = 0
    while index < total:
        segment = segments[index]
        segment_type = segment["type"]
        progress = f"[{index + 1}/{total}]"

        if segment_type == "text":
            await write_text_segment(page, segment["content"])
            print(f"{progress} 📝 텍스트 입력 완료 ({len(segment['content'])}자)")
            index += 1
            continue

        if segment_type == "heading":
            result = await write_heading_segment(
                page,
                editor_frame,
                segment["content"],
                segment["level"],
                MODIFIER,
            )
            print(f"{progress} 🧭 {result.message}")
            index += 1
            continue

        if segment_type == "quote":
            result = await insert_quote(page, editor_frame, segment["content"], MODIFIER)
            print(f"{progress} 💬 {result.message}")
            index += 1
            continue

        if segment_type == "image":
            image_segments, image_paths, next_index = collect_consecutive_images(segments, index, asset_dir)
            result = await upload_media_group(page, editor_frame, image_paths)
            labels = ", ".join(image_segment["alt"] for image_segment in image_segments[:3])
            if len(image_segments) > 3:
                labels = f"{labels} 외 {len(image_segments) - 3}개"
            if result.ok:
                end_progress = f"[{next_index}/{total}]"
                print(f"{progress}~{end_progress} 📸 [{labels}] {result.message}")
                await page.keyboard.press("Escape")
                await asyncio.sleep(0.3)
                await page.keyboard.press("End")
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.5)
            else:
                print(f"{progress} ⚠️ [{labels}] {result.message}")
            index = next_index
            continue

        if segment_type == "map":
            result = await insert_map(page, editor_frame, segment["name"], MODIFIER)
            print(f"{progress} 🗺️ {result.message}")
            if result.ok:
                await page.keyboard.press("Escape")
                await asyncio.sleep(0.3)
                await focus_body(editor_frame)
                await asyncio.sleep(1.5)
                await page.keyboard.press("End")
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.5)
            index += 1
            continue

        if segment_type == "url":
            await write_url_segment(page, segment)
            print(f"{progress} 🔗 URL 입력 완료")
            index += 1
            continue

        print(f"{progress} ⚠️ 알 수 없는 세그먼트 타입 건너뜀: {segment_type}")
        index += 1


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="네이버 블로그 SmartEditor 초안 자동 입력")
    parser.add_argument(
        "--store",
        "-s",
        default="철이네",
        help="scripts/asset/ 하위 매장 폴더명",
    )
    parser.add_argument(
        "--draft-only",
        action="store_true",
        default=True,
        help="초안 작성 후 검수 대기만 수행합니다. 기본값입니다.",
    )
    parser.add_argument(
        "--publish",
        action="store_true",
        help="사용자 검수 후 최종 공개 발행 버튼까지 클릭합니다.",
    )
    parser.add_argument(
        "--format-check",
        action="store_true",
        help="입력 후 SmartEditor 서식 evidence를 출력합니다.",
    )
    parser.add_argument(
        "--probe-editor-dom",
        action="store_true",
        help="SmartEditor DOM 후보를 출력하고 종료합니다.",
    )
    parser.add_argument(
        "--keep-open-seconds",
        type=int,
        default=600,
        help="초안 검수용 브라우저 유지 시간(초). 기본값: 600",
    )
    return parser


async def open_naver_homepage(
    store_name: str = "철이네",
    publish: bool = False,
    draft_only: bool = True,
    format_check: bool = False,
    probe_editor_dom: bool = False,
    keep_open_seconds: int = 600,
) -> int:
    asset_dir = os.path.join(BASE_DIR, "asset", store_name)
    draft_path = os.path.join(asset_dir, "blog_draft.md")
    post_title = ""
    hashtags = ""
    segments: list[dict] = []

    if not probe_editor_dom:
        if not os.path.isdir(asset_dir):
            print(f"❌ 매장 폴더가 존재하지 않습니다: {asset_dir}")
            return 1

        print(f"🏪 대상 매장: {store_name}")
        try:
            post_title, hashtags, segments = parse_draft(draft_path)
            print_draft_summary(post_title, hashtags, segments)
        except Exception as error:
            print(f"❌ 원고 파일 읽기 실패: {error}")
            return 1

    async with async_playwright() as playwright:
        browser = await launch_chromium(playwright)

        try:
            session_file = os.path.join(BASE_DIR, "naver_session.json")
            context_options = {
                "viewport": {"width": 1280, "height": 900},
                "user_agent": (
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
            }

            if os.path.exists(session_file):
                print("💾 기존 세션 파일 로드 중...")
                context_options["storage_state"] = session_file

            context = await browser.new_context(**context_options)
            await context.add_init_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
            )
            page = await context.new_page()
            await apply_stealth(page)

            print("🌐 네이버 블로그 에디터 접근을 시도합니다...")
            await page.goto(WRITE_URL)
            await page.wait_for_load_state("networkidle")

            needs_login = await ensure_logged_in(page)
            editor_frame = get_editor_frame(page)
            await dismiss_editor_chrome(page, editor_frame)

            if needs_login:
                await context.storage_state(path=session_file)
                print("💾 세션 저장 완료")

            if probe_editor_dom:
                await print_editor_dom_probe(editor_frame)
                return 0

            print("🖋️ 제목을 입력합니다...")
            await asyncio.sleep(6)
            title_result = await set_post_title(page, editor_frame, post_title, MODIFIER)
            print(f"{'✅' if title_result.ok else '⚠️'} {title_result.message}")

            print("🖋️ 본문을 입력합니다...")
            await page.keyboard.press("Enter")
            await asyncio.sleep(1)
            await focus_body(editor_frame)
            await asyncio.sleep(1.0)
            await align_left(editor_frame)

            await write_body_segments(page, editor_frame, segments, asset_dir)

            if hashtags:
                await asyncio.sleep(0.5)
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.3)
                await paste_text(page, hashtags, MODIFIER)
                await asyncio.sleep(0.8)
                print(f"🏷️ 해시태그 입력 완료: {hashtags}")

            if format_check:
                await asyncio.sleep(1)
                await print_formatting_evidence(editor_frame)

            if not publish:
                wait_seconds = max(0, keep_open_seconds)
                mode_note = "draft-only" if draft_only else "publish 미지정"
                print(f"🛑 {mode_note} 모드: 공개 발행 버튼을 누르지 않습니다.")
                if wait_seconds:
                    print(f"💡 검수를 위해 {wait_seconds}초 동안 브라우저를 유지합니다.")
                    await asyncio.sleep(wait_seconds)
                return 0

            print("🚀 공개 발행 버튼 클릭을 시작합니다...")
            publish_result = await click_publish(page, editor_frame)
            print(f"{'🎉' if publish_result.ok else '⚠️'} {publish_result.message}")
            await asyncio.sleep(15)
            return 0 if publish_result.ok else 1
        except Exception as error:
            print(f"⚠️ 에디터 제어 중 오류: {error}")
            print("💡 iframe 구조, 네트워크 지연, 또는 SmartEditor DOM 변경 가능성")
            return 1
        finally:
            await browser.close()
            print("🛑 브라우저 정상 종료.")


def main() -> None:
    parser = build_arg_parser()
    args = parser.parse_args()

    if args.publish and args.draft_only:
        print("ℹ️ --publish 지정으로 초안 대기 대신 공개 발행까지 진행합니다.")

    exit_code = asyncio.run(
        open_naver_homepage(
            store_name=args.store,
            publish=args.publish,
            draft_only=not args.publish,
            format_check=args.format_check,
            probe_editor_dom=args.probe_editor_dom,
            keep_open_seconds=args.keep_open_seconds,
        )
    )
    sys.exit(exit_code or 0)


if __name__ == "__main__":
    main()
