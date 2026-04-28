import os
import platform
import shutil
import sys
from pathlib import Path
from typing import Iterable


DEFAULT_BROWSER_ARGS = [
    "--disable-blink-features=AutomationControlled",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
]


def find_chromium_executable() -> str | None:
    override = os.getenv("DPLOG_BROWSER_PATH")
    if override and Path(override).expanduser().exists():
        return str(Path(override).expanduser())

    candidates: list[str] = []
    system = platform.system()

    if system == "Darwin":
        candidates.extend(
            [
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
                "/Applications/Chromium.app/Contents/MacOS/Chromium",
            ]
        )
    elif system == "Windows":
        program_files = [os.getenv("PROGRAMFILES"), os.getenv("PROGRAMFILES(X86)"), os.getenv("LOCALAPPDATA")]
        for base in [p for p in program_files if p]:
            candidates.extend(
                [
                    os.path.join(base, "Google", "Chrome", "Application", "chrome.exe"),
                    os.path.join(base, "Microsoft", "Edge", "Application", "msedge.exe"),
                    os.path.join(base, "Chromium", "Application", "chrome.exe"),
                ]
            )
    else:
        for command in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge"):
            resolved = shutil.which(command)
            if resolved:
                candidates.append(resolved)

    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return candidate
    return None


async def launch_chromium(playwright, *, headless: bool = True, args: Iterable[str] | None = None):
    browser_args = list(DEFAULT_BROWSER_ARGS)
    if platform.system() != "Windows":
        browser_args.append("--no-sandbox")
    if args:
        browser_args.extend(arg for arg in args if arg not in browser_args)

    executable_path = find_chromium_executable()
    if executable_path:
        return await playwright.chromium.launch(
            executable_path=executable_path,
            headless=headless,
            args=browser_args,
        )

    if getattr(sys, "frozen", False):
        raise RuntimeError(
            "Chrome 또는 Microsoft Edge를 찾을 수 없습니다. D-PLOG 데스크톱 앱은 설치된 Chromium 계열 브라우저가 필요합니다."
        )

    return await playwright.chromium.launch(headless=headless, args=browser_args)
