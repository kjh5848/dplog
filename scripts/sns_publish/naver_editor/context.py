from __future__ import annotations

import asyncio
from typing import Any

from . import selectors


async def find_first_visible(context: Any, selector_list: list[str], timeout_ms: int = 1500):
    locator, _ = await find_first_visible_with_selector(context, selector_list, timeout_ms)
    return locator


async def find_first_visible_with_selector(context: Any, selector_list: list[str], timeout_ms: int = 1500):
    for selector in selector_list:
        try:
            locator = context.locator(selector).first
            if await locator.is_visible(timeout=timeout_ms):
                return locator, selector
        except Exception:
            continue
    return None, None


def get_editor_frame(page: Any):
    for frame in page.frames:
        if frame.name == "mainFrame":
            return frame
    return page


async def dismiss_editor_chrome(page: Any, editor_frame: Any) -> None:
    print("🛡️ 에디터 팝업 간섭 제거...")
    try:
        popup, _ = await find_first_visible_with_selector(editor_frame, selectors.POPUP, timeout_ms=6000)
        if popup:
            cancel_btn = popup.get_by_text("취소").first
            await cancel_btn.click(timeout=3000)
            print("✅ 팝업 취소 완료")
            await asyncio.sleep(1)
        else:
            print("👍 팝업 없음")
    except Exception:
        pass

    await page.keyboard.press("Escape")
    await asyncio.sleep(0.3)
    await page.keyboard.press("Escape")
    await asyncio.sleep(0.5)

    try:
        help_btn, _ = await find_first_visible_with_selector(editor_frame, selectors.HELP_CLOSE, timeout_ms=3000)
        if help_btn:
            await help_btn.click()
            print("✅ 도움말 사이드바 닫음")
    except Exception:
        pass


async def focus_body(editor_frame: Any) -> None:
    body, selector = await find_first_visible_with_selector(editor_frame, selectors.BODY_CONTAINER, timeout_ms=3000)
    if body:
        await body.click(position={"x": 50, "y": 150}, timeout=3000)
        print(f"✅ 본문 영역 포커스: {selector}")


async def align_left(editor_frame: Any) -> None:
    left_btn, selector = await find_first_visible_with_selector(editor_frame, selectors.ALIGN_LEFT, timeout_ms=1000)
    if left_btn:
        await left_btn.click()
        await asyncio.sleep(0.5)
        print(f"✅ 좌측 정렬 적용: {selector}")
