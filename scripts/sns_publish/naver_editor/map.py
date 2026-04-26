from __future__ import annotations

import asyncio

from . import selectors
from .context import find_first_visible_with_selector
from .types import FormatActionResult
from .typing import paste_text


def _map_hint_tokens(map_name: str) -> list[str]:
    return [token for token in map_name.split() if len(token) >= 2]


async def close_map_popup(page, context_frame) -> None:
    close_btn, _ = await find_first_visible_with_selector(context_frame, selectors.PLACE_CLOSE_BUTTON, timeout_ms=1000)
    if close_btn:
        await close_btn.click(timeout=2000)
        await asyncio.sleep(0.5)
    await page.keyboard.press("Escape")
    await asyncio.sleep(0.3)
    await page.keyboard.press("Escape")
    await asyncio.sleep(0.3)


async def _find_result_item_add_button(context_frame, map_name: str):
    hint_tokens = _map_hint_tokens(map_name)
    fallback = None
    fallback_selector = None

    for item_selector in selectors.PLACE_RESULT_ITEM:
        result_items = context_frame.locator(item_selector)
        try:
            count = await result_items.count()
        except Exception:
            continue

        for index in range(count):
            item = result_items.nth(index)
            try:
                if not await item.is_visible(timeout=300):
                    continue
                add_button = item.locator(", ".join(selectors.PLACE_ADD_BUTTON)).first
                if not await add_button.is_visible(timeout=300):
                    await item.hover(timeout=1000)
                    await asyncio.sleep(0.2)
                if not await add_button.is_visible(timeout=300):
                    continue
                if fallback is None:
                    fallback = add_button
                    fallback_selector = item_selector

                text = await item.inner_text(timeout=1000)
                matched_tokens = [token for token in hint_tokens if token in text]
                if len(matched_tokens) >= min(3, len(hint_tokens)):
                    return add_button, item_selector
                if "부산" in map_name and "부산" in text and "이조갈비" in text:
                    return add_button, item_selector
            except Exception:
                continue

    if fallback:
        return fallback, fallback_selector
    return await find_first_visible_with_selector(context_frame, selectors.PLACE_ADD_BUTTON, timeout_ms=1000)


async def _wait_for_enabled_confirm(context_frame, timeout_ms: int = 5000):
    deadline = asyncio.get_running_loop().time() + timeout_ms / 1000
    while asyncio.get_running_loop().time() < deadline:
        for selector in selectors.PLACE_CONFIRM_BUTTON:
            try:
                confirm_btn = context_frame.locator(selector).first
                if await confirm_btn.is_visible(timeout=300) and await confirm_btn.is_enabled(timeout=300):
                    return confirm_btn, selector
            except Exception:
                continue
        await asyncio.sleep(0.2)
    return None, None


async def choose_place_result(context_frame, map_name: str):
    result_links = context_frame.locator(", ".join(selectors.PLACE_RESULT_LINK))
    count = await result_links.count()
    if count == 0:
        return None, None

    hint_tokens = _map_hint_tokens(map_name)
    fallback = None
    for index in range(count):
        link = result_links.nth(index)
        try:
            if not await link.is_visible(timeout=300):
                continue
            if fallback is None:
                fallback = link
            text = await link.inner_text(timeout=1000)
            if hint_tokens and all(token in text for token in hint_tokens[:3]):
                return link, ".se-place-map-search-result-link"
            if "부산" in map_name and "부산" in text:
                return link, ".se-place-map-search-result-link"
        except Exception:
            continue

    return fallback, ".se-place-map-search-result-link" if fallback else None


async def insert_map(page, editor_frame, map_name: str, modifier: str) -> FormatActionResult:
    place_btn, place_selector = await find_first_visible_with_selector(editor_frame, selectors.PLACE_BUTTON, timeout_ms=2000)
    if not place_btn:
        return FormatActionResult(False, "map", "장소 버튼을 찾지 못했습니다.")

    await place_btn.click()
    await asyncio.sleep(1.5)

    context_frame = page
    search_input, search_selector = await find_first_visible_with_selector(context_frame, selectors.PLACE_SEARCH_INPUT, timeout_ms=3000)
    if not search_input:
        context_frame = editor_frame
        search_input, search_selector = await find_first_visible_with_selector(context_frame, selectors.PLACE_SEARCH_INPUT, timeout_ms=3000)

    if not search_input:
        await close_map_popup(page, context_frame)
        return FormatActionResult(False, "map", "장소 검색 입력창을 찾지 못했습니다.", selector=place_selector)

    try:
        await search_input.click()
        await asyncio.sleep(0.5)
        await page.keyboard.press(f"{modifier}+a")
        await asyncio.sleep(0.1)
        await paste_text(page, map_name, modifier)
        await asyncio.sleep(0.5)
        await page.keyboard.press("Enter")
        await asyncio.sleep(2.0)

        add_btn, result_selector = await _find_result_item_add_button(context_frame, map_name)
        if not add_btn:
            await close_map_popup(page, context_frame)
            return FormatActionResult(False, "map", "장소 검색 결과의 추가 버튼을 찾지 못했습니다.", selector=search_selector)
        await add_btn.click(timeout=5000, force=True)
        await asyncio.sleep(0.5)

        confirm_btn, confirm_selector = await _wait_for_enabled_confirm(context_frame, timeout_ms=5000)
        if not confirm_btn:
            await close_map_popup(page, context_frame)
            return FormatActionResult(False, "map", "장소 확인 버튼이 활성화되지 않았습니다.", selector=result_selector)
        await confirm_btn.click(timeout=5000, force=True)
        await asyncio.sleep(2)
        await page.keyboard.press("Escape")
        await asyncio.sleep(0.4)
        await page.keyboard.press("Escape")
        await asyncio.sleep(0.4)
        return FormatActionResult(
            True,
            "map",
            f"장소 첨부 성공: {map_name}",
            selector=confirm_selector,
            evidence={"place_selector": place_selector, "search_selector": search_selector},
        )
    except Exception as error:
        await close_map_popup(page, context_frame)
        return FormatActionResult(False, "map", f"장소 첨부 실패: {str(error)[:80]}")
