from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, delete, desc
from sqlalchemy.orm import selectinload
from fastapi import Depends
from core.database import get_db
from .model import (
    Store, KeywordTask, TrackedKeyword, KeywordRankHistory, 
    StoreReviewTag, StoreRecentReview, StoreMenu
)

class StoreRepository:
    def __init__(self, session: AsyncSession = Depends(get_db)):
        self.session = session

    async def get_store_by_id(self, store_id: int) -> Store | None:
        return await self.session.get(Store, store_id)

    async def get_store_with_relations(self, store_id: int) -> Store | None:
        stmt = select(Store).where(Store.id == store_id).options(
            selectinload(Store.review_tags),
            selectinload(Store.recent_reviews),
            selectinload(Store.menus)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_stores(self):
        stmt = select(Store).order_by(Store.createdAt.desc()) # type: ignore
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def check_existing_store(self) -> bool:
        existing = await self.session.execute(select(Store).limit(1))
        return existing.scalar_one_or_none() is not None

    async def create_store(self, store: Store) -> Store:
        self.session.add(store)
        await self.session.commit()
        await self.session.refresh(store)
        return store
        
    async def update_store(self, store: Store):
        self.session.add(store)
        await self.session.commit()
        await self.session.refresh(store)
        return store
        
    async def clear_store_details(self, store_id: int):
        await self.session.execute(delete(StoreReviewTag).where(StoreReviewTag.store_id == store_id))
        await self.session.execute(delete(StoreRecentReview).where(StoreRecentReview.store_id == store_id))
        await self.session.execute(delete(StoreMenu).where(StoreMenu.store_id == store_id))
        await self.session.commit()

    # --- Keyword Task ---
    async def create_keyword_task(self, task: KeywordTask):
        self.session.add(task)
        await self.session.commit()
        
    async def get_keyword_task(self, task_id: str) -> KeywordTask | None:
        stmt = select(KeywordTask).where(KeywordTask.task_id == task_id)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def update_keyword_task(self, task: KeywordTask):
        self.session.add(task)
        await self.session.commit()

    async def get_latest_keyword_task(self, store_id: int) -> KeywordTask | None:
        stmt = select(KeywordTask).where(KeywordTask.store_id == store_id).order_by(KeywordTask.created_at.desc()) # type: ignore
        result = await self.session.execute(stmt)
        return result.scalars().first()

    # --- Tracking ---
    async def get_tracked_keyword(self, store_id: int, keyword: str):
        stmt = select(TrackedKeyword).where(TrackedKeyword.store_id == store_id, TrackedKeyword.keyword == keyword)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def get_tracked_keyword_by_id(self, track_id: int) -> TrackedKeyword | None:
        return await self.session.get(TrackedKeyword, track_id)

    async def create_tracked_keyword(self, track: TrackedKeyword):
        self.session.add(track)
        await self.session.commit()
        await self.session.refresh(track)
        return track

    async def create_rank_history(self, history: KeywordRankHistory):
        self.session.add(history)
        await self.session.commit()

    async def get_all_tracked_keywords_with_histories(self, store_id: int):
        stmt = (
            select(TrackedKeyword)
            .where(TrackedKeyword.store_id == store_id)
            .options(selectinload(TrackedKeyword.histories))
            .order_by(desc(TrackedKeyword.created_at))
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_tracked_keywords_by_ids(self, store_id: int, track_ids: list[int]):
        stmt = select(TrackedKeyword).where(
            TrackedKeyword.store_id == store_id, 
            TrackedKeyword.id.in_(track_ids)
        ).options(selectinload(TrackedKeyword.histories))
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def delete_tracked_keyword(self, track: TrackedKeyword):
        await self.session.delete(track)
        await self.session.commit()
