import os
import platform
import shutil
from pathlib import Path
from typing import Iterable


APP_DIR_NAME = "dplog"
LEGACY_USER_DATA_DIR = Path.home() / ".dplog"


def get_user_data_dir() -> Path:
    """
    Return the writable per-user directory used by packaged desktop builds.

    The old development build used ~/.dplog directly. When moving to OS-native
    desktop packages we migrate the small runtime files forward so existing
    local test data is not silently lost.
    """
    override = os.getenv("DPLOG_USER_DATA_DIR")
    if override:
        target = Path(override).expanduser()
    else:
        system = platform.system()
        if system == "Darwin":
            target = Path.home() / "Library" / "Application Support" / APP_DIR_NAME
        elif system == "Windows":
            appdata = os.getenv("APPDATA")
            target = Path(appdata) / APP_DIR_NAME if appdata else Path.home() / "AppData" / "Roaming" / APP_DIR_NAME
        else:
            target = LEGACY_USER_DATA_DIR

    target.mkdir(parents=True, exist_ok=True)
    _migrate_legacy_user_data(target)
    return target


def get_db_path() -> Path:
    return get_user_data_dir() / "dplog.db"


def get_static_media_dir() -> Path:
    path = get_user_data_dir() / "static"
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_browser_profile_dir() -> Path:
    path = get_user_data_dir() / "chrome_profile"
    path.mkdir(parents=True, exist_ok=True)
    return path


def seed_static_media(source_dir: str | os.PathLike[str]) -> None:
    source = Path(source_dir)
    if not source.exists():
        return

    target = get_static_media_dir()
    for child in source.iterdir():
        dest = target / child.name
        try:
            if child.is_dir():
                _copy_missing_tree(child, dest)
            elif not dest.exists():
                shutil.copy2(child, dest)
        except Exception as exc:
            print(f"⚡ [System] 정적 미디어 시드 복사 실패({child}): {exc}")


def _migrate_legacy_user_data(target: Path) -> None:
    if target == LEGACY_USER_DATA_DIR or not LEGACY_USER_DATA_DIR.exists():
        return

    for name in ("dplog.db", "static"):
        source = LEGACY_USER_DATA_DIR / name
        dest = target / name
        if not source.exists() or dest.exists():
            continue
        try:
            if source.is_dir():
                shutil.copytree(source, dest, dirs_exist_ok=True)
            else:
                shutil.copy2(source, dest)
        except Exception as exc:
            print(f"⚡ [System] 기존 사용자 데이터 마이그레이션 실패({name}): {exc}")


def _copy_missing_tree(source: Path, target: Path) -> None:
    target.mkdir(parents=True, exist_ok=True)
    for child in source.iterdir():
        dest = target / child.name
        if child.is_dir():
            _copy_missing_tree(child, dest)
        elif not dest.exists():
            shutil.copy2(child, dest)


def existing_paths(candidates: Iterable[str | os.PathLike[str]]) -> list[Path]:
    return [Path(path) for path in candidates if path and Path(path).exists()]
