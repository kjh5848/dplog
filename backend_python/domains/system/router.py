import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from core.app_info import APP_VERSION
from core.database import DATABASE_URL, db_path, get_db
from core.runtime_paths import get_static_media_dir, get_user_data_dir
from domains.stores.model import KeywordTask, Store

router = APIRouter(tags=["system"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))


def _frontend_out_dir() -> str:
    packaged_out = os.path.join(BASE_DIR, "static_out")
    if os.path.isdir(packaged_out):
        return packaged_out
    return os.path.join(os.path.dirname(BASE_DIR), "frontend_dplog", "out")


def _sqlite_file_path() -> Optional[str]:
    if not DATABASE_URL.startswith("sqlite"):
        return None
    marker = ":///"
    if marker not in DATABASE_URL:
        return None
    path = DATABASE_URL.split(marker, 1)[1]
    if not path or path == ":memory:":
        return None
    return path


def _database_status() -> dict:
    sqlite_path = _sqlite_file_path()
    exists = bool(sqlite_path and os.path.exists(sqlite_path))
    size_bytes = os.path.getsize(sqlite_path) if exists and sqlite_path else 0
    if sqlite_path == db_path:
        location = "user-data/dplog.db"
    elif sqlite_path:
        location = "configured sqlite file"
    else:
        location = "in-memory"
    return {
        "type": "sqlite" if DATABASE_URL.startswith("sqlite") else "external",
        "exists": exists,
        "sizeBytes": size_bytes,
        "location": location,
    }


@router.get("/status")
async def get_system_status(session: AsyncSession = Depends(get_db)):
    frontend_out = _frontend_out_dir()
    index_path = os.path.join(frontend_out, "index.html")
    next_assets_path = os.path.join(frontend_out, "_next")

    store_summary = None
    latest_task_summary = None

    result = await session.exec(select(Store).order_by(Store.createdAt.desc()).limit(1))  # type: ignore
    store = result.first()
    if store:
        store_summary = {
            "id": store.id,
            "name": store.name,
            "category": store.category,
            "updatedAt": store.updatedAt.isoformat() if store.updatedAt else None,
            "scrapeStatus": store.scrape_status,
            "keywordsCount": len([k for k in (store.keywords or "").split(",") if k.strip()]),
        }

        task_result = await session.exec(
            select(KeywordTask)
            .where(KeywordTask.store_id == store.id)
            .order_by(KeywordTask.created_at.desc())  # type: ignore
            .limit(1)
        )
        task = task_result.first()
        if task:
            latest_task_summary = {
                "status": task.status,
                "seedKeyword": task.seed_keyword,
                "createdAt": task.created_at.isoformat() if task.created_at else None,
                "completedAt": task.completed_at.isoformat() if task.completed_at else None,
                "error": task.error_message,
            }

    return {
        "backend": {
            "connected": True,
            "version": APP_VERSION,
            "appMode": os.environ.get("NEXT_PUBLIC_APP_MODE", "saas"),
            "port": int(os.environ.get("PORT", 45123)),
            "serverTime": datetime.now().isoformat(timespec="seconds"),
        },
        "database": _database_status(),
        "staticAssets": {
            "exists": os.path.isdir(frontend_out),
            "indexExists": os.path.isfile(index_path),
            "assetDirExists": os.path.isdir(next_assets_path),
            "mediaDirExists": os.path.isdir(get_static_media_dir()),
        },
        "runtime": {
            "userDataDir": "configured" if os.path.isdir(get_user_data_dir()) else "missing",
        },
        "store": store_summary,
        "keywordTask": latest_task_summary,
    }


@router.get("/backup/db")
async def backup_database():
    sqlite_path = _sqlite_file_path()
    if not sqlite_path or not os.path.exists(sqlite_path):
        raise HTTPException(status_code=404, detail="백업할 로컬 DB 파일을 찾을 수 없습니다.")

    filename = f"dplog-backup-{datetime.now().strftime('%Y%m%d-%H%M')}.db"
    return FileResponse(
        sqlite_path,
        media_type="application/octet-stream",
        filename=filename,
    )
