from __future__ import annotations

import asyncio
import os

from . import selectors
from .context import find_first_visible_with_selector
from .types import FormatActionResult


async def upload_media(page, editor_frame, path: str) -> FormatActionResult:
    return await upload_media_group(page, editor_frame, [path])


def image_layout_selectors(count: int) -> tuple[str, list[str]]:
    if count >= 5:
        return "슬라이드", selectors.IMAGE_TYPE_SLIDE
    if count >= 2:
        return "콜라주", selectors.IMAGE_TYPE_COLLAGE
    return "개별사진", selectors.IMAGE_TYPE_INDIVIDUAL


async def close_image_type_popup_if_visible(page, editor_frame) -> bool:
    closed = False
    for context in (editor_frame, page):
        popup, _ = await find_first_visible_with_selector(context, selectors.IMAGE_TYPE_POPUP, timeout_ms=800)
        if not popup:
            continue
        try:
            close_button = popup.locator(".se-popup-close-button").first
            if await close_button.is_visible(timeout=800):
                await close_button.click(timeout=2000, force=True)
                await asyncio.sleep(0.5)
                closed = True
        except Exception:
            await page.keyboard.press("Escape")
            await asyncio.sleep(0.5)
            closed = True
    return closed


async def apply_native_image_layout(page, editor_frame, count: int) -> FormatActionResult:
    if count <= 1:
        return FormatActionResult(True, "image_layout", "단일 이미지라 정렬 팝업 처리를 생략합니다.")

    popup = None
    for context in (editor_frame, page):
        popup, _ = await find_first_visible_with_selector(context, selectors.IMAGE_TYPE_POPUP, timeout_ms=3000)
        if popup:
            layout_name, layout_selectors = image_layout_selectors(count)
            for selector in layout_selectors:
                try:
                    option = popup.locator(selector).first
                    if await option.is_visible(timeout=1000):
                        await option.click(timeout=3000, force=True)
                        await asyncio.sleep(1)
                        popup_closed = await close_image_type_popup_if_visible(page, editor_frame)
                        return FormatActionResult(
                            True,
                            "image_layout",
                            f"네이버 이미지 정렬 선택 완료: {layout_name}",
                            selector=selector,
                            evidence={"count": count, "layout": layout_name, "popup_closed": popup_closed},
                        )
                except Exception:
                    continue

            try:
                await popup.get_by_text(layout_name).first.click(timeout=3000, force=True)
                await asyncio.sleep(1)
                popup_closed = await close_image_type_popup_if_visible(page, editor_frame)
                return FormatActionResult(
                    True,
                    "image_layout",
                    f"네이버 이미지 정렬 선택 완료: {layout_name}",
                    evidence={"count": count, "layout": layout_name, "fallback": "text", "popup_closed": popup_closed},
                )
            except Exception as error:
                return FormatActionResult(
                    False,
                    "image_layout",
                    f"네이버 이미지 정렬 선택 실패: {str(error)[:80]}",
                    fallback=True,
                )

    return FormatActionResult(False, "image_layout", "네이버 이미지 정렬 팝업을 찾지 못했습니다.", fallback=True)


async def upload_media_group(page, editor_frame, paths: list[str]) -> FormatActionResult:
    abs_paths = [os.path.abspath(path) for path in paths]
    if not abs_paths:
        return FormatActionResult(False, "media", "업로드할 파일이 없습니다.")

    missing_paths = [path for path in abs_paths if not os.path.exists(path)]
    if missing_paths:
        return FormatActionResult(False, "media", f"파일 없음: {missing_paths[0]}")

    filenames = ", ".join(os.path.basename(path) for path in abs_paths[:3])
    if len(abs_paths) > 3:
        filenames = f"{filenames} 외 {len(abs_paths) - 3}개"
    group_note = "네이버 네이티브 이미지 정렬" if len(abs_paths) > 1 else "단일 미디어"
    settle_seconds = min(45, 7 + len(abs_paths) * 3)

    for selector in selectors.FILE_INPUT:
        try:
            locator = editor_frame.locator(selector).first
            if await locator.count() > 0:
                await locator.set_input_files(abs_paths)
                await asyncio.sleep(settle_seconds)
                layout_result = await apply_native_image_layout(page, editor_frame, len(abs_paths))
                if not layout_result.ok:
                    return layout_result
                return FormatActionResult(
                    True,
                    "media",
                    f"[방식A] {group_note} 업로드 완료: {filenames} / {layout_result.message}",
                    selector=selector,
                    evidence={"count": len(abs_paths), "native_alignment": len(abs_paths) > 1},
                )
        except Exception:
            continue

    last_error = ""
    selector = None
    for attempt in range(1, 4):
        await page.keyboard.press("Escape")
        await asyncio.sleep(1.0)
        photo_btn, selector = await find_first_visible_with_selector(editor_frame, selectors.IMAGE_BUTTON, timeout_ms=3000)
        if not photo_btn:
            return FormatActionResult(False, "media", f"사진 업로드 버튼을 찾지 못했습니다: {filenames}")

        try:
            async with page.expect_file_chooser(timeout=10000) as file_chooser_info:
                await photo_btn.click(timeout=5000, force=attempt > 1)
            file_chooser = await file_chooser_info.value
            await file_chooser.set_files(abs_paths)
            await asyncio.sleep(settle_seconds)
            layout_result = await apply_native_image_layout(page, editor_frame, len(abs_paths))
            if not layout_result.ok:
                return layout_result
            retry_note = "" if attempt == 1 else f" retry {attempt}"
            return FormatActionResult(
                True,
                "media",
                f"[방식B{retry_note}] {group_note} 업로드 완료: {filenames} / {layout_result.message}",
                selector=selector,
                evidence={"count": len(abs_paths), "native_alignment": len(abs_paths) > 1},
            )
        except Exception as error:
            last_error = str(error)[:80]
            await page.keyboard.press("Escape")
            await asyncio.sleep(4)

    return FormatActionResult(False, "media", f"업로드 실패: {last_error}", selector=selector)
