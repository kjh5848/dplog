from __future__ import annotations

import asyncio

from . import selectors
from .context import find_first_visible_with_selector
from .types import FormatActionResult
from .typing import paste_text, type_inline_text


async def select_current_line(page) -> None:
    await page.keyboard.press("Home")
    await page.keyboard.down("Shift")
    await page.keyboard.press("End")
    await page.keyboard.up("Shift")
    await asyncio.sleep(0.2)


async def set_post_title(page, editor_frame, title: str, modifier: str) -> FormatActionResult:
    title_locator, selector = await find_first_visible_with_selector(editor_frame, selectors.TITLE_INPUT, timeout_ms=3000)
    if not title_locator:
        return FormatActionResult(False, "title", "제목 요소를 찾지 못했습니다.")

    await title_locator.click()
    await asyncio.sleep(0.5)
    await page.keyboard.press(f"{modifier}+a")
    await asyncio.sleep(0.2)
    await paste_text(page, title, modifier)
    await asyncio.sleep(1)
    return FormatActionResult(True, "title", f"제목 설정 완료: {title}", selector=selector)


async def apply_heading(page, editor_frame, level: int) -> FormatActionResult:
    await select_current_line(page)
    paragraph_btn, paragraph_selector = await find_first_visible_with_selector(
        editor_frame,
        selectors.PARAGRAPH_BUTTON,
        timeout_ms=2000,
    )

    if not paragraph_btn:
        return FormatActionResult(False, "heading", "문단 드롭다운을 찾지 못했습니다.")

    await paragraph_btn.click()
    await asyncio.sleep(0.5)

    for selector in selectors.HEADING_MENU.get(level, []):
        try:
            item = editor_frame.locator(selector).first
            if await item.is_visible(timeout=2000):
                await item.click()
                await asyncio.sleep(0.4)
                return FormatActionResult(
                    True,
                    "heading",
                    f"H{level} 적용 완료",
                    selector=selector,
                    evidence={"paragraph_selector": paragraph_selector},
                )
        except Exception:
            continue

    await page.keyboard.press("Escape")
    return FormatActionResult(False, "heading", f"H{level} 메뉴 항목을 찾지 못했습니다.")


async def write_heading_segment(page, editor_frame, text: str, level: int, modifier: str) -> FormatActionResult:
    await type_inline_text(page, text, modifier)
    result = await apply_heading(page, editor_frame, level)
    if not result.ok:
        await page.keyboard.press(f"{modifier}+b")
        result.fallback = True
        result.message = f"H{level} 폴백: 굵은 문단으로 처리"
    await page.keyboard.press("End")
    await page.keyboard.press("Enter")
    await asyncio.sleep(0.4)
    return result


async def insert_quote(page, editor_frame, text: str, modifier: str) -> FormatActionResult:
    inserted, selector = await insert_underline_quote_component(editor_frame)
    if not inserted:
        await type_inline_text(page, f"❝ {text} ❞", modifier)
        await page.keyboard.press("Enter")
        await asyncio.sleep(0.4)
        return FormatActionResult(
            False,
            "quote",
            "인용구 버튼을 찾지 못해 텍스트 인용문으로 처리했습니다.",
            fallback=True,
        )

    await type_inline_text(page, text, modifier)
    await asyncio.sleep(0.5)
    exited = await focus_after_latest_quote(page, editor_frame)
    if not exited:
        await page.keyboard.press("Escape")
        await asyncio.sleep(0.2)
        await page.keyboard.press("ArrowDown")
        await asyncio.sleep(0.2)
    return FormatActionResult(True, "quote", f"인용문 삽입 완료: {text[:30]}...", selector=selector)


async def insert_underline_quote_component(editor_frame) -> tuple[bool, str | None]:
    underline_btn, underline_selector = await find_first_visible_with_selector(
        editor_frame,
        selectors.QUOTE_UNDERLINE_BUTTON,
        timeout_ms=700,
    )
    if underline_btn:
        await underline_btn.click(timeout=3000)
        await asyncio.sleep(1)
        return True, underline_selector

    select_btn, select_selector = await find_first_visible_with_selector(
        editor_frame,
        selectors.QUOTE_SELECT_BUTTON,
        timeout_ms=2000,
    )
    if select_btn:
        await select_btn.click(timeout=3000)
        await asyncio.sleep(0.5)
        underline_option, underline_option_selector = await find_first_visible_with_selector(
            editor_frame,
            selectors.QUOTE_UNDERLINE_OPTION,
            timeout_ms=2000,
        )
        if underline_option:
            await underline_option.click(timeout=3000)
            await asyncio.sleep(1)
            return True, underline_option_selector
        await select_btn.click(timeout=3000)
        await asyncio.sleep(0.2)

    quote_btn, quote_selector = await find_first_visible_with_selector(
        editor_frame,
        selectors.QUOTE_BUTTON,
        timeout_ms=2000,
    )
    if quote_btn:
        await quote_btn.click(timeout=3000)
        await asyncio.sleep(1)
        return True, quote_selector

    return False, select_selector


async def focus_after_latest_quote(page, editor_frame) -> bool:
    quote_locator = await latest_quote_boundary(editor_frame)
    if not quote_locator:
        return False

    try:
        box = await quote_locator.bounding_box(timeout=3000)
        if not box:
            return False
        viewport = page.viewport_size or {"width": 1280, "height": 900}
        click_x = min(max(box["x"] + min(box["width"] / 2, 350), 20), viewport["width"] - 20)
        click_y = box["y"] + box["height"] + 35
        if click_y > viewport["height"] - 30:
            await page.mouse.wheel(0, click_y - viewport["height"] + 90)
            await asyncio.sleep(0.4)
            box = await quote_locator.bounding_box(timeout=3000)
            if not box:
                return False
            click_x = min(max(box["x"] + min(box["width"] / 2, 350), 20), viewport["width"] - 20)
            click_y = min(box["y"] + box["height"] + 35, viewport["height"] - 30)
        await page.mouse.click(click_x, click_y)
        await asyncio.sleep(0.4)
        return True
    except Exception:
        await page.keyboard.press("Escape")
        await asyncio.sleep(0.2)
        return False


async def latest_quote_boundary(editor_frame):
    for selector in selectors.QUOTE_SECTION:
        try:
            locator = editor_frame.locator(selector).last
            if await locator.is_visible(timeout=500):
                return locator
        except Exception:
            continue

    for selector in selectors.QUOTE_BODY:
        try:
            locator = editor_frame.locator(selector).last
            if await locator.is_visible(timeout=500):
                return locator
        except Exception:
            continue

    return None


async def insert_horizontal_line(page, editor_frame, modifier: str) -> FormatActionResult:
    direct_line_item, direct_line_selector = await find_first_visible_with_selector(
        editor_frame,
        selectors.HORIZONTAL_LINE,
        timeout_ms=1000,
    )
    if direct_line_item:
        await direct_line_item.click()
        await asyncio.sleep(1)
        return FormatActionResult(
            True,
            "horizontal_line",
            "구분선 삽입 완료",
            selector=direct_line_selector,
        )

    plus_btn, plus_selector = await find_first_visible_with_selector(editor_frame, selectors.COMPONENT_ADD, timeout_ms=2000)
    if plus_btn:
        await plus_btn.click()
        await asyncio.sleep(0.5)
        line_item, line_selector = await find_first_visible_with_selector(editor_frame, selectors.HORIZONTAL_LINE, timeout_ms=2000)
        if line_item:
            await line_item.click()
            await asyncio.sleep(1)
            return FormatActionResult(
                True,
                "horizontal_line",
                "구분선 삽입 완료",
                selector=line_selector,
                evidence={"plus_selector": plus_selector},
            )
        await page.keyboard.press("Escape")

    await paste_text(page, "━━━━━━━━━━━━━━━━━━━━", modifier)
    await asyncio.sleep(0.5)
    await page.keyboard.press("Enter")
    await asyncio.sleep(0.3)
    return FormatActionResult(
        False,
        "horizontal_line",
        "구분선 버튼을 찾지 못해 텍스트 구분자로 처리했습니다.",
        fallback=True,
    )
