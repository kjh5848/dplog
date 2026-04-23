from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from typing import List

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

# 1. 공통 속성 모델 (Base)
class StoreBase(SQLModel):
    name: str = Field(index=True, max_length=200)
    category: str = Field(max_length=100)
    address: str = Field(max_length=500)
    placeUrl: Optional[str] = Field(default=None, max_length=2000)
    phone: Optional[str] = Field(default=None, max_length=50)
    shopImageUrl: Optional[str] = Field(default=None, max_length=5000)
    shopImageThumbUrl: Optional[str] = Field(default=None, max_length=5000)
    keywords: Optional[str] = Field(default=None, max_length=2000)
    
    # 지표 데이터 (딥 스크래핑 결과)
    visitor_reviews: int = Field(default=0)
    blog_reviews: int = Field(default=0)
    saves: int = Field(default=0)
    rating: float = Field(default=0.0)
    
    # 엣지 런타임 백그라운드 스크래핑 상태 관리 (PENDING, COMPLETED, FAILED)
    scrape_status: str = Field(default="PENDING", max_length=20)

# 2. 리뷰 데이터베이스 테이블 (Store 자식 구조)
class StoreReviewTag(SQLModel, table=True):
    __tablename__ = "store_review_tag" # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    store_id: int = Field(foreign_key="store.id", index=True)
    category: str = Field(max_length=50) # '메뉴', '특징', '인기 키워드' 등
    name: str = Field(max_length=100) # 태그명
    count: int = Field(default=0) # 언급 횟수
    
    store: Optional["Store"] = Relationship(back_populates="review_tags")

class StoreRecentReview(SQLModel, table=True):
    __tablename__ = "store_recent_review" # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    store_id: int = Field(foreign_key="store.id", index=True)
    snippet: str # 리뷰 본문 텍스트
    
    store: Optional["Store"] = Relationship(back_populates="recent_reviews")

class StoreMenu(SQLModel, table=True):
    __tablename__ = "store_menu" # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    store_id: int = Field(foreign_key="store.id", index=True)
    name: str = Field(max_length=200) # 메뉴명
    price: str = Field(default="", max_length=100) # 표시 가격 텍스트 (예: "15,000원")
    description: Optional[str] = Field(default=None, max_length=1000) # 메뉴 설명
    imgUrl: Optional[str] = Field(default=None, max_length=2000) # 메뉴 사진
    is_representative: bool = Field(default=False) # 대표메뉴 여부
    
    store: Optional["Store"] = Relationship(back_populates="menus")

# 2. 데이터베이스 테이블 (Table)
class Store(StoreBase, table=True):
    __tablename__ = "store" # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    createdAt: datetime = Field(default_factory=get_utc_now)
    updatedAt: datetime = Field(default_factory=get_utc_now)
    
    # Relationships
    review_tags: List[StoreReviewTag] = Relationship(back_populates="store", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})
    recent_reviews: List[StoreRecentReview] = Relationship(back_populates="store", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})
    menus: List[StoreMenu] = Relationship(back_populates="store", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})
    tracked_keywords: List["TrackedKeyword"] = Relationship(back_populates="store", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})

# 3. HTTP 요청(Request) DTO 스키마
class StoreCreateRequest(StoreBase):
    pass

class StoreUpdateRequest(SQLModel):
    name: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    placeUrl: Optional[str] = None
    phone: Optional[str] = None

class StoreDetailResponse(StoreBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    review_tags: List[StoreReviewTag] = []
    recent_reviews: List[StoreRecentReview] = []
    menus: List[StoreMenu] = []

class StorePublic(StoreBase):
    id: int
    createdAt: datetime
    updatedAt: datetime

# 4. 황금키워드 모듈용 비동기 태스크 모델
class KeywordTask(SQLModel, table=True):
    __tablename__ = "keyword_task" # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: str = Field(index=True, max_length=100) # UUID 문자열
    store_id: int = Field(index=True)
    seed_keyword: str = Field(max_length=100)
    status: str = Field(default="PENDING", max_length=20) # PENDING, IN_PROGRESS, COMPLETED, FAILED
    result_data: Optional[str] = Field(default=None) # JSON 직렬화된 발굴 결과 데이터
    created_at: datetime = Field(default_factory=get_utc_now)
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

# 라이선스 폐기(Burn) 블랙리스트 관리
class BlacklistedLicense(SQLModel, table=True):
    __tablename__ = "blacklisted_license" # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    license_id: str = Field(index=True, unique=True, max_length=100) # 폐기된 입장코드의 고유 ID
    burned_at: datetime = Field(default_factory=get_utc_now) # 가게 폭파 시각

# 5. 순위 추적 (Tracking) 관련 모델
class TrackedKeyword(SQLModel, table=True):
    __tablename__ = "tracked_keyword" # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    store_id: int = Field(foreign_key="store.id", index=True)
    keyword: str = Field(index=True, max_length=100)
    province: str = Field(default="서울", max_length=50) # 지역
    businessSector: str = Field(default="", max_length=100) # 업종
    created_at: datetime = Field(default_factory=get_utc_now)
    
    # Relationships
    store: Optional["Store"] = Relationship(back_populates="tracked_keywords")
    histories: List["KeywordRankHistory"] = Relationship(back_populates="tracked_keyword", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class KeywordRankHistory(SQLModel, table=True):
    __tablename__ = "keyword_rank_history" # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    tracked_keyword_id: int = Field(foreign_key="tracked_keyword.id", index=True)
    
    rank: int = Field(default=0) # 노출 순위 (0이면 미노출)
    visitor_review_count: str = Field(default="0", max_length=50)
    blog_review_count: str = Field(default="0", max_length=50)
    score_info: str = Field(default="", max_length=50) # 예: 4.5
    save_count: str = Field(default="0", max_length=50)
    total_count: int = Field(default=0) # 총 노출되는 검색 결과 수
    
    checked_at: datetime = Field(default_factory=get_utc_now)
    
    tracked_keyword: Optional[TrackedKeyword] = Relationship(back_populates="histories")

# 5-1. 순위 추적 DTO
class TrackRequest(SQLModel):
    keyword: str
    province: str

class TrackInfoResponse(SQLModel):
    id: int
    keyword: str
    province: str
    businessSector: str
    shopId: str
    rankChange: int

class ChartRequest(SQLModel):
    trackInfoIds: List[int]
    startDate: Optional[str] = None
    interval: Optional[str] = "daily" # "daily" | "hourly"
