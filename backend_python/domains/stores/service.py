import uuid
import json
import httpx
import asyncio
import os
import shutil
import traceback
from datetime import timedelta
from fastapi import Depends, HTTPException, BackgroundTasks
from sqlmodel.ext.asyncio.session import AsyncSession
from core.database import engine
from .repository import StoreRepository
from .model import (
    Store, StoreCreateRequest, KeywordTask, TrackedKeyword, 
    KeywordRankHistory, StoreReviewTag, StoreRecentReview, StoreMenu, get_utc_now
)
from domains.scraping.engine import ScrapingEngine
from domains.scraping.ranking_engine import fetch_realtime_ranking
from domains.scraping.place_detail_extractor import scrape_place_details
from domains.scraping.naver_ads_client import get_keyword_stats
from core.runtime_paths import get_static_media_dir

# --- Helper Functions ---
def find_my_rank_info(realtime_data, store):
    if not realtime_data:
        return None, False
        
    target_shop_id = None
    if store.placeUrl:
        try:
            parts = store.placeUrl.split('/')
            for i, p in enumerate(parts):
                if p in ["restaurant", "place"] and i+1 < len(parts):
                    target_shop_id = parts[i+1].split('?')[0]
                    break
        except Exception:
            pass

    if target_shop_id:
        for item in realtime_data:
            if str(item.get('shopId')) == target_shop_id:
                return item, True
                
    store_search_name = store.name.replace(" ", "")
    for item in realtime_data:
        scraped_name = item.get('shopName', '').replace(" ", "")
        if store_search_name in scraped_name or scraped_name in store_search_name:
            return item, True
            
    return None, True

# --- Background Workers ---
async def run_deep_scrape_registration_worker(store_id: int, place_url: str):
    try:
        place_id, details = await ScrapingEngine.deep_scrape_store(place_url)
        visitor_reviews = details.get("visitor_reviews", 0)
        blog_reviews = details.get("blog_reviews", 0)
        saves = details.get("saves", 0)
        rating = details.get("rating", 0.0)
        latitude = details.get("latitude")
        longitude = details.get("longitude")
        shopImageUrl_raw = details.get("shopImageUrl")
        keywords = None
        if details.get("suggested_keywords"):
            candidate_keywords = details.get("suggested_keywords")
            try:
                stats = await get_keyword_stats(candidate_keywords)
                # 월간 검색량(PC+Mobile) 100 이상인 키워드만 엄격하게 필터링
                valid_stats = [s for s in stats if s.get('total_vol', 0) >= 100]
                
                if not valid_stats:
                    # [틈새 업종 Fallback] 100 이상인 키워드가 아예 없다면, 네이버 최소치인 10 이상인 키워드 중 상위 10개만 예외적으로 허용합니다.
                    valid_stats = [s for s in stats if s.get('total_vol', 0) >= 10]
                    valid_stats.sort(key=lambda x: x.get('total_vol', 0), reverse=True)
                    valid_stats = valid_stats[:10]
                else:
                    valid_stats.sort(key=lambda x: x.get('total_vol', 0), reverse=True)
                
                # 저장수 무제한: 통과한 모든 키워드를 DB에 저장 (프론트엔드에서 10개씩 추출)
                top_kws = [s['keyword'] for s in valid_stats]
                
                if top_kws:
                    keywords = ",".join(top_kws)
                else:
                    keywords = None # 100 이상인 키워드가 단 하나도 없으면 저장하지 않음
            except Exception as e:
                print(f"Keyword stats fetch failed: {e}")
                keywords = None # API 실패 시에도 검증되지 않은 키워드는 저장하지 않음
            
        local_orig_urls = []
        local_thumb_urls = []
        if shopImageUrl_raw:
            try:
                raw_urls = [u for u in shopImageUrl_raw.split(',') if u]
                static_url_dir = f"static/images/stores/{store_id}"
                save_dir = os.path.join(str(get_static_media_dir()), "images", "stores", str(store_id))
                if os.path.isdir(save_dir):
                    shutil.rmtree(save_dir)
                os.makedirs(save_dir, exist_ok=True)
                
                async with httpx.AsyncClient() as client:
                    for idx, url in enumerate(raw_urls):
                        try:
                            orig_path = os.path.join(save_dir, f"orig_{idx}.jpg")
                            thumb_path = os.path.join(save_dir, f"thumb_{idx}.jpg")
                            orig_url_path = f"{static_url_dir}/orig_{idx}.jpg"
                            thumb_url_path = f"{static_url_dir}/thumb_{idx}.jpg"
                            
                            thumb_target_url = url
                            if 'ldb-phinf.pstatic.net' in url:
                                base_url = url.split('?')[0]
                                thumb_target_url = f"{base_url}?type=f300_300"
                            elif 'search.pstatic.net' not in url:
                                thumb_target_url = url
                            
                            orig_resp, thumb_resp = await asyncio.gather(
                                client.get(url, timeout=5.0),
                                client.get(thumb_target_url, timeout=5.0)
                            )
                            
                            if orig_resp.status_code == 200:
                                with open(orig_path, 'wb') as f:
                                    f.write(orig_resp.content)
                                local_orig_urls.append(f"/{orig_url_path}")
                                
                            if thumb_resp.status_code == 200:
                                with open(thumb_path, 'wb') as f:
                                    f.write(thumb_resp.content)
                                local_thumb_urls.append(f"/{thumb_url_path}")
                            elif orig_resp.status_code == 200:
                                local_thumb_urls.append(f"/{orig_url_path}")
                                    
                        except Exception as img_e:
                            print(f"Image download failed for {url}: {img_e}")
            except Exception as fs_e:
                print(f"⚡ [System] 디스크 폴더 생성 실패(권한/용량 등)로 이미지 저장을 건너뜁니다: {fs_e}")

        async with AsyncSession(engine) as session:
            repo = StoreRepository(session)
            store = await repo.get_store_with_relations(store_id)
            if store:
                store.visitor_reviews = visitor_reviews
                store.blog_reviews = blog_reviews
                store.saves = saves
                store.rating = rating
                store.latitude = latitude
                store.longitude = longitude
                store.keywords = keywords
                
                if local_orig_urls:
                    store.shopImageUrl = ",".join(local_orig_urls)
                elif shopImageUrl_raw and not store.shopImageUrl:
                    store.shopImageUrl = shopImageUrl_raw
                
                if local_thumb_urls:
                    store.shopImageThumbUrl = ",".join(local_thumb_urls)
                    
                store.review_tags = []
                store.recent_reviews = []
                store.menus = []
                
                review_tags_data = details.get("review_tags", {})
                if review_tags_data:
                    for cat, tags in review_tags_data.items():
                        for t in tags:
                            store.review_tags.append(StoreReviewTag(store_id=store.id, category=cat, name=t["name"], count=t["count"]))
                            
                recent_reviews_data = details.get("recent_reviews", [])
                if recent_reviews_data:
                    for rv in recent_reviews_data:
                        store.recent_reviews.append(StoreRecentReview(store_id=store.id, snippet=rv))
                        
                menus_data = details.get("menus", [])
                rep_menus_data = details.get("representative_menus", [])
                rep_names = {m.get("name", "") for m in rep_menus_data}
                
                if menus_data:
                    for m in menus_data:
                        menu_name = m.get("name", "")
                        store.menus.append(StoreMenu(
                            store_id=store.id,
                            name=menu_name,
                            price=m.get("price", ""),
                            description=m.get("desc"),
                            imgUrl=m.get("imgUrl"),
                            is_representative=(menu_name in rep_names)
                        ))
                
                existing_names = {m.get("name", "") for m in menus_data}
                if rep_menus_data:
                    for m in rep_menus_data:
                        menu_name = m.get("name", "")
                        if menu_name in existing_names:
                            continue
                        store.menus.append(StoreMenu(
                            store_id=store.id,
                            name=menu_name,
                            price=m.get("price", ""),
                            description=m.get("desc"),
                            imgUrl=m.get("imgUrl"),
                            is_representative=True
                        ))
                
                store.scrape_status = "COMPLETED"
                store.updatedAt = get_utc_now()
                await session.commit()
                
    except Exception as e:
        print(f"Deep scraping error in background: {e}")
        try:
            async with AsyncSession(engine) as session:
                repo = StoreRepository(session)
                store = await repo.get_store_by_id(store_id)
                if store:
                    store.scrape_status = "FAILED"
                    await session.commit()
        except Exception as rollback_e:
            print(f"⚡ [System] FAILED 상태 롤백 중 2차 에러 발생: {rollback_e}")

async def run_keyword_discovery_worker(task_id: str, store_id: int, seed_keyword: str):
    try:
        async with AsyncSession(engine) as session:
            repo = StoreRepository(session)
            store = await repo.get_store_by_id(store_id)
            if not store:
                return
                
            results = await ScrapingEngine.discover_golden_keywords(
                base_keyword=seed_keyword,
                target_store_name=store.name,
                target_lat=None,
                target_lon=None,
                target_placeUrl=store.placeUrl
            )
            
            task = await repo.get_keyword_task(task_id)
            if task:
                task.status = "COMPLETED"
                task.result_data = json.dumps(results, ensure_ascii=False)
                task.completed_at = get_utc_now()
                await repo.update_keyword_task(task)
                
    except Exception as e:
        print(f"Keyword Discovery Failed for task {task_id}: {e}")
        traceback.print_exc()
        try:
            async with AsyncSession(engine) as session:
                repo = StoreRepository(session)
                task = await repo.get_keyword_task(task_id)
                if task:
                    task.status = "FAILED"
                    task.error_message = str(e)
                    task.completed_at = get_utc_now()
                    await repo.update_keyword_task(task)
        except Exception as rollback_e:
            pass

# --- Store Service ---
class StoreService:
    def __init__(self, repo: StoreRepository = Depends()):
        self.repo = repo
        
    async def get_keyword_stats_batch(self, keywords: list[str]):
        """
        키워드 배열에 대해 일괄적으로 검색량 통계를 반환 (비동기)
        """
        try:
            return await get_keyword_stats(keywords)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"검색량 조회 실패: {str(e)}")

    async def search_stores(self, keyword: str):
        if not keyword:
            raise HTTPException(status_code=400, detail="검색어가 필요합니다.")
        return await ScrapingEngine.search_store_by_name(keyword)

    async def register_store(self, req: StoreCreateRequest, background_tasks: BackgroundTasks):
        if await self.repo.check_existing_store():
            raise HTTPException(status_code=409, detail="이미 등록된 가게가 있습니다.")

        new_store = Store(
            name=req.name,
            category=req.category,
            address=req.address,
            placeUrl=req.placeUrl,
            phone=req.phone,
            latitude=req.latitude,
            longitude=req.longitude,
            shopImageUrl=req.shopImageUrl,
            scrape_status="PENDING" if req.placeUrl else "COMPLETED"
        )
        await self.repo.create_store(new_store)
        
        if req.placeUrl:
            background_tasks.add_task(run_deep_scrape_registration_worker, new_store.id, req.placeUrl)
        
        return new_store

    async def get_my_stores(self):
        return await self.repo.get_all_stores()

    async def get_store(self, store_id: int):
        store = await self.repo.get_store_with_relations(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="상점을 찾을 수 없습니다.")
        return store

    async def sync_store_data(self, store_id: int, background_tasks: BackgroundTasks):
        store = await self.repo.get_store_with_relations(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="상점을 찾을 수 없습니다.")
            
        if store.placeUrl:
            store.scrape_status = "PENDING"
            store.updatedAt = get_utc_now()
            await self.repo.update_store(store)
            background_tasks.add_task(run_deep_scrape_registration_worker, store.id, store.placeUrl)
            
        return store

    async def discover_keywords(self, store_id: int, seed_keyword: str, background_tasks: BackgroundTasks):
        store = await self.repo.get_store_by_id(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="상점을 찾을 수 없습니다.")
            
        task_id = str(uuid.uuid4())
        new_task = KeywordTask(
            task_id=task_id,
            store_id=store_id,
            seed_keyword=seed_keyword,
            status="IN_PROGRESS"
        )
        await self.repo.create_keyword_task(new_task)
        background_tasks.add_task(run_keyword_discovery_worker, task_id, store_id, seed_keyword)
        return {"status": "success", "task_id": task_id, "message": "황금키워드 자동 발굴이 시작되었습니다."}

    async def get_keyword_status(self, store_id: int):
        latest_task = await self.repo.get_latest_keyword_task(store_id)
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

    async def get_realtime_ranking(self, store_id: int, keyword: str, province: str, lat: float = None, lon: float = None):
        store = await self.repo.get_store_by_id(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        try:
            return await fetch_realtime_ranking(keyword, province, store.name, lat=lat, lon=lon)
        except Exception as e:
            print(f"[{store_id}] 랭킹 조회 에러:", e)
            raise HTTPException(status_code=500, detail=f"랭킹 조회 실패: {str(e)}")

    async def register_track(self, store_id: int, keyword: str, province: str):
        store = await self.repo.get_store_by_id(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
            
        if await self.repo.get_tracked_keyword(store_id, keyword):
            raise HTTPException(status_code=400, detail="이미 추적 중인 키워드입니다.")
            
        new_track = await self.repo.create_tracked_keyword(TrackedKeyword(store_id=store_id, keyword=keyword, province=province))
        
        try:
            realtime_data = await fetch_realtime_ranking(keyword, province, store.name)
            my_rank_info, is_success = find_my_rank_info(realtime_data, store)
            if not is_success:
                 raise Exception("순위 데이터 수집에 실패했습니다.")
            
            detail_data = None
            if store.placeUrl:
                try:
                    detail_data = await scrape_place_details(store.placeUrl)
                except Exception as e:
                    print(f"[Fallback] 상세 리뷰 스크래핑 실패: {e}")
                    
            v_reviews = str(detail_data.get("visitor_reviews", 0)) if detail_data else (str(my_rank_info.get('visitorReviewCount', '0')) if my_rank_info else "0")
            b_reviews = str(detail_data.get("blog_reviews", 0)) if detail_data else (str(my_rank_info.get('blogReviewCount', '0')) if my_rank_info else "0")
                
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
            history = KeywordRankHistory(tracked_keyword_id=new_track.id, checked_at=get_utc_now())
            
        await self.repo.create_rank_history(history)
        return {"message": "success"}

    async def get_track_info(self, store_id: int):
        tracked_list = await self.repo.get_all_tracked_keywords_with_histories(store_id)
        
        response_list = []
        for t in tracked_list:
            histories = sorted(t.histories, key=lambda h: h.checked_at, reverse=True)
            current_rank = histories[0].rank if len(histories) > 0 else 0
            prev_rank = histories[1].rank if len(histories) > 1 else current_rank
            
            rank_change = prev_rank - current_rank if (prev_rank > 0 and current_rank > 0) else 0
            if current_rank == 0 and prev_rank > 0:
                 rank_change = -999
            elif current_rank > 0 and prev_rank == 0:
                 rank_change = 999
                 
            last_tracked_at = ""
            raw_last_tracked_at = ""
            if len(histories) > 0:
                kr_days = ["월", "화", "수", "목", "금", "토", "일"]
                kst_time = histories[0].checked_at + timedelta(hours=9)
                wd = kst_time.weekday()
                last_tracked_at = f"{kst_time.strftime('%m.%d')}({kr_days[wd]}) {kst_time.strftime('%H:%M')}"
                raw_last_tracked_at = histories[0].checked_at.isoformat() + "Z"
                 
            response_list.append({
                "id": t.id,
                "keyword": t.keyword,
                "province": t.province,
                "businessSector": t.businessSector,
                "shopId": str(store_id),
                "rankChange": rank_change,
                "currentRank": current_rank,
                "lastTrackedAt": last_tracked_at,
                "rawLastTrackedAt": raw_last_tracked_at,
                "totalCount": histories[0].total_count if len(histories) > 0 else 0
            })
            
        return {"info": response_list, "state": {"totalCount": len(response_list), "completedCount": len(response_list), "completedKeywords": response_list}}

    async def refresh_track(self, store_id: int, track_id: int):
        track = await self.repo.get_tracked_keyword_by_id(track_id)
        if not track or track.store_id != store_id:
            raise HTTPException(status_code=404, detail="Track not found")
            
        store = await self.repo.get_store_by_id(store_id)
        
        realtime_data = await fetch_realtime_ranking(track.keyword, track.province, store.name)
        my_rank_info, is_success = find_my_rank_info(realtime_data, store)
        if not is_success:
            raise HTTPException(status_code=503, detail="네이버 순위 데이터를 가져오는 데 실패했습니다.")
        
        detail_data = None
        if store.placeUrl:
            try:
                detail_data = await scrape_place_details(store.placeUrl)
            except Exception as e:
                pass
                
        v_reviews = str(detail_data.get("visitor_reviews", 0)) if detail_data else (str(my_rank_info.get('visitorReviewCount', '0')) if my_rank_info else "0")
        b_reviews = str(detail_data.get("blog_reviews", 0)) if detail_data else (str(my_rank_info.get('blogReviewCount', '0')) if my_rank_info else "0")
            
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
        await self.repo.create_rank_history(history)
        return {"message": "success"}

    async def refresh_all_tracks(self, store_id: int):
        store = await self.repo.get_store_by_id(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
            
        tracked_list = await self.repo.get_all_tracked_keywords_with_histories(store_id)
        
        latest_checked_at = None
        for t in tracked_list:
            if t.histories:
                recent_t = max((h.checked_at for h in t.histories), default=None)
                if recent_t and (not latest_checked_at or recent_t > latest_checked_at):
                    latest_checked_at = recent_t
                    
        if latest_checked_at:
            now = get_utc_now().replace(tzinfo=None)
            latest_naive = latest_checked_at.replace(tzinfo=None)
            
            now_kst = now + timedelta(hours=9)
            latest_kst = latest_naive + timedelta(hours=9)
            golden_time_kst = now_kst.replace(hour=12, minute=0, second=0, microsecond=0)
            
            bypass_cooldown = (latest_kst < golden_time_kst) and (now_kst >= golden_time_kst)
            
            diff = now - latest_naive
            if diff < timedelta(hours=3) and not bypass_cooldown:
                res_minutes = int((timedelta(hours=3) - diff).total_seconds() / 60)
                raise HTTPException(status_code=429, detail=f"수집 과부하 방지로 인해 현재 대기 중입니다. {res_minutes}분 후 다시 시도해주세요.")
        
        detail_data = None
        if store.placeUrl:
            try:
                detail_data = await scrape_place_details(store.placeUrl)
            except Exception as e:
                pass
                
        success_count = 0
        for track in tracked_list:
            try:
                realtime_data = await fetch_realtime_ranking(track.keyword, track.province, store.name)
                my_rank_info, is_success = find_my_rank_info(realtime_data, store)
                if not is_success:
                    continue
                
                v_reviews = str(detail_data.get("visitor_reviews", 0)) if detail_data else (str(my_rank_info.get('visitorReviewCount', '0')) if my_rank_info else "0")
                b_reviews = str(detail_data.get("blog_reviews", 0)) if detail_data else (str(my_rank_info.get('blogReviewCount', '0')) if my_rank_info else "0")
                    
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
                await self.repo.create_rank_history(history)
                success_count += 1
            except Exception as e:
                history = KeywordRankHistory(tracked_keyword_id=track.id, checked_at=get_utc_now())
                await self.repo.create_rank_history(history)
                
        return {"message": "success", "refreshed_count": success_count, "total_count": len(tracked_list)}

    async def delete_track(self, store_id: int, track_id: int):
        track = await self.repo.get_tracked_keyword_by_id(track_id)
        if not track or track.store_id != store_id:
            raise HTTPException(status_code=404, detail="Track not found")
        await self.repo.delete_tracked_keyword(track)
        return {"message": "success"}

    async def get_track_chart(self, store_id: int, track_ids: list[int], interval: str):
        if not track_ids:
            return {"storeId": store_id, "charts": {}}
            
        tracked_list = await self.repo.get_tracked_keywords_by_ids(store_id, track_ids)
        
        charts = {}
        from collections import defaultdict
        import datetime
        
        for t in tracked_list:
            keyword = t.keyword
            daily_ranks = []
            
            histories = sorted(t.histories, key=lambda h: h.checked_at)
            date_groups = defaultdict(list)
            
            for h in histories:
                h_kst = h.checked_at + timedelta(hours=9)
                if interval == "hourly":
                    d_str = h_kst.strftime("%Y-%m-%d %H:00")
                else:
                    d_str = h_kst.strftime("%Y-%m-%d")
                date_groups[d_str].append((h, h_kst))
                
            kr_days = ["월", "화", "수", "목", "금", "토", "일"]
            
            for d_str, h_pairs in date_groups.items():
                latest_pair = sorted(h_pairs, key=lambda p: p[0].checked_at, reverse=True)[0]
                latest_h, latest_h_kst = latest_pair
                
                wd = latest_h_kst.weekday()
                chart_date_key = latest_h_kst.strftime("%Y-%m-%d %H:00") if interval == "hourly" else latest_h_kst.strftime("%Y-%m-%d")
                formatted_time = f"{latest_h_kst.strftime('%m.%d')}({kr_days[wd]}) {latest_h_kst.strftime('%H:%M')}"
                
                daily_ranks.append({
                    "chartDate": chart_date_key,
                    "checkedTime": formatted_time,
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
