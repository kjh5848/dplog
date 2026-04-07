import sqlite3
import os
import json
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
    
    # 1-1. 스키마 마이그레이션 (동적 컬럼 추가)
    try: cursor.execute('ALTER TABLE target_stores ADD COLUMN visitor_reviews INTEGER DEFAULT 0')
    except: pass
    try: cursor.execute('ALTER TABLE target_stores ADD COLUMN blog_reviews INTEGER DEFAULT 0')
    except: pass
    try: cursor.execute('ALTER TABLE target_stores ADD COLUMN saves INTEGER DEFAULT 0')
    except: pass
    try: cursor.execute('ALTER TABLE target_stores ADD COLUMN rating REAL DEFAULT 0.0')
    except: pass
    try: cursor.execute("ALTER TABLE target_stores ADD COLUMN official_keywords TEXT DEFAULT '[]'")
    except: pass

    
    # 2. 추적할 키워드 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tracked_keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            store_id INTEGER,
            keyword TEXT NOT NULL,
            pc_vol INTEGER DEFAULT 0,
            mobile_vol INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            next_scrape_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_processing BOOLEAN DEFAULT 0,
            last_scraped_at TIMESTAMP,
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

    # 4. 전체 1~100위 랭크 스냅샷 (시간대별 타임머신)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS keyword_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword_id INTEGER,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ranking_data TEXT NOT NULL, -- JSON String
            FOREIGN KEY(keyword_id) REFERENCES tracked_keywords(id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()

def migrate_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # 1. 컬럼 검사 후 없으면 ALTER TABLE 추가
    try:
        cursor.execute("SELECT next_scrape_at FROM tracked_keywords LIMIT 1")
    except sqlite3.OperationalError:
        print("[DB Migration] tracked_keywords 테이블에 next_scrape_at 등 컬럼 추가 중...")
        cursor.execute("ALTER TABLE tracked_keywords ADD COLUMN next_scrape_at TIMESTAMP")
        cursor.execute("UPDATE tracked_keywords SET next_scrape_at = CURRENT_TIMESTAMP")
        cursor.execute("ALTER TABLE tracked_keywords ADD COLUMN is_processing BOOLEAN DEFAULT 0")
        cursor.execute("ALTER TABLE tracked_keywords ADD COLUMN last_scraped_at TIMESTAMP")
        
    # 2. 스냅샷 테이블 없으면 추가
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS keyword_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword_id INTEGER,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ranking_data TEXT NOT NULL,
            FOREIGN KEY(keyword_id) REFERENCES tracked_keywords(id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

# ---- CRUD Functions ----

def add_target_store(place_id: str, name: str, category: str = "", address: str = "", lat: float = 0.0, lon: float = 0.0, visitor_reviews: int = 0, blog_reviews: int = 0, saves: int = 0, rating: float = 0.0, official_keywords: list = None) -> int:
    if official_keywords is None:
        official_keywords = []

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO target_stores 
            (place_id, name, category, address, lat, lon, visitor_reviews, blog_reviews, saves, rating, official_keywords) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(place_id) DO UPDATE SET
            name=excluded.name,
            category=excluded.category,
            address=excluded.address,
            lat=excluded.lat,
            lon=excluded.lon,
            visitor_reviews=excluded.visitor_reviews,
            blog_reviews=excluded.blog_reviews,
            saves=excluded.saves,
            rating=excluded.rating,
            official_keywords=excluded.official_keywords
        ''', (place_id, name, category, address, lat, lon, visitor_reviews, blog_reviews, saves, rating, json.dumps(official_keywords, ensure_ascii=False)))
        conn.commit()
    except Exception as e:
        print(f"Store upsert error: {e}")
        # 의도적으로 에러를 다시 던져서 preview_server에 알려야 합니다.
        raise e
    
    # 마지막으로 방금 넣거나 업데이트한 row를 찾습니다.
    cursor.execute("SELECT id FROM target_stores WHERE place_id = ?", (place_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise Exception("Store creation failed in database (likely a schema issue).")
    return row[0]

def delete_target_store(store_id: int) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA foreign_keys = ON") # Ensure foreign key constraints are met
        cursor.execute("DELETE FROM target_stores WHERE id = ?", (store_id,))
        if cursor.rowcount > 0:
            conn.commit()
            return True
        return False
    except Exception as e:
        print(f"Store delete error: {e}")
        return False
    finally:
        conn.close()

def get_target_store(store_id: int):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM target_stores WHERE id = ?", (store_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        try: d['official_keywords'] = json.loads(d.get('official_keywords', '[]') or '[]')
        except: d['official_keywords'] = []
        return d
    return None

def get_all_target_stores():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM target_stores ORDER BY registered_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        d = dict(row)
        try:
            d['official_keywords'] = json.loads(d.get('official_keywords', '[]') or '[]')
        except:
            d['official_keywords'] = []
        results.append(d)
    return results

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

def delete_tracked_keyword(store_id: int, keyword: str) -> bool:
    """특정 상점의 추적 키워드를 삭제합니다. 연결된 스냅샷과 랭킹 기록도 삭제됩니다."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tracked_keywords WHERE store_id = ? AND keyword = ?", (store_id, keyword))
        conn.commit()
        return True
    except Exception as e:
        print(f"Keyword delete error: {e}")
        return False
    finally:
        conn.close()

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

# CRUD Functions for Scheduler
def checkout_keywords_for_scraping(limit: int = 15):
    """
    현재 시간 기준으로 스크래핑이 필요한 키워드들을 가져오면서 락(is_processing=1)을 겁니다.
    동시성 처리를 위해 즉각적으로 락을 잡고 리스트를 반환합니다.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    now = datetime.now()
    
    # is_processing이 0이고, next_scrape_at이 과거이거나 NULL인 항목들을 limit 수만큼 찾음
    cursor.execute('''
        SELECT id, keyword, store_id 
        FROM tracked_keywords 
        WHERE is_active = 1 
          AND is_processing = 0 
          AND (next_scrape_at IS NULL OR next_scrape_at <= CURRENT_TIMESTAMP)
        ORDER BY 
            CASE WHEN next_scrape_at IS NULL THEN 0 ELSE 1 END,
            next_scrape_at ASC
        LIMIT ?
    ''', (limit,))
    
    rows = cursor.fetchall()
    
    keyword_list = []
    if rows:
        ids_to_lock = [row['id'] for row in rows]
        placeholders = ','.join(['?'] * len(ids_to_lock))
        
        # 스레드가 가져가는 순간 바로 Lock을 겁니다
        cursor.execute(f"UPDATE tracked_keywords SET is_processing = 1 WHERE id IN ({placeholders})", ids_to_lock)
        conn.commit()
        
        for r in rows:
            # 타겟 상점에 대한 기본 정보를 함께 조회
            cursor.execute("SELECT name, place_id FROM target_stores WHERE id = ?", (r['store_id'],))
            store_row = cursor.fetchone()
            keyword_list.append({
                "keyword_id": r['id'],
                "store_id": r['store_id'],
                "keyword": r['keyword'],
                "target_store_name": store_row['name'] if store_row else None,
                "target_store_id": store_row['place_id'] if store_row else None
            })
            
    conn.close()
    return keyword_list

def complete_keyword_scrape(keyword_id: int, next_scrape_at: datetime):
    """
    키워드 수집 완료 후, is_processing 락을 풀고 다음 스케줄 시간을 지정합니다.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE tracked_keywords 
        SET is_processing = 0, 
            last_scraped_at = CURRENT_TIMESTAMP, 
            next_scrape_at = ?
        WHERE id = ?
    ''', (next_scrape_at.strftime('%Y-%m-%d %H:%M:%S'), keyword_id))
    conn.commit()
    conn.close()

def unlock_keyword(keyword_id: int, delay_minutes: int = 0):
    """
    에러 등의 이유로 스크랩이 중단된 경우 다시 큐로 돌려놓기 위해 락을 해제합니다.
    (의도치 않게 물려있는 경우 대비)
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if delay_minutes > 0:
        next_scrape_str = (datetime.now() + timedelta(minutes=delay_minutes)).strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("UPDATE tracked_keywords SET is_processing = 0, next_scrape_at = ? WHERE id = ?", (next_scrape_str, keyword_id))
    else:
        cursor.execute("UPDATE tracked_keywords SET is_processing = 0 WHERE id = ?", (keyword_id,))
    conn.commit()
    conn.close()

def get_latest_snapshot(keyword_id: int):
    """
    해당 키워드의 가장 최신 병렬 수집 JSON 스냅샷 데이터를 파싱하여 반환합니다.
    없으면 None 반환
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT ranking_data, scraped_at FROM keyword_snapshots WHERE keyword_id = ? ORDER BY scraped_at DESC LIMIT 1", (keyword_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        import json
        return {
            "scraped_at": row["scraped_at"],
            "payload": json.loads(row["ranking_data"])
        }
    return None

def log_keyword_snapshot(keyword_id: int, snapshot_json: str):
    """
    수집된 1~100위 전체 배열 텍스트 데이터를 통째로 스냅샷으로 저장합니다.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO keyword_snapshots (keyword_id, ranking_data) 
        VALUES (?, ?)
    ''', (keyword_id, snapshot_json))
    conn.commit()
    conn.close()

# DB 초기화 수행
if not os.path.exists(DB_PATH):
    init_db()

# 기존 레거시도 안전하게 마이그레이션 적용
migrate_db()
