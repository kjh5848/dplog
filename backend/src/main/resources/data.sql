-- =============================================================================
-- D-PLOG 개발용 Mock 데이터 시드 (Phase 3)
-- 가게 1개 + 키워드 10개 + 30일치 순위 스냅샷
-- =============================================================================

-- 1. 가게 (테스트용, ownerId = 1 = dev 자동 로그인 사용자)
INSERT INTO stores (id, name, category, address, place_url, shop_image_url, owner_id, created_at, updated_at)
VALUES (1, '테스트 맛집', '한식', '서울시 강남구 테헤란로 123', 'https://map.naver.com/v5/entry/place/12345678', 'https://via.placeholder.com/300x200', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. 키워드 세트 (10개 키워드)
INSERT INTO keyword_sets (id, store_id, keywords, validation_info, created_at)
VALUES (1, 1, '강남맛집,신논현맛집,테헤란로맛집,강남역한식,점심맛집,직장인맛집,강남한정식,강남회식,서초맛집,역삼맛집',
        '{"originalCount":10,"finalCount":10,"removedDuplicates":0}', CURRENT_TIMESTAMP);

-- 3. 진단 요청 (완료 상태 1개)
INSERT INTO diagnosis_requests (id, store_id, member_id, keyword_set_id, status, job_key, created_at, started_at, finished_at)
VALUES (1, 1, 1, 1, 'SUCCESS', '1:mock-seed:20260304', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. 30일치 순위 스냅샷 + 순위 항목
-- Day 1 (오늘 기준 -29일)
INSERT INTO ranking_snapshots (id, diagnosis_request_id, store_id, captured_at)
VALUES (1, 1, 1, DATEADD('DAY', -29, CURRENT_TIMESTAMP));

INSERT INTO ranking_items (snapshot_id, keyword, rank, delta, search_volume) VALUES
(1, '강남맛집', 8, 0, 45000),
(1, '신논현맛집', 3, 0, 12000),
(1, '테헤란로맛집', 5, 0, 8500),
(1, '강남역한식', 12, 0, 6200),
(1, '점심맛집', 25, 0, 38000),
(1, '직장인맛집', 7, 0, 15000),
(1, '강남한정식', 2, 0, 4300),
(1, '강남회식', 15, 0, 9800),
(1, '서초맛집', 18, 0, 7600),
(1, '역삼맛집', 10, 0, 5100);

-- Day 7 (1주 전)
INSERT INTO ranking_snapshots (id, diagnosis_request_id, store_id, captured_at)
VALUES (2, 1, 1, DATEADD('DAY', -22, CURRENT_TIMESTAMP));

INSERT INTO ranking_items (snapshot_id, keyword, rank, delta, search_volume) VALUES
(2, '강남맛집', 6, 2, 45500),
(2, '신논현맛집', 2, 1, 12300),
(2, '테헤란로맛집', 4, 1, 8700),
(2, '강남역한식', 10, 2, 6400),
(2, '점심맛집', 22, 3, 38500),
(2, '직장인맛집', 5, 2, 15200),
(2, '강남한정식', 1, 1, 4500),
(2, '강남회식', 12, 3, 10000),
(2, '서초맛집', 15, 3, 7800),
(2, '역삼맛집', 8, 2, 5300);

-- Day 14 (2주 전)
INSERT INTO ranking_snapshots (id, diagnosis_request_id, store_id, captured_at)
VALUES (3, 1, 1, DATEADD('DAY', -15, CURRENT_TIMESTAMP));

INSERT INTO ranking_items (snapshot_id, keyword, rank, delta, search_volume) VALUES
(3, '강남맛집', 5, 1, 46000),
(3, '신논현맛집', 3, -1, 12100),
(3, '테헤란로맛집', 3, 1, 8900),
(3, '강남역한식', 8, 2, 6600),
(3, '점심맛집', 19, 3, 39000),
(3, '직장인맛집', 4, 1, 15500),
(3, '강남한정식', 1, 0, 4600),
(3, '강남회식', 10, 2, 10200),
(3, '서초맛집', 13, 2, 8000),
(3, '역삼맛집', 6, 2, 5500);

-- Day 21 (3주 전)
INSERT INTO ranking_snapshots (id, diagnosis_request_id, store_id, captured_at)
VALUES (4, 1, 1, DATEADD('DAY', -8, CURRENT_TIMESTAMP));

INSERT INTO ranking_items (snapshot_id, keyword, rank, delta, search_volume) VALUES
(4, '강남맛집', 4, 1, 46500),
(4, '신논현맛집', 2, 1, 12500),
(4, '테헤란로맛집', 2, 1, 9100),
(4, '강남역한식', 6, 2, 6800),
(4, '점심맛집', 15, 4, 39500),
(4, '직장인맛집', 3, 1, 15800),
(4, '강남한정식', 1, 0, 4700),
(4, '강남회식', 8, 2, 10500),
(4, '서초맛집', 11, 2, 8200),
(4, '역삼맛집', 5, 1, 5700);

-- Day 30 (오늘)
INSERT INTO ranking_snapshots (id, diagnosis_request_id, store_id, captured_at)
VALUES (5, 1, 1, CURRENT_TIMESTAMP);

INSERT INTO ranking_items (snapshot_id, keyword, rank, delta, search_volume) VALUES
(5, '강남맛집', 3, 1, 47000),
(5, '신논현맛집', 1, 1, 12800),
(5, '테헤란로맛집', 2, 0, 9300),
(5, '강남역한식', 5, 1, 7000),
(5, '점심맛집', 12, 3, 40000),
(5, '직장인맛집', 2, 1, 16000),
(5, '강남한정식', 1, 0, 4800),
(5, '강남회식', 6, 2, 10800),
(5, '서초맛집', 9, 2, 8400),
(5, '역삼맛집', 4, 1, 5900);
