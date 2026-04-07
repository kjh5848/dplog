from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any
from datetime import datetime
import sqlite3
import os

from database import (
    get_all_target_stores, get_target_store, add_target_store,
    add_tracked_keyword, get_rank_history, get_latest_snapshot, DB_PATH
)

v1_router = APIRouter(prefix="/v1")

class StdResponse(BaseModel):
    success: bool = True
    data: Any = None
    error: Any = None
    timestamp: str = ""

# --- Phase 1: Auth Mock ---
@v1_router.post("/auth/kakao/login")
async def login():
    return StdResponse(data={
        "tokens": {"accessToken": "mock-token", "refreshToken": "mock-token"},
        "user": {"id": "user-001", "name": "김디플", "email": "owner@dplog.co.kr", "nickname": "사장님"}
    }, timestamp=datetime.now().isoformat())

@v1_router.get("/auth/me")
async def me():
    return StdResponse(data={
        "id": "user-001", "name": "김디플", "email": "owner@dplog.co.kr", "nickname": "사장님", "profileImageUrl": None
    }, timestamp=datetime.now().isoformat())

@v1_router.post("/auth/refresh")
async def refresh():
    return StdResponse(data={
        "tokens": {"accessToken": "mock-new-token", "refreshToken": "mock-new-token"}
    }, timestamp=datetime.now().isoformat())

@v1_router.post("/auth/logout")
async def logout():
    return StdResponse(data=None)


# --- Phase 2: Store ---
class StoreCreateReq(BaseModel):
    name: str = ""
    category: str = ""
    address: str = ""
    placeUrl: str = ""
    phone: str = ""

@v1_router.post("/stores")
async def create_store(req: StoreCreateReq):
    from place_detail_extractor import extract_place_id, scrape_place_details
    if not req.placeUrl:
        return StdResponse(success=False, error={"message": "네이버 플레이스 URL을 입력해주세요."})
    
    place_id_clean = await extract_place_id(req.placeUrl)
    if not place_id_clean:
         return StdResponse(success=False, error={"message": "올바른 네이버 플레이스 URL이 아닙니다."})
        
    details = await scrape_place_details(place_id_clean)
    if not details:
        return StdResponse(success=False, error={"message": "네이버 플레이스 정보를 수집하는데 실패했습니다."})
        
    category = details.get("categories", ["없음"])[0] if details.get("categories") else "없음"
    store_id = add_target_store(
        place_id=place_id_clean, 
        name=details.get("name", "알수없음"), 
        category=category, 
        address=details.get("address", "주소 없음"), 
        lat=0, 
        lon=0
    )
    store = get_target_store(store_id)
    return StdResponse(data={
        "id": store_id,
        "name": store["name"],
        "category": store["category"],
        "address": store["address"],
        "placeUrl": f"https://m.place.naver.com/restaurant/{place_id_clean}",
        "phone": req.phone,
        "createdAt": store["created_at"],
        "updatedAt": store["created_at"]
    }, timestamp=datetime.now().isoformat())

@v1_router.get("/stores/me")
async def get_my_stores():
    stores = get_all_target_stores()
    data = []
    for s in stores:
        data.append({
            "id": s["id"],
            "name": s["name"],
            "category": s["category"],
            "address": s["address"],
            "createdAt": s["created_at"],
            "updatedAt": s["created_at"]
        })
    return StdResponse(data=data, timestamp=datetime.now().isoformat())

@v1_router.get("/stores/{store_id}")
async def get_single_store(store_id: int):
    s = get_target_store(store_id)
    if not s:
        return StdResponse(success=False, error={"message": "Not found"})
    return StdResponse(data={
        "id": s["id"],
        "name": s["name"],
        "category": s["category"],
        "address": s["address"],
        "createdAt": s["created_at"],
        "updatedAt": s["created_at"]
    }, timestamp=datetime.now().isoformat())

@v1_router.put("/stores/{store_id}")
async def update_store(store_id: int, req: StoreCreateReq):
    s = get_target_store(store_id)
    if not s:
        return StdResponse(success=False, error={"message": "Not found"})
    return StdResponse(data={
        "id": s["id"],
        "name": req.name if req.name else s["name"],
        "category": req.category if req.category else s["category"],
        "address": req.address if req.address else s["address"],
        "createdAt": s["created_at"],
        "updatedAt": datetime.now().isoformat()
    }, timestamp=datetime.now().isoformat())


# --- Phase 2: Keywords Sets ---
class KwSetReq(BaseModel):
    keywords: str

@v1_router.post("/stores/{store_id}/keyword-sets")
async def add_kw_set(store_id: int, req: KwSetReq):
    import time
    kws = [k.strip() for k in req.keywords.split(",") if k.strip()]
    for kw in kws:
        add_tracked_keyword(store_id, kw)
    return StdResponse(data={
        "id": int(time.time()),
        "storeId": store_id,
        "keywords": req.keywords,
        "createdAt": datetime.now().isoformat()
    }, timestamp=datetime.now().isoformat())

@v1_router.get("/stores/{store_id}/keyword-sets")
async def get_kw_sets(store_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT keyword FROM tracked_keywords WHERE store_id = ?", (store_id,))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return StdResponse(data=[], timestamp=datetime.now().isoformat())
    
    combined = ", ".join([r[0] for r in rows])
    return StdResponse(data=[{
        "id": 1,
        "storeId": store_id,
        "keywords": combined,
        "createdAt": datetime.now().isoformat()
    }], timestamp=datetime.now().isoformat())


# --- Keyword Suggest (Mock) ---
@v1_router.get("/keywords/suggest")
async def suggest_kw(keyword: str = ""):
    return StdResponse(data={
        "hintKeyword": keyword,
        "keywords": [
            {"keyword": f"{keyword} 맛집", "monthlyPcSearchCount": "100", "monthlyMobileSearchCount": "1000", "competitionIndex": "높음"}
        ]
    }, timestamp=datetime.now().isoformat())


# --- Phase 3: Rankings ---
@v1_router.get("/stores/{store_id}/rankings")
async def get_rankings(store_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, keyword FROM tracked_keywords WHERE store_id = ?", (store_id,))
    trackers = cursor.fetchall()
    
    items = []
    for tid, kw in trackers:
        snap = get_latest_snapshot(tid)
        if snap:
            rank = snap.get("rank", 0)
            items.append({
                "keyword": kw,
                "rank": rank,
                "delta": 0,
                "searchVolume": 0,
                "competition": "중간",
                "bestRank": rank,
                "lastCheckedAt": snap.get("created_at")
            })
        else:
            items.append({
                "keyword": kw,
                "rank": 0,
                "delta": 0,
                "searchVolume": 0,
                "competition": "중간",
                "bestRank": 0,
                "lastCheckedAt": datetime.now().isoformat()
            })
    conn.close()
    
    store = get_target_store(store_id)
    return StdResponse(data={
        "storeId": store_id,
        "storeName": store["name"] if store else "Unknown",
        "items": items,
        "checkedAt": datetime.now().isoformat()
    }, timestamp=datetime.now().isoformat())

@v1_router.get("/stores/{store_id}/rankings/history")
async def get_rankings_history(store_id: int):
    history = get_rank_history(store_id)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, keyword FROM tracked_keywords WHERE store_id = ?", (store_id,))
    kws = dict(cursor.fetchall())
    conn.close()
    
    from collections import defaultdict
    date_map = defaultdict(dict)
    
    for tid, records in history.items():
        kw = kws.get(tid, "Unknown")
        for rec in records:
            # Extract date safely
            dt_str = rec.get("created_at", "")
            if "T" in dt_str:
                date_str = dt_str.split("T")[0]
            elif " " in dt_str:
                date_str = dt_str.split(" ")[0]
            else:
                date_str = dt_str
                
            if date_str:
                date_map[date_str][kw] = rec.get("rank", 0)
                
    trends = []
    for d, kw_ranks in sorted(date_map.items()):
        entry = {"date": d}
        entry.update(kw_ranks)
        trends.append(entry)
        
    return StdResponse(data={
        "storeId": store_id,
        "keywords": list(kws.values()),
        "trends": trends
    }, timestamp=datetime.now().isoformat())
