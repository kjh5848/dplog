-- Plan 데이터를 Membership으로 마이그레이션하는 SQL 스크립트
-- Plan 시스템을 완전히 제거하고 Membership으로 통합

-- 백업 테이블 생성 (롤백용)
CREATE TABLE IF NOT EXISTS nesoone_dev_v2.MEMBERSHIP_BACKUP AS SELECT * FROM nesoone_dev_v2.MEMBERSHIP;
CREATE TABLE IF NOT EXISTS nesoone_dev_v2.MEMBERSHIP_DETAIL_BACKUP AS SELECT * FROM nesoone_dev_v2.MEMBERSHIP_DETAIL;

-- 트랜잭션 시작
START TRANSACTION;

-- 1. Plan 테이블 존재 여부 확인 및 데이터 존재 확인
-- Plan 테이블이 없으면 스크립트 종료
SET @plan_count = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'nesoone_dev_v2' AND table_name = 'PLAN');
SELECT CASE 
    WHEN @plan_count = 0 THEN 'Plan 테이블이 존재하지 않습니다. 마이그레이션을 건너뜁니다.'
    ELSE 'Plan 테이블 발견. 마이그레이션을 시작합니다.'
END AS migration_status;

-- 2. MEMBERSHIP 테이블에 Plan 필드들 추가 (컬럼이 없는 경우에만)
SET @col_exists_price = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'nesoone_dev_v2' AND table_name = 'MEMBERSHIP' AND column_name = 'price');
SET @col_exists_description = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'nesoone_dev_v2' AND table_name = 'MEMBERSHIP' AND column_name = 'description');
SET @col_exists_is_popular = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'nesoone_dev_v2' AND table_name = 'MEMBERSHIP' AND column_name = 'is_popular');
SET @col_exists_color_scheme = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'nesoone_dev_v2' AND table_name = 'MEMBERSHIP' AND column_name = 'color_scheme');
SET @col_exists_sort_order = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'nesoone_dev_v2' AND table_name = 'MEMBERSHIP' AND column_name = 'sort_order');

-- 컬럼별로 개별 추가 (이미 존재하는 경우 무시)
SET @sql_price = CASE WHEN @col_exists_price = 0 THEN 'ALTER TABLE nesoone_dev_v2.MEMBERSHIP ADD COLUMN price DECIMAL(10,0) NOT NULL DEFAULT 0 COMMENT ''월 구독 가격'' AFTER point;' ELSE 'SELECT ''price 컬럼은 이미 존재합니다.'' AS status;' END;
PREPARE stmt_price FROM @sql_price;
EXECUTE stmt_price;
DEALLOCATE PREPARE stmt_price;

SET @sql_description = CASE WHEN @col_exists_description = 0 THEN 'ALTER TABLE nesoone_dev_v2.MEMBERSHIP ADD COLUMN description VARCHAR(500) COMMENT ''멤버십 설명 및 특징'' AFTER price;' ELSE 'SELECT ''description 컬럼은 이미 존재합니다.'' AS status;' END;
PREPARE stmt_description FROM @sql_description;
EXECUTE stmt_description;
DEALLOCATE PREPARE stmt_description;

SET @sql_is_popular = CASE WHEN @col_exists_is_popular = 0 THEN 'ALTER TABLE nesoone_dev_v2.MEMBERSHIP ADD COLUMN is_popular BOOLEAN DEFAULT FALSE COMMENT ''인기 멤버십 여부 (UI 배지 표시용)'' AFTER description;' ELSE 'SELECT ''is_popular 컬럼은 이미 존재합니다.'' AS status;' END;
PREPARE stmt_is_popular FROM @sql_is_popular;
EXECUTE stmt_is_popular;
DEALLOCATE PREPARE stmt_is_popular;

SET @sql_color_scheme = CASE WHEN @col_exists_color_scheme = 0 THEN 'ALTER TABLE nesoone_dev_v2.MEMBERSHIP ADD COLUMN color_scheme VARCHAR(50) COMMENT ''UI 색상 테마 (blue, purple, orange 등)'' AFTER is_popular;' ELSE 'SELECT ''color_scheme 컬럼은 이미 존재합니다.'' AS status;' END;
PREPARE stmt_color_scheme FROM @sql_color_scheme;
EXECUTE stmt_color_scheme;
DEALLOCATE PREPARE stmt_color_scheme;

SET @sql_sort_order = CASE WHEN @col_exists_sort_order = 0 THEN 'ALTER TABLE nesoone_dev_v2.MEMBERSHIP ADD COLUMN sort_order INT DEFAULT 0 COMMENT ''멤버십 표시 순서 (낮은 숫자 우선)'' AFTER color_scheme;' ELSE 'SELECT ''sort_order 컬럼은 이미 존재합니다.'' AS status;' END;
PREPARE stmt_sort_order FROM @sql_sort_order;
EXECUTE stmt_sort_order;
DEALLOCATE PREPARE stmt_sort_order;

-- 3. 인덱스 추가 (존재하지 않는 경우에만)
SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'nesoone_dev_v2' AND table_name = 'MEMBERSHIP' AND index_name = 'idx_membership_sort_order');
SET @sql_index = CASE WHEN @index_exists = 0 THEN 'ALTER TABLE nesoone_dev_v2.MEMBERSHIP ADD INDEX idx_membership_sort_order (sort_order);' ELSE 'SELECT ''인덱스는 이미 존재합니다.'' AS status;' END;
PREPARE stmt_index FROM @sql_index;
EXECUTE stmt_index;
DEALLOCATE PREPARE stmt_index;

-- 4. Plan 데이터를 MEMBERSHIP 테이블로 이동 (Plan 테이블이 존재하는 경우에만)
SET @plan_data_count = COALESCE((SELECT COUNT(*) FROM nesoone_dev_v2.PLAN WHERE delete_date IS NULL), 0);

SET @sql_migrate_plan = CASE 
    WHEN @plan_count > 0 AND @plan_data_count > 0 THEN 
        'INSERT INTO nesoone_dev_v2.MEMBERSHIP 
        (name, point, price, description, is_popular, color_scheme, sort_order, create_date, update_date, delete_date)
        SELECT 
            name,
            0 as point,
            price,
            description,
            is_popular,
            color_scheme,
            sort_order,
            create_date,
            update_date,
            delete_date
        FROM nesoone_dev_v2.PLAN 
        WHERE delete_date IS NULL
        AND name NOT IN (SELECT name FROM nesoone_dev_v2.MEMBERSHIP WHERE delete_date IS NULL);'
    ELSE 'SELECT ''Plan 데이터가 없거나 테이블이 존재하지 않습니다.'' AS status;'
END;
PREPARE stmt_migrate_plan FROM @sql_migrate_plan;
EXECUTE stmt_migrate_plan;
DEALLOCATE PREPARE stmt_migrate_plan;

-- 5. Plan Detail 데이터를 MEMBERSHIP_DETAIL 테이블로 이동
SET @plan_detail_count = COALESCE((SELECT COUNT(*) FROM nesoone_dev_v2.PLAN_DETAIL WHERE delete_date IS NULL), 0);

-- Plan Detail 데이터가 있는 경우에만 마이그레이션 실행
SET @sql_migrate_detail = CASE 
    WHEN @plan_count > 0 AND @plan_detail_count > 0 THEN 
        'INSERT INTO nesoone_dev_v2.MEMBERSHIP_DETAIL
        (membership_id, service_sort, limit_count, create_date, update_date, delete_date)
        SELECT 
            m.id as membership_id,
            pd.service_sort,
            pd.limit_count,
            pd.create_date,
            pd.update_date,
            pd.delete_date
        FROM nesoone_dev_v2.PLAN p
        JOIN nesoone_dev_v2.PLAN_DETAIL pd ON p.id = pd.plan_id
        JOIN nesoone_dev_v2.MEMBERSHIP m ON p.name = m.name
        WHERE p.delete_date IS NULL 
          AND pd.delete_date IS NULL 
          AND m.delete_date IS NULL;'
    ELSE 'SELECT ''Plan Detail 데이터가 없거나 테이블이 존재하지 않습니다.'' AS status;'
END;
PREPARE stmt_migrate_detail FROM @sql_migrate_detail;
EXECUTE stmt_migrate_detail;
DEALLOCATE PREPARE stmt_migrate_detail;

-- 6. Plan 테이블들 삭제 (존재하는 경우에만)
SET @sql_drop_plan_detail = CASE WHEN @plan_count > 0 THEN 'DROP TABLE IF EXISTS nesoone_dev_v2.PLAN_DETAIL;' ELSE 'SELECT ''PLAN_DETAIL 테이블이 존재하지 않습니다.'' AS status;' END;
PREPARE stmt_drop_plan_detail FROM @sql_drop_plan_detail;
EXECUTE stmt_drop_plan_detail;
DEALLOCATE PREPARE stmt_drop_plan_detail;

SET @sql_drop_plan = CASE WHEN @plan_count > 0 THEN 'DROP TABLE IF EXISTS nesoone_dev_v2.PLAN;' ELSE 'SELECT ''PLAN 테이블이 존재하지 않습니다.'' AS status;' END;
PREPARE stmt_drop_plan FROM @sql_drop_plan;
EXECUTE stmt_drop_plan;
DEALLOCATE PREPARE stmt_drop_plan;

-- 트랜잭션 커밋
COMMIT;

-- 마이그레이션 완료 메시지
SELECT '=== Plan → Membership 마이그레이션이 성공적으로 완료되었습니다! ===' AS result;

-- 마이그레이션 결과 확인
SELECT '=== 마이그레이션 결과 확인 ===' AS section;

-- 1. 업데이트된 MEMBERSHIP 테이블 구조 확인
SELECT 
    m.id,
    m.name,
    m.point,
    m.price,
    m.description,
    m.is_popular,
    m.color_scheme,
    m.sort_order,
    m.create_date
FROM nesoone_dev_v2.MEMBERSHIP m
WHERE m.delete_date IS NULL
ORDER BY m.sort_order ASC;

-- 2. 멤버십별 서비스 제한 확인
SELECT 
    m.name AS membership_name,
    md.service_sort,
    md.limit_count,
    CASE 
        WHEN md.limit_count IS NULL THEN '무제한'
        ELSE CONCAT(md.limit_count, '회')
    END AS limit_display
FROM nesoone_dev_v2.MEMBERSHIP m
LEFT JOIN nesoone_dev_v2.MEMBERSHIP_DETAIL md ON m.id = md.membership_id AND md.delete_date IS NULL
WHERE m.delete_date IS NULL
ORDER BY m.sort_order ASC, md.service_sort ASC;

-- 3. 마이그레이션 통계
SELECT 
    (SELECT COUNT(*) FROM nesoone_dev_v2.MEMBERSHIP WHERE delete_date IS NULL) AS total_memberships,
    (SELECT COUNT(*) FROM nesoone_dev_v2.MEMBERSHIP_DETAIL WHERE delete_date IS NULL) AS total_membership_details,
    (SELECT COUNT(*) FROM nesoone_dev_v2.MEMBERSHIP WHERE price > 0 AND delete_date IS NULL) AS paid_memberships,
    (SELECT COUNT(*) FROM nesoone_dev_v2.MEMBERSHIP WHERE is_popular = TRUE AND delete_date IS NULL) AS popular_memberships;

-- 4. Plan 테이블 삭제 확인
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'nesoone_dev_v2' AND table_name = 'PLAN') = 0 
        THEN 'PLAN 테이블이 성공적으로 삭제되었습니다.'
        ELSE 'PLAN 테이블이 아직 존재합니다.'
    END AS plan_table_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'nesoone_dev_v2' AND table_name = 'PLAN_DETAIL') = 0 
        THEN 'PLAN_DETAIL 테이블이 성공적으로 삭제되었습니다.'
        ELSE 'PLAN_DETAIL 테이블이 아직 존재합니다.'
    END AS plan_detail_table_status;

/*
=== 롤백 방법 (필요시) ===

만약 마이그레이션을 롤백해야 하는 경우 다음 쿼리를 실행하세요:

-- 1. 백업에서 원본 테이블 복원
DROP TABLE nesoone_dev_v2.MEMBERSHIP;
DROP TABLE nesoone_dev_v2.MEMBERSHIP_DETAIL;

CREATE TABLE nesoone_dev_v2.MEMBERSHIP AS SELECT * FROM nesoone_dev_v2.MEMBERSHIP_BACKUP;
CREATE TABLE nesoone_dev_v2.MEMBERSHIP_DETAIL AS SELECT * FROM nesoone_dev_v2.MEMBERSHIP_DETAIL_BACKUP;

-- 2. 기본키 및 인덱스 재생성
ALTER TABLE nesoone_dev_v2.MEMBERSHIP ADD PRIMARY KEY (id);
ALTER TABLE nesoone_dev_v2.MEMBERSHIP MODIFY id BIGINT AUTO_INCREMENT;

ALTER TABLE nesoone_dev_v2.MEMBERSHIP_DETAIL ADD PRIMARY KEY (id);
ALTER TABLE nesoone_dev_v2.MEMBERSHIP_DETAIL MODIFY id BIGINT AUTO_INCREMENT;
ALTER TABLE nesoone_dev_v2.MEMBERSHIP_DETAIL ADD FOREIGN KEY (membership_id) REFERENCES nesoone_dev_v2.MEMBERSHIP(id);

-- 3. 백업 테이블 정리
DROP TABLE nesoone_dev_v2.MEMBERSHIP_BACKUP;
DROP TABLE nesoone_dev_v2.MEMBERSHIP_DETAIL_BACKUP;

*/

-- 백업 테이블 정리 (성공한 경우)
SELECT '=== 백업 테이블 정리 (롤백이 필요하면 이 부분은 실행하지 마세요!) ===' AS cleanup_warning;
-- DROP TABLE IF EXISTS nesoone_dev_v2.MEMBERSHIP_BACKUP;
-- DROP TABLE IF EXISTS nesoone_dev_v2.MEMBERSHIP_DETAIL_BACKUP;