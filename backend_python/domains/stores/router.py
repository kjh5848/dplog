from fastapi import APIRouter, Depends, BackgroundTasks
from typing import List
from sqlmodel.ext.asyncio.session import AsyncSession
from core.database import get_db
from .model import (
    StoreCreateRequest, StoreDetailResponse, StorePublic,
    TrackRequest, ChartRequest
)
from .service import StoreService
from .repository import StoreRepository
from pydantic import BaseModel

class KeywordStatsRequest(BaseModel):
    keywords: List[str]

class KeywordDiscoverRequest(BaseModel):
    seed_keyword: str

router = APIRouter(tags=["stores"])

def get_store_service(session: AsyncSession = Depends(get_db)):
    repo = StoreRepository(session)
    return StoreService(repo)

@router.post("/{store_id}/keywords/stats", summary="다중 키워드 검색량 일괄 조회 (추천 시드용)")
async def get_keyword_stats_batch(store_id: int, req: KeywordStatsRequest, service: StoreService = Depends(get_store_service)):
    return await service.get_keyword_stats_batch(req.keywords)

@router.get("/search")
async def search_stores(keyword: str, service: StoreService = Depends(get_store_service)):
    results = await service.search_stores(keyword)
    return {"status": "success", "results": results}

@router.post("", response_model=StorePublic)
async def register_store(req: StoreCreateRequest, background_tasks: BackgroundTasks, service: StoreService = Depends(get_store_service)):
    return await service.register_store(req, background_tasks)

@router.get("/me", response_model=List[StorePublic])
async def get_my_stores(service: StoreService = Depends(get_store_service)):
    return await service.get_my_stores()

@router.get("/{store_id}", response_model=StoreDetailResponse)
async def get_store(store_id: int, service: StoreService = Depends(get_store_service)):
    return await service.get_store(store_id)

@router.post("/{store_id}/sync", response_model=StoreDetailResponse)
async def sync_store_data(store_id: int, background_tasks: BackgroundTasks, service: StoreService = Depends(get_store_service)):
    return await service.sync_store_data(store_id, background_tasks)

@router.post("/{store_id}/keywords/discover")
async def discover_keywords(store_id: int, req: KeywordDiscoverRequest, background_tasks: BackgroundTasks, service: StoreService = Depends(get_store_service)):
    return await service.discover_keywords(store_id, req.seed_keyword, background_tasks)

@router.get("/{store_id}/keywords/status")
async def get_keyword_status(store_id: int, service: StoreService = Depends(get_store_service)):
    return await service.get_keyword_status(store_id)

@router.get("/{store_id}/ranking/realtime")
async def get_realtime_ranking(
    store_id: int,
    keyword: str,
    province: str = "",
    lat: float = None,
    lon: float = None,
    service: StoreService = Depends(get_store_service)
):
    return await service.get_realtime_ranking(store_id, keyword, province, lat, lon)

@router.post("/{store_id}/ranking/track")
async def register_track(store_id: int, req: TrackRequest, service: StoreService = Depends(get_store_service)):
    return await service.register_track(store_id, req.keyword, req.province)

@router.get("/{store_id}/ranking/track/info")
async def get_track_info(store_id: int, service: StoreService = Depends(get_store_service)):
    return await service.get_track_info(store_id)

@router.post("/{store_id}/ranking/track/{track_id}/refresh")
async def refresh_track(store_id: int, track_id: int, service: StoreService = Depends(get_store_service)):
    return await service.refresh_track(store_id, track_id)

@router.post("/{store_id}/ranking/track/refresh_all")
async def refresh_all_tracks(store_id: int, service: StoreService = Depends(get_store_service)):
    return await service.refresh_all_tracks(store_id)

@router.delete("/{store_id}/ranking/track/{track_id}")
async def delete_track(store_id: int, track_id: int, service: StoreService = Depends(get_store_service)):
    return await service.delete_track(store_id, track_id)

@router.post("/{store_id}/ranking/track/chart")
async def get_track_chart(store_id: int, req: ChartRequest, service: StoreService = Depends(get_store_service)):
    return await service.get_track_chart(store_id, req.trackInfoIds, req.interval)
