-- =========================================
-- Seed data for development environment
-- JPA ddl-auto: create compatible
-- =========================================

-- 1) DISTRIBUTOR
INSERT INTO DISTRIBUTOR (
    email,
    account_number,
    deposit,
    bank_name,
    google_sheet_url,
    google_credential_json,
    memo,
    create_date,
    update_date
) VALUES (
    'admin-distributor@example.com',
    '000-000-000000',
    '관리자',
    'BankName',
    NULL,
    NULL,
    'seed distributor',
    NOW(),
    NOW()
);

-- 2) USER (admin account)
INSERT INTO USER (
    username,
    password,
    name,
    email,
    company_name,
    company_number,
    tel,
    balance,
    expire_date,
    create_date,
    update_date,
    delete_date,
    status,
    distributor_id
) VALUES (
    'tadmin',
    '$2a$12$cvKzAM7bFyCyVrZL4cNpUewnJS0w1sIPA6DCZ647LMfXvVUZLKt4.', -- bcrypt('tqwe123')
    '관리자',
    'tadmin@example.com',
    'Nomad Admin',
    '0000000000',
    '010-0000-0000',
    0,
    '9999-12-31 00:00:00',
    NOW(),
    NOW(),
    NULL,
    'COMPLETION',
    1
);

-- 2-2) USER (test account)
INSERT INTO USER (
    username,
    password,
    company_name,
    company_number,
    tel,
    balance,
    expire_date,
    create_date,
    update_date,
    delete_date,
    status,
    distributor_id
) VALUES (
    'kjh5848',
    '$2a$10$3w67P7q2lyQUjZ440H2AWeWVEhUr6IjnVizVqLF3nWKQJw5KHMfI6', -- bcrypt(1234)
    'Nomad Test Lab',
    '5555512345',
    '010-9911-2233',
    0,
    '9999-12-31 00:00:00',
    NOW(),
    NOW(),
    NULL,
    'COMPLETION',
    (SELECT d.id FROM DISTRIBUTOR d WHERE d.email = 'admin-distributor@example.com' LIMIT 1)
);

-- 2-3) USER_AUTHORITY (test account)
INSERT INTO USER_AUTHORITY (
    user_id,
    authority
)
SELECT
    u.id,
    'USER'
FROM USER u
WHERE u.username = 'kjh5848';

-- 3) USER_AUTHORITY
-- user_id는 바로 위에서 생성된 admin USER의 ID를 참조해야 함
INSERT INTO USER_AUTHORITY (
    user_id,
    authority
)
SELECT
    u.id,
    'ADMIN'
FROM USER u
WHERE u.username = 'tadmin';
