import sqlite3
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "dplog_observer.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. 내 상점 테이블 (타겟 지정용)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS target_stores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_id TEXT UNIQUE,
            name TEXT NOT NULL,
            category TEXT,
            address TEXT,
            lat REAL,
            lon REAL,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 2. 추적할 키워드 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tracked_keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            store_id INTEGER,
            keyword TEXT NOT NULL,
            pc_vol INTEGER DEFAULT 0,
            mobile_vol INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(store_id) REFERENCES target_stores(id) ON DELETE CASCADE,
            UNIQUE(store_id, keyword)
        )
    ''')
    
    # 3. 시간대별 랭킹 히스토리
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rank_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword_id INTEGER,
            rank INTEGER,  -- 0이면 노출 안됨
            is_ad BOOLEAN DEFAULT 0,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(keyword_id) REFERENCES tracked_keywords(id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()

# ---- CRUD Functions ----

def add_target_store(place_id: str, name: str, category: str = "", address: str = "", lat: float = 0.0, lon: float = 0.0) -> int:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO target_stores (place_id, name, category, address, lat, lon) VALUES (?, ?, ?, ?, ?, ?)", (place_id, name, category, address, lat, lon))
        store_id = cursor.lastrowid
        conn.commit()
    except sqlite3.IntegrityError:
        cursor.execute("SELECT id FROM target_stores WHERE place_id = ?", (place_id,))
        store_id = cursor.fetchone()[0]
    finally:
        conn.close()
    return store_id

def get_all_target_stores():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM target_stores ORDER BY registered_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_tracked_keyword(store_id: int, keyword: str) -> int:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO tracked_keywords (store_id, keyword) VALUES (?, ?)", (store_id, keyword))
        kw_id = cursor.lastrowid
        conn.commit()
    except sqlite3.IntegrityError:
        cursor.execute("SELECT id FROM tracked_keywords WHERE store_id = ? AND keyword = ?", (store_id, keyword))
        kw_id = cursor.fetchone()[0]
    finally:
        conn.close()
    return kw_id

def log_rank(keyword_id: int, rank: int, is_ad: bool):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO rank_history (keyword_id, rank, is_ad) VALUES (?, ?, ?)", (keyword_id, rank, is_ad))
    conn.commit()
    conn.close()

def get_rank_history(store_id: int):
    """특정 상점의 키워드별 순위 타임라인을 조회합니다."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 조인해서 키워드 이름과 순위, 스크랩 타임을 가져옴 (추적 중이지만 아직 스크랩 결과가 없는 키워드도 포함하도록 LEFT JOIN)
    cursor.execute('''
        SELECT k.keyword, r.rank, r.is_ad, r.scraped_at
        FROM tracked_keywords k
        LEFT JOIN rank_history r ON k.id = r.keyword_id
        WHERE k.store_id = ?
        ORDER BY k.keyword ASC, r.scraped_at ASC
    ''', (store_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    # 데이터를 프론트엔드가 차트 그리기에 편하도록 { "keyword": [ { time, rank, is_ad } ] } 형태로 변환
    history_dict = {}
    for row in rows:
        kw = row['keyword']
        if kw not in history_dict:
            history_dict[kw] = []
            
        if row['scraped_at'] is not None:
            history_dict[kw].append({
                "scraped_at": row['scraped_at'],
                "rank": row['rank'],
                "is_ad": bool(row['is_ad'])
            })
    
    return history_dict

# DB 초기화 수행
if not os.path.exists(DB_PATH):
    init_db()
