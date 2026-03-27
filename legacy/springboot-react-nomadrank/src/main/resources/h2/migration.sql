-- USER 테이블 마이그레이션 스크립트
-- 누락된 컬럼들을 추가하는 SQL

-- 1. 사용자 실명 컬럼 추가
ALTER TABLE `USER` ADD COLUMN `name` VARCHAR(100) COMMENT '사용자 실명';

-- 2. 성별 컬럼 추가
ALTER TABLE `USER` ADD COLUMN `gender` VARCHAR(10) COMMENT '성별 (male/female)';

-- 3. 생년월일 컬럼 추가
ALTER TABLE `USER` ADD COLUMN `birth_date` DATE COMMENT '생년월일';

-- 4. 기존 컬럼들의 주석 업데이트 (선택사항)
-- username 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '사용자 아이디';

-- email 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `email` VARCHAR(255) UNIQUE COMMENT '이메일 주소';

-- password 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `password` VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호';

-- company_name 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `company_name` VARCHAR(200) COMMENT '업체명';

-- company_number 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `company_number` VARCHAR(10) COMMENT '사업자등록번호';

-- tel 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `tel` VARCHAR(20) COMMENT '전화번호';

-- balance 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `balance` INT NOT NULL DEFAULT 0 COMMENT '포인트 잔액';

-- status 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `status` VARCHAR(20) DEFAULT 'COMPLETION' COMMENT '사용자 상태 (COMPLETION:승인, WAITING:대기, STOP:중지, WITHDRAW:탈퇴)';

-- expire_date 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `expire_date` DATETIME NOT NULL COMMENT '계정 만료일';

-- create_date 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `create_date` DATETIME NOT NULL COMMENT '계정 생성일';

-- update_date 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `update_date` DATETIME COMMENT '계정 수정일';

-- delete_date 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `delete_date` DATETIME COMMENT '계정 삭제일 (소프트 삭제용)';

-- last_login_date 컬럼 주석 업데이트
ALTER TABLE `USER` MODIFY COLUMN `last_login_date` DATETIME COMMENT '마지막 로그인일';

-- CHARGE(구 PAYMENT_HISTORY) payment_type 컬럼을 확장하여 UPGRADE 타입을 지원
ALTER TABLE `CHARGE`
    MODIFY COLUMN `payment_type` VARCHAR(20);

-- MEMBERSHIP_USER 종료일을 NULL 허용으로 변경 (무제한 멤버십 지원)
ALTER TABLE `MEMBERSHIP_USER`
    MODIFY COLUMN `end_date` DATE NULL COMMENT '멤버십 종료일 (NULL=무제한)';

-- SUBSCRIPTIONS 테이블에 해지 예약일 컬럼 추가
ALTER TABLE `SUBSCRIPTIONS`
    ADD COLUMN `cancel_scheduled_at` DATE NULL COMMENT '구독 해지 예정일';

-- USE_LOG 서비스 구분 컬럼 길이 확장 (새로운 ServiceSort 대응)
ALTER TABLE `USE_LOG`
    MODIFY COLUMN `service_sort` VARCHAR(50) NOT NULL COMMENT '사용 서비스 구분';
