from __future__ import annotations

import asyncio

from . import selectors
from .context import find_first_visible_with_selector
from .types import FormatActionResult


async def click_publish(page, editor_frame) -> FormatActionResult:
    context_frame = editor_frame
    publish_btn, selector = await find_first_visible_with_selector(editor_frame, selectors.PUBLISH_BUTTON, timeout_ms=3000)
    if not publish_btn:
        context_frame = page
        publish_btn, selector = await find_first_visible_with_selector(page, selectors.PUBLISH_BUTTON, timeout_ms=3000)

    if not publish_btn:
        return FormatActionResult(False, "publish", "1차 발행 버튼을 찾지 못했습니다.")

    await publish_btn.click(timeout=3000, force=True)
    await asyncio.sleep(2.5)

    final_query = ", ".join(selectors.PUBLISH_BUTTON)
    try:
        publish_final = context_frame.locator(final_query).last
        await publish_final.click(timeout=5000, force=True)
        await asyncio.sleep(5)
        return FormatActionResult(True, "publish", "포스팅 발행 완료", selector=selector)
    except Exception as error:
        return FormatActionResult(False, "publish", f"최종 발행 버튼 클릭 실패: {str(error)[:80]}", selector=selector)
