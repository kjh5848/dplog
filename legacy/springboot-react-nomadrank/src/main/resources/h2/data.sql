INSERT INTO `DISTRIBUTOR` (`email`, `account_number`, `deposit`, `bank_name`, `memo`, `create_date`, `update_date`,
                           `delete_date`, google_sheet_url)
VALUES ('admin@a.co.kr', '123-1234-12345', '홍길동', '부산은행', NULL, '2024-08-23 00:00:00',
        '2024-08-23 00:00:00', '2024-08-23 00:00:00', 'https://docs.google.com/spreadsheets/d/1JPG1z3eJMl1i7PjigaKxNojrpTTLNGlEsroWqZO9bkM'),
       ('distributor@d.co.kr', '567-5432-98765', '김철수', '카카오뱅크', NULL, '2024-08-23 00:00:00',
        '2024-08-23 00:00:00', '2024-08-23 00:00:00', 'https://docs.google.com/spreadsheets/d/1JPG1z3eJMl1i7PjigaKxNojrpTTLNGlEsroWqZO9bkM');

INSERT INTO `USER` (`username`, `password`, `company_name`, `company_number`, `tel`, `balance`, `expire_date`, `create_date`, `update_date`,
                    `delete_date`, `status`, `distributor_id`)
VALUES ('user1', '$2a$10$qLwDwdzJiy4wEsgFu8ls1.dNHujs0EzSSk3dzhIM5h94/UlL83hJC', 'Company A', '1231212345',
        '123-456-7890', 0, '9999-04-26 00:00:00', '2024-04-26 00:00:00', '2024-04-26 00:00:00', NULL, 'COMPLETION', 1),
       ('user2', '$2a$10$qLwDwdzJiy4wEsgFu8ls1.dNHujs0EzSSk3dzhIM5h94/UlL83hJC', 'Company B', '1231212346',
        '987-654-3210', 0, '9999-04-26 00:00:00', '2024-04-26 00:00:00', '2024-04-26 00:00:00', NULL, 'COMPLETION', 2),
        ('user3', '$2a$10$qLwDwdzJiy4wEsgFu8ls1.dNHujs0EzSSk3dzhIM5h94/UlL83hJC', 'Company C', '1231212347',
        '987-654-3210', 0, '9999-04-26 00:00:00', '2024-04-26 00:00:00', '2024-04-26 00:00:00', NULL, 'COMPLETION', 2),
       -- payment 테스트 전용 계정 (username: paytester / password: PayTest!234)
       ('paytester', '$2a$10$qLwDwdzJiy4wEsgFu8ls1.dNHujs0EzSSk3dzhIM5h94/UlL83hJC', 'Nomad Test Lab', '5555512345',
        '010-9911-2233', 0, '9999-12-31 00:00:00', '2024-04-26 00:00:00', '2024-04-26 00:00:00', NULL, 'COMPLETION', 1);

INSERT INTO `USER_AUTHORITY` (`user_id`, `authority`)
VALUES (1, 'ADMIN'),
       (2, 'DISTRIBUTOR_MANAGER'),
       (3, 'USER'),
       (4, 'USER');

-- INSERT INTO `PRODUCT` (`distributor_id`, `price`, `quantity`, `product_sort`, `create_date`, `update_date`, `delete_date`)
-- VALUES (2, 30, 500,'NPLACE_CAMPAIGN_TRAFFIC', now(), now(), NULL),
--        (2, 25, NULL,'NPLACE_CAMPAIGN_TRAFFIC', now(), now(), NULL),
--        (2, 500, NULL,'NPLACE_RANK', now(), now(), NULL);


INSERT INTO `NPLACE_CAMPAIGN_TRAFFIC_SHOP` (`user_id`, `address`, `blog_review_count`, `category`, `road_address`,
                                            `score_info`, `shop_id`, `shop_image_url`, `shop_name`, `visitor_review_count`,
                                            `create_date`, `update_date`)
VALUES (1, '후암동 123-11', '1,112', '베이커리', '서울 용산구 한강대로102길 57 홍철책빵',
        '4.55', '1203311506', 'https://ldb-phinf.pstatic.net/20240104_31/17043760200205mG03_JPEG/%C8%AB%C3%B6%C3%A5%BB%A7%B7%CE%B0%ED_%BF%E4%B8%AE%BB%E7.jpg', '홍철책빵', '386',
        '2024-04-26 00:00:00', '2024-04-26 00:00:00');

INSERT INTO `NPLACE_CAMPAIGN_TRAFFIC_KEYWORD` (`nplace_campaign_traffic_shop_id`, `keyword`,
                                               `create_date`, `update_date`)
VALUES (1, '테스트키워드', now(), now());

-- INSERT INTO NPLACE_CAMPAIGN_TRAFFIC_REGISTER (GOAL, CREATE_DATE, ID, UPDATE_DATE, END_DATE, SEARCH, SHOP_NAME, START_DATE, URL)
-- VALUES (500, now(), 1, now(), '2024-09-26', 'test112312', '홍철책빵', '2024-09-25', 'https://map.naver.com/p/entry/place/1');

INSERT INTO `NPLACE_RANK_SHOP` (`user_id`, `shop_id`, `shop_name`, `shop_image_url`, `category`, `address`,
                                `road_address`, `visitor_review_count`, `blog_review_count`, `score_info`, `create_date`, `update_date`)
VALUES (1, '1203311506', '홍철책빵', 'https://ldb-phinf.pstatic.net/20240104_31/17043760200205mG03_JPEG/%C8%AB%C3%B6%C3%A5%BB%A7%B7%CE%B0%ED_%BF%E4%B8%AE%BB%E7.jpg', '베이커리', '후암동 123-11',
        '서울 용산구 한강대로102길 57 홍철책빵', '395', '1,129', '4.55', now(), now());

INSERT INTO `NPLACE_RANK_SHOP_TRACK_INFO` (`id`, `nplace_rank_shop_id`, `nomadscrap_nplace_rank_track_info_id`, `nplace_rank_shop_track_info_status`, `create_date`)
VALUES (1, 1, 3, 'RUNNING', now());

INSERT INTO `POINT_CHARGE` (`user_id`, `amount`, `balance`, `status`, `create_date`, `update_date`)
VALUES (2, '10000', '10000', 'CONFIRM', now(), now());
