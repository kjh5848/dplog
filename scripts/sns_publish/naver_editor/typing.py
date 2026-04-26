from __future__ import annotations

import asyncio
import random
import re

import pyperclip


INLINE_PATTERN = re.compile(r"(\*\*[^*]+?\*\*|__[^_]+?__)")


def parse_inline_tokens(text: str) -> list[tuple[str, str]]:
    tokens: list[tuple[str, str]] = []
    for part in INLINE_PATTERN.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            tokens.append(("bold", part[2:-2]))
        elif part.startswith("__") and part.endswith("__"):
            tokens.append(("underline", part[2:-2]))
        else:
            tokens.append(("text", part))
    return tokens


async def paste_text(page, text: str, modifier: str) -> None:
    pyperclip.copy(text)
    await page.keyboard.press(f"{modifier}+v")


async def human_paste(page, text: str, modifier: str) -> None:
    idx = 0
    while idx < len(text):
        chunk_size = random.randint(4, 12)
        chunk = text[idx:idx + chunk_size]
        await paste_text(page, chunk, modifier)
        await asyncio.sleep(random.uniform(0.1, 0.35))
        idx += chunk_size


async def type_inline_text(page, text: str, modifier: str) -> None:
    for token_type, token_text in parse_inline_tokens(text):
        if token_type == "bold":
            await page.keyboard.press(f"{modifier}+b")
            await asyncio.sleep(0.15)
            await paste_text(page, token_text, modifier)
            await asyncio.sleep(0.4)
            await page.keyboard.press(f"{modifier}+b")
            await asyncio.sleep(0.15)
        elif token_type == "underline":
            await page.keyboard.press(f"{modifier}+u")
            await asyncio.sleep(0.15)
            await paste_text(page, token_text, modifier)
            await asyncio.sleep(0.4)
            await page.keyboard.press(f"{modifier}+u")
            await asyncio.sleep(0.15)
        else:
            await human_paste(page, token_text, modifier)
