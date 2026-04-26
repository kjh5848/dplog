from __future__ import annotations

from typing import Any

from . import selectors


async def count_any(context: Any, selector_list: list[str]) -> int:
    total = 0
    for selector in selector_list:
        try:
            total += await context.locator(selector).count()
        except Exception:
            continue
    return total


async def collect_formatting_evidence(editor_frame) -> dict[str, int]:
    evidence: dict[str, int] = {}
    for key, selector_list in selectors.EVIDENCE.items():
        evidence[key] = await count_any(editor_frame, selector_list)
    return evidence


async def print_formatting_evidence(editor_frame) -> dict[str, int]:
    evidence = await collect_formatting_evidence(editor_frame)
    print("🔎 서식 evidence")
    for key, count in evidence.items():
        print(f"  - {key}: {count}")
    return evidence


async def probe_editor_dom(editor_frame, limit: int = 120) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    query = ", ".join(selectors.PROBE_BUTTONS)
    locator = editor_frame.locator(query)
    count = min(await locator.count(), limit)
    for index in range(count):
        item = locator.nth(index)
        try:
            rows.append(
                await item.evaluate(
                    """node => ({
                        tag: node.tagName.toLowerCase(),
                        text: (node.innerText || node.textContent || '').trim().slice(0, 60),
                        dataName: node.getAttribute('data-name') || '',
                        title: node.getAttribute('title') || '',
                        aria: node.getAttribute('aria-label') || '',
                        cls: node.getAttribute('class') || ''
                    })"""
                )
            )
        except Exception:
            continue
    return rows


async def print_editor_dom_probe(editor_frame) -> list[dict[str, str]]:
    rows = await probe_editor_dom(editor_frame)
    print("🔎 SmartEditor DOM 후보")
    for row in rows:
        print(
            f"- <{row.get('tag', '')}> "
            f"data-name={row.get('dataName', '')!r} "
            f"title={row.get('title', '')!r} "
            f"aria={row.get('aria', '')!r} "
            f"text={row.get('text', '')!r} "
            f"class={row.get('cls', '')[:80]!r}"
        )
    return rows
