package kr.co.nomadlab.nomadrank;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoderTest {
    
    @Test
    public void generateBCryptPasswordAndSQL() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // 비밀번호 암호화 - 매번 다른 salt로 새로운 값 생성됨
        String rawPassword = "wngur5848";
        String encodedPassword = encoder.encode(rawPassword);
        
        System.out.println("==============================================");
        System.out.println("원본 비밀번호: " + rawPassword);
        System.out.println("암호화된 비밀번호: " + encodedPassword);
        System.out.println("==============================================");
        
        // 다음 사용 가능한 ID 찾기 (실제로는 DB에서 MAX(id)+1을 조회해야 함)
        Long userId = 30L;
        
        // 1. USER 테이블 INSERT
        String userInsertSQL = String.format("""
            -- 1. USER 테이블에 새 사용자 추가
            INSERT INTO nesoone_dev_v2.`USER`
            (id, username, password, company_name, name, tel, expire_date, create_date, update_date, delete_date, balance, status, distributor_id, company_number, last_login_date, birth_date, email, gender)
            VALUES(
                %d,
                'kjuh5848',
                '%s',
                '테스트회사',
                '김주혁',
                '01027052184',
                '9999-12-31 00:00:00',
                NOW(),
                NOW(),
                NULL,
                0,
                'COMPLETION',
                7,
                '1234567890',
                NULL,
                '1990-01-01',
                'kjuh5848@example.com',
                'M'
            );
            """, userId, encodedPassword);
        
        // 2. USER_AUTHORITY 테이블 INSERT (기본 권한: USER)
        String userAuthoritySQL = String.format("""
            
            -- 2. USER_AUTHORITY 테이블에 권한 추가 (기본: USER 권한)
            INSERT INTO nesoone_dev_v2.USER_AUTHORITY
            (user_id, authority)
            VALUES(%d, 'USER');
            """, userId);
        
        // 3. 관리자 권한 추가 (필요한 경우)
        String adminAuthoritySQL = String.format("""
            
            -- 3. 관리자 권한 추가 (필요한 경우 주석 해제)
            -- INSERT INTO nesoone_dev_v2.USER_AUTHORITY
            -- (user_id, authority)
            -- VALUES(%d, 'ADMIN');
            """, userId);
        
        System.out.println("\n===== 생성된 SQL 쿼리 =====");
        System.out.println(userInsertSQL);
        System.out.println(userAuthoritySQL);
        System.out.println(adminAuthoritySQL);
        
        // 비밀번호 검증 테스트
        boolean matches = encoder.matches(rawPassword, encodedPassword);
        System.out.println("\n비밀번호 검증: " + (matches ? "성공" : "실패"));
    }
    
    @Test
    public void testPasswordUpdate() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String newPassword = "wngur5848";
        String encodedPassword = encoder.encode(newPassword);
        
        // UPDATE 쿼리
        String updateQuery = String.format("""
            -- 비밀번호 업데이트 쿼리
            UPDATE nesoone_dev_v2.`USER`
            SET password = '%s',
                update_date = NOW()
            WHERE username = 'kjuh5848';
            """, encodedPassword);
        
        System.out.println("\n===== UPDATE 쿼리 =====");
        System.out.println(updateQuery);
    }
    
    @Test
    public void generateCompleteUserSetupSQL() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String rawPassword = "wngur5848";
        String encodedPassword = encoder.encode(rawPassword);
        Long userId = 30L;
        
        System.out.println("\n===== 전체 사용자 설정 SQL (트랜잭션 포함) =====");
        System.out.println("-- 트랜잭션 시작\n" +
            "START TRANSACTION;\n\n" +
            "-- 기존 데이터 확인 및 삭제 (필요시)\n" +
            "DELETE FROM nesoone_dev_v2.USER_AUTHORITY WHERE user_id = " + userId + ";\n" +
            "DELETE FROM nesoone_dev_v2.`USER` WHERE id = " + userId + " OR username = 'kjuh5848';\n");
        
        System.out.println(String.format("""
            -- USER 테이블에 새 사용자 추가
            INSERT INTO nesoone_dev_v2.`USER`
            (id, username, password, company_name, name, tel, expire_date, create_date, update_date, delete_date, balance, status, distributor_id, company_number, last_login_date, birth_date, email, gender)
            VALUES(
                %d,
                'kjuh5848',
                '%s',
                '테스트회사',
                '김주혁',
                '01027052184',
                '9999-12-31 00:00:00',
                NOW(),
                NOW(),
                NULL,
                0,
                'COMPLETION',
                7,
                '1234567890',
                NULL,
                '1990-01-01',
                'kjuh5848@example.com',
                'M'
            );
            
            -- USER_AUTHORITY 테이블에 권한 추가
            INSERT INTO nesoone_dev_v2.USER_AUTHORITY
            (user_id, authority)
            VALUES(%d, 'USER');
            
            -- 트랜잭션 커밋
            COMMIT;
            
            -- 생성된 데이터 확인
            SELECT u.*, ua.authority 
            FROM nesoone_dev_v2.`USER` u
            LEFT JOIN nesoone_dev_v2.USER_AUTHORITY ua ON u.id = ua.user_id
            WHERE u.username = 'kjuh5848';
            """, userId, encodedPassword, userId));
    }
    
    @Test
    public void verifyPasswordMatching() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // 여러 비밀번호 테스트
        String[] testPasswords = {
            "wngur5848",
            "주혁5848",
            "juhyuk5848"
        };
        
        System.out.println("\n===== 비밀번호 매칭 테스트 =====");
        for (String password : testPasswords) {
            String encoded = encoder.encode(password);
            boolean matches = encoder.matches(password, encoded);
            
            System.out.println("원본: " + password);
            System.out.println("암호화: " + encoded);
            System.out.println("매칭 결과: " + (matches ? "✓ 성공" : "✗ 실패"));
            System.out.println("---");
        }
    }

    @Test
    public void generateOnlyPasswordHash() {
        // BCryptPasswordEncoder는 내부적으로 랜덤 salt를 생성하며,
        // 호출할 때마다 다른 결과가 나옵니다 :contentReference[oaicite:0]{index=0}
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // 해시화할 원본 비밀번호
        String rawPassword = "wngur5848";
        
        // bcrypt 해시 생성
        String encodedPassword = encoder.encode(rawPassword);
        
        // 결과 출력
        System.out.println("원본 비밀번호: " + rawPassword);
        System.out.println("bcrypt 해시값: " + encodedPassword);
        
        // 검증 테스트 (해시가 원본과 매칭되는지 확인)
        boolean matches = encoder.matches(rawPassword, encodedPassword);
        System.out.println("검증 결과 (matches): " + matches);
    }
}