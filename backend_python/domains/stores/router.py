from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, delete, desc
from sqlalchemy.orm import selectinload
from core.database import get_db
from .model import (
    Store, StoreCreateRequest, KeywordTask, StoreDetailResponse, StoreReviewTag, StoreRecentReview, StorePublic,
    TrackedKeyword, KeywordRankHistory, TrackRequest, TrackInfoResponse, get_utc_now, ChartRequest
)
from domains.scraping.engine import ScrapingEngine
from domains.scraping.ranking_engine import fetch_realtime_ranking
from domains.scraping.place_detail_extractor import scrape_place_details
from pydantic import BaseModel
import uuid
import json

router = APIRouter(tags=["stores"])

@router.get("/search")
async def search_stores(keyword: str):
    """
    네이버 플레이스 검색(이름/주소) API를 호출합니다.
    """
    if not keyword:
        raise HTTPException(status_code=400, detail="검색어가 필요합니다.")
        
    results = await ScrapingEngine.search_store_by_name(keyword)
    return {"status": "success", "results": results}

# 상점 등록용 딥 스크래핑 백그라운드 워커 함수
async def run_deep_scrape_registration_worker(store_id: int, place_url: str):
    from core.database import engine
    from sqlmodel.ext.asyncio.session import AsyncSession
    import httpx
    import asyncio
    import os
    
    try:
        place_id, details = await ScrapingEngine.deep_scrape_store(place_url)
        visitor_reviews = details.get("visitor_reviews", 0)
        blog_reviews = details.get("blog_reviews", 0)
        saves = details.get("saves", 0)
        rating = details.get("rating", 0.0)
        shopImageUrl_raw = details.get("shopImageUrl")
        keywords = None
        if details.get("suggested_keywords"):
            keywords = ",".join(details.get("suggested_keywords")[:10])
            
        # 썸네일 이미지 다운로드 및 로컬 캐싱
        local_orig_urls = []
        local_thumb_urls = []
        if shopImageUrl_raw:
            raw_urls = [u for u in shopImageUrl_raw.split(',') if u]
            save_dir = f"static/images/stores/{store_id}"
            os.makedirs(save_dir, exist_ok=True)
            
            async with httpx.AsyncClient() as client:
                for idx, url in enumerate(raw_urls):
                    try:
                        # 원본 로컬 저장
                        orig_path = f"{save_dir}/orig_{idx}.jpg"
                        # 썸네일(f300_300) 로컬 저장
                        thumb_path = f"{save_dir}/thumb_{idx}.jpg"
                        
                        thumb_target_url = url
                        if 'ldb-phinf.pstatic.net' in url:
                            base_url = url.split('?')[0]
                            thumb_target_url = f"{base_url}?type=f300_300"
                        elif 'search.pstatic.net' not in url:
                            thumb_target_url = url # fallback
                        
                        # 병렬 다운로드
                        orig_resp, thumb_resp = await asyncio.gather(
                            client.get(url, timeout=5.0),
                            client.get(thumb_target_url, timeout=5.0)
                        )
                        
                        if orig_resp.status_code == 200:
                            with open(orig_path, 'wb') as f:
                                f.write(orig_resp.content)
                            local_orig_urls.append(f"/{orig_path}")
                            
                        if thumb_resp.status_code == 200:
                            with open(thumb_path, 'wb') as f:
                                f.write(thumb_resp.content)
                            local_thumb_urls.append(f"/{thumb_path}")
                        elif orig_resp.status_code == 200:
                            # 썸네일 실패시 원본으로 대체
                            local_thumb_urls.append(f"/{orig_path}")
                                
                    except Exception as img_e:
                        print(f"Image download failed for {url}: {img_e}")

        async with AsyncSession(engine) as session:
            store = await session.get(Store, store_id)
            if store:
                store.visitor_reviews = visitor_reviews
                store.blog_reviews = blog_reviews
                store.saves = saves
                store.rating = rating
                store.keywords = keywords
                
                if local_orig_urls:
                    store.shopImageUrl = ",".join(local_orig_urls)
                elif shopImageUrl_raw and not store.shopImageUrl:
                    store.shopImageUrl = shopImageUrl_raw
                
                if local_thumb_urls:
                    store.shopImageThumbUrl = ",".join(local_thumb_urls)
                    
                # 기존 데이터 삭제 후 재삽입 (재수집 대비)
                await session.execute(delete(StoreReviewTag).where(StoreReviewTag.store_id == store.id))
                await session.execute(delete(StoreRecentReview).where(StoreRecentReview.store_id == store.id))
                
                review_tags_data = details.get("review_tags", {})
                if review_tags_data:
                    for cat, tags in review_tags_data.items():
                        for t in tags:
                            tt = StoreReviewTag(store_id=store.id, category=cat, name=t["name"], count=t["count"])
                            session.add(tt)
                            
                recent_reviews_data = details.get("recent_reviews", [])
                if recent_reviews_data:
                    for rv in recent_reviews_data:
                        rr = StoreRecentReview(store_id=store.id, snippet=rv)
                        session.add(rr)
                
                store.scrape_status = "COMPLETED"
                await session.commit()
                
    except Exception as e:
        print(f"Deep scraping error in background: {e}")
        async with AsyncSession(engine) as session:
            store = await session.get(Store, store_id)
            if store:
                store.scrape_status = "FAILED"
                await session.commit()


@router.post("", response_model=StorePublic)
async def register_store(req: StoreCreateRequest, background_tasks: BackgroundTasks, session: AsyncSession = Depends(get_db)):
    """
    신규 가게를 등록합니다.
    가게는 1개만 등록 가능합니다. 이미 등록된 가게가 있으면 409를 반환합니다.
    URL이 제공되면 백그라운드에서 딥-스크래핑을 실행하여 주요 지표(리뷰수 등)를 비동기식으로 가져옵니다.
    """
    # 1개 제한 체크
    existing = await session.execute(select(Store).limit(1))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="이미 등록된 가게가 있습니다. 가게는 1개만 등록할 수 있습니다.")

    new_store = Store(
        name=req.name,
        category=req.category,
        address=req.address,
        placeUrl=req.placeUrl,
        phone=req.phone,
        shopImageUrl=req.shopImageUrl,
        scrape_status="PENDING" if req.placeUrl else "COMPLETED"
    )
    session.add(new_store)
    await session.commit()
    await session.refresh(new_store)
    
    if req.placeUrl:
        background_tasks.add_task(run_deep_scrape_registration_worker, new_store.id, req.placeUrl)
    
    return new_store

@router.get("/me", response_model=List[StorePublic])
async def get_my_stores(session: AsyncSession = Depends(get_db)):
    """
    내가 등록한 가게 목록을 반환합니다. (현재는 전체 목록)
    """
    stmt = select(Store).order_by(Store.createdAt.desc()) # type: ignore
    result = await session.execute(stmt)
    stores = result.scalars().all()
    return stores

@router.get("/{store_id}", response_model=StoreDetailResponse)
async def get_store(store_id: int, session: AsyncSession = Depends(get_db)):
    """
    단일 가게 정보를 상세 조회합니다. (리뷰 데이터 포함 조인)
    """
    from sqlalchemy.orm import selectinload
    
    stmt = select(Store).where(Store.id == store_id).options(
        selectinload(Store.review_tags),
        selectinload(Store.recent_reviews)
    )
    result = await session.execute(stmt)
    store = result.scalar_one_or_none()
    
    if not store:
        raise HTTPException(status_code=404, detail="상점을 찾을 수 없습니다.")
    return store

class KeywordDiscoverRequest(BaseModel):
    seed_keyword: str

# 백그라운드 태스크 워커 함수
async def run_keyword_discovery_worker(task_id: str, store_id: int, seed_keyword: str):
    from core.database import engine
    from sqlmodel.ext.asyncio.session import AsyncSession
    
    try:
        async with AsyncSession(engine) as session:
            # 가게 정보 다시 로드
            store = await session.get(Store, store_id)
            if not store:
                return
                
            # 엔진 가동 (시간 오래 걸림)
            # 여기서는 가게의 정확한 위경도를 얻는 모듈이 필요하지만 일단 엔진에 넘김
            # (엔진 내부에서 None 대응 로직이 있음)
            results = await ScrapingEngine.discover_golden_keywords(
                base_keyword=seed_keyword,
                target_store_name=store.name,
                target_lat=None, # 주소 기반 지오코딩이 추후 필요할 수 있음
                target_lon=None,
                target_placeUrl=store.placeUrl
            )
            
            # 태스크 완료 처리
            stmt = select(KeywordTask).where(KeywordTask.task_id == task_id)
            res = await session.execute(stmt)
            task = res.scalar_one_or_none()
            if task:
                from .model import get_utc_now
                task.status = "COMPLETED"
                task.result_data = json.dumps(results, ensure_ascii=False)
                task.completed_at = get_utc_now()
                await session.commit()
                
    except Exception as e:
        print(f"Keyword Discovery Failed for task {task_id}: {e}")
        import traceback
        traceback.print_exc()
        # 예외 발생 시 상태를 FAILED로 업데이트하여 프론트엔드 무한로딩 방지
        async with AsyncSession(engine) as session:
            stmt = select(KeywordTask).where(KeywordTask.task_id == task_id)
            res = await session.execute(stmt)
            task = res.scalar_one_or_none()
            if task:
                from .model import get_utc_now
                task.status = "FAILED"
                task.error_message = str(e)
                task.completed_at = get_utc_now()
                await session.commit()

@router.post("/{store_id}/keywords/discover")
async def discover_keywords(store_id: int, req: KeywordDiscoverRequest, background_tasks: BackgroundTasks, session: AsyncSession = Depends(get_db)):
    """
    해당 스토어에 대한 황금키워드 모듈(Playwright/API)을 백그라운드로 구동하고 태스크 ID를 반환합니다.
    """
    store = await session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="상점을 찾을 수 없습니다.")
        
    task_id = str(uuid.uuid4())
    
    new_task = KeywordTask(
        task_id=task_id,
        store_id=store_id,
        seed_keyword=req.seed_keyword,
        status="IN_PROGRESS"
    )
    session.add(new_task)
    await session.commit()
    
    # 백그라운드 구동
    background_tasks.add_task(run_keyword_discovery_worker, task_id, store_id, req.seed_keyword)
    
    return {"status": "success", "task_id": task_id, "message": "황금키워드 자동 발굴이 시작되었습니다."}

@router.get("/{store_id}/keywords/status")
async def get_keyword_status(store_id: int, session: AsyncSession = Depends(get_db)):
    """
    해당 스토어에 가장 최근에 요청된 황금키워드 태스크의 상태와 결과를 가져옵니다.
    """
    stmt = select(KeywordTask).where(KeywordTask.store_id == store_id).order_by(KeywordTask.created_at.desc()) # type: ignore
    result = await session.execute(stmt)
    latest_task = result.scalars().first()
    
    if not latest_task:
        return {"status": "NO_TASK"}
        
    data = None
    if latest_task.result_data:
        data = json.loads(latest_task.result_data)
        
    return {
        "status": latest_task.status,
        "task_id": latest_task.task_id,
        "seed_keyword": latest_task.seed_keyword,
        "result": data,
        "error": latest_task.error_message
    }

# ==========================================
# 5. 순위 조회 & 추적 (Ranking Tracking) APIs
# ==========================================

@router.get("/{store_id}/ranking/realtime")
async def get_realtime_ranking(
    store_id: int, 
    keyword: str, 
    province: str = "서울", 
    lat: float = None, 
    lon: float = None, 
    session: AsyncSession = Depends(get_db)
):
    """단건 실시간 순위 조회 API (RealtimeRankTable 용)"""
    store = await session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
        
    try:
        # 단건 실시간 스크래핑 엔진 가동
        results = await fetch_realtime_ranking(keyword, province, store.name, lat=lat, lon=lon)
        return results
    except Exception as e:
        print(f"[{store_id}] 랭킹 조회 에러:", e)
        raise HTTPException(status_code=500, detail=f"랭킹 조회 실패: {str(e)}")

@router.post("/{store_id}/ranking/track")
async def register_track(store_id: int, req: TrackRequest, session: AsyncSession = Depends(get_db)):
    """트래킹 키워드 신규 등록 API"""
    store = await session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
        
    # 기존 중복 등록 확인
    stmt = select(TrackedKeyword).where(TrackedKeyword.store_id == store_id, TrackedKeyword.keyword == req.keyword)
    res = await session.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="이미 추적 중인 키워드입니다.")
        
    # 1. 새 트래킹 키워드 생성
    new_track = TrackedKeyword(store_id=store_id, keyword=req.keyword, province=req.province)
    session.add(new_track)
    await session.commit()
    await session.refresh(new_track)
    
    # 2. 최초 스냅샷 생성 (첫 순위 조회)
    try:
        realtime_data = await fetch_realtime_ranking(req.keyword, req.province, store.name)
        # 내 상점 찾기
        my_rank_info = next((item for item in realtime_data if item['shopName'] == store.name), None)
        
        # 상세 정보 동시 스크래핑으로 블로그 리뷰, 방문자 리뷰 확보 (사용자 요건)
        detail_data = None
        if store.placeUrl:
            try:
                detail_data = await scrape_place_details(store.placeUrl)
            except Exception as e:
                print(f"[Fallback] 상세 리뷰 스크래핑 실패: {e}")
                
        v_reviews = "0"
        b_reviews = "0"
        if detail_data:
            v_reviews = str(detail_data.get("visitor_reviews", 0))
            b_reviews = str(detail_data.get("blog_reviews", 0))
        elif my_rank_info:
            v_reviews = str(my_rank_info.get('visitorReviewCount', '0'))
            b_reviews = str(my_rank_info.get('blogReviewCount', '0'))
            
        history = KeywordRankHistory(
            tracked_keyword_id=new_track.id,
            rank=my_rank_info['rank'] if my_rank_info else 0,
            visitor_review_count=v_reviews,
            blog_review_count=b_reviews,
            score_info=my_rank_info['scoreInfo'] if my_rank_info else "0",
            save_count="0",
            total_count=realtime_data[0]['totalCount'] if realtime_data else 0,
            checked_at=get_utc_now()
        )
    except Exception as e:
        # 실패하더라도 0점 기록으로 생성 (프론트에서 로딩 멈춤 방지)
        history = KeywordRankHistory(tracked_keyword_id=new_track.id, checked_at=get_utc_now())
        
    session.add(history)
    await session.commit()
    
    return {"message": "success"}

@router.get("/{store_id}/ranking/track/info")
async def get_track_info(store_id: int, session: AsyncSession = Depends(get_db)):
    """등록된 트래킹 키워드 목록 조회 (RankingDashboard 용)"""
    stmt = (
        select(TrackedKeyword)
        .where(TrackedKeyword.store_id == store_id)
        .options(selectinload(TrackedKeyword.histories))
        .order_by(desc(TrackedKeyword.created_at))
    )
    result = await session.execute(stmt)
    tracked_list = result.scalars().all()
    
    response_list = []
    for t in tracked_list:
        # 과거 이력 중 가장 최근 2개 비교
        histories = sorted(t.histories, key=lambda h: h.checked_at, reverse=True)
        current_rank = histories[0].rank if len(histories) > 0 else 0
        prev_rank = histories[1].rank if len(histories) > 1 else current_rank
        
        # rank는 노출 순위이므로, 숫자가 작아지는 것이 '상승(+)' 임을 유의
        rank_change = prev_rank - current_rank if (prev_rank > 0 and current_rank > 0) else 0
        if current_rank == 0 and prev_rank > 0:
             rank_change = -999 # 미노출 하락
        elif current_rank > 0 and prev_rank == 0:
             rank_change = 999 # 신규 진입 상승
             
        response_list.append({
            "id": t.id,
            "keyword": t.keyword,
            "province": t.province,
            "businessSector": t.businessSector,
            "shopId": str(store_id),
            "rankChange": rank_change,
            # 추가 정보 전달
            "currentRank": current_rank
        })
        
    return {"info": response_list, "state": {"totalCount": len(response_list), "completedCount": len(response_list), "completedKeywords": response_list}}

@router.post("/{store_id}/ranking/track/{track_id}/refresh")
async def refresh_track(store_id: int, track_id: int, session: AsyncSession = Depends(get_db)):
    """특정 키워드의 순위를 실시간 수동 갱신 (새로운 History Row 추가)"""
    track = await session.get(TrackedKeyword, track_id)
    if not track or track.store_id != store_id:
        raise HTTPException(status_code=404, detail="Track not found")
        
    store = await session.get(Store, store_id)
    
    realtime_data = await fetch_realtime_ranking(track.keyword, track.province, store.name)
    my_rank_info = next((item for item in realtime_data if item['shopName'] == store.name), None)
    
    # 상세 정보 동시 스크래핑
    detail_data = None
    if store.placeUrl:
        try:
            detail_data = await scrape_place_details(store.placeUrl)
        except Exception as e:
            pass
            
    v_reviews = "0"
    b_reviews = "0"
    if detail_data:
        v_reviews = str(detail_data.get("visitor_reviews", 0))
        b_reviews = str(detail_data.get("blog_reviews", 0))
    elif my_rank_info:
        v_reviews = str(my_rank_info.get('visitorReviewCount', '0'))
        b_reviews = str(my_rank_info.get('blogReviewCount', '0'))
        
    history = KeywordRankHistory(
        tracked_keyword_id=track.id,
        rank=my_rank_info['rank'] if my_rank_info else 0,
        visitor_review_count=v_reviews,
        blog_review_count=b_reviews,
        score_info=my_rank_info['scoreInfo'] if my_rank_info else "0",
        save_count="0",
        total_count=realtime_data[0]['totalCount'] if realtime_data else 0,
        checked_at=get_utc_now()
    )
    session.add(history)
    await session.commit()
    
    return {"message": "success"}

@router.post("/{store_id}/ranking/track/refresh_all")
async def refresh_all_tracks(store_id: int, session: AsyncSession = Depends(get_db)):
    """등록된 모든 트래킹 키워드의 순위를 일괄 조회하여 갱신합니다. (배치 스케줄러 대체용 수동 트리거)"""
    store = await session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
        
    # 해당 스토어의 모든 트래킹 키워드 조회
    stmt = select(TrackedKeyword).where(TrackedKeyword.store_id == store_id)
    result = await session.execute(stmt)
    tracked_list = result.scalars().all()
    
    # 상세 정보 동시 스크래핑 (스토어 1회)
    detail_data = None
    if store.placeUrl:
        try:
            detail_data = await scrape_place_details(store.placeUrl)
        except Exception as e:
            pass
            
    success_count = 0
    # TODO: 대량일 경우 asyncio.gather 등으로 동시 처리하거나 Queue 사용 권장
    for track in tracked_list:
        try:
            realtime_data = await fetch_realtime_ranking(track.keyword, track.province, store.name)
            my_rank_info = next((item for item in realtime_data if item['shopName'] == store.name), None)
            
            v_reviews = "0"
            b_reviews = "0"
            if detail_data:
                v_reviews = str(detail_data.get("visitor_reviews", 0))
                b_reviews = str(detail_data.get("blog_reviews", 0))
            elif my_rank_info:
                v_reviews = str(my_rank_info.get('visitorReviewCount', '0'))
                b_reviews = str(my_rank_info.get('blogReviewCount', '0'))
                
            history = KeywordRankHistory(
                tracked_keyword_id=track.id,
                rank=my_rank_info['rank'] if my_rank_info else 0,
                visitor_review_count=v_reviews,
                blog_review_count=b_reviews,
                score_info=my_rank_info['scoreInfo'] if my_rank_info else "0",
                save_count="0",
                total_count=realtime_data[0]['totalCount'] if (realtime_data and len(realtime_data) > 0) else 0,
                checked_at=get_utc_now()
            )
            session.add(history)
            success_count += 1
        except Exception as e:
            # 실패 시 0점(에러) 기록 남김
            print(f"Failed to refresh keyword {track.keyword}: {e}")
            history = KeywordRankHistory(tracked_keyword_id=track.id, checked_at=get_utc_now())
            session.add(history)
            
    if tracked_list:
        await session.commit()
        
    return {"message": "success", "refreshed_count": success_count, "total_count": len(tracked_list)}

@router.delete("/{store_id}/ranking/track/{track_id}")
async def delete_track(store_id: int, track_id: int, session: AsyncSession = Depends(get_db)):
    track = await session.get(TrackedKeyword, track_id)
    if not track or track.store_id != store_id:
        raise HTTPException(status_code=404, detail="Track not found")
        
    await session.delete(track)
    await session.commit()
    return {"message": "success"}

@router.post("/{store_id}/ranking/track/chart")
async def get_track_chart(store_id: int, req: ChartRequest, session: AsyncSession = Depends(get_db)):
    """키워드들의 일자별 순위 차트 데이터 조회 (최대 90일치)"""
    track_ids = req.trackInfoIds
    if not track_ids:
        return {"storeId": store_id, "charts": {}}
        
    stmt = select(TrackedKeyword).where(
        TrackedKeyword.store_id == store_id, 
        TrackedKeyword.id.in_(track_ids)
    ).options(selectinload(TrackedKeyword.histories))
    
    result = await session.execute(stmt)
    tracked_list = result.scalars().all()
    
    charts = {}
    from collections import defaultdict
    import datetime
    
    for t in tracked_list:
        keyword = t.keyword
        daily_ranks = []
        
        histories = sorted(t.histories, key=lambda h: h.checked_at)
        date_groups = defaultdict(list)
        
        for h in histories:
            d_str = h.checked_at.strftime("%Y-%m-%d")
            date_groups[d_str].append(h)
            
        for d_str, h_list in date_groups.items():
            # 하루 중 가장 최신 데이터 기준
            latest_h = sorted(h_list, key=lambda h: h.checked_at, reverse=True)[0]
            daily_ranks.append({
                "chartDate": latest_h.checked_at.strftime("%m.%d"),
                "rank": latest_h.rank,
                "isValid": latest_h.rank > 0,
                "visitorReviewCount": latest_h.visitor_review_count,
                "blogReviewCount": latest_h.blog_review_count,
                "saveCount": latest_h.save_count
            })
            
        charts[keyword] = {
            "keyword": keyword,
            "startDate": "",
            "endDate": "",
            "dailyRanks": daily_ranks
        }
        
    return {"storeId": store_id, "charts": charts}

