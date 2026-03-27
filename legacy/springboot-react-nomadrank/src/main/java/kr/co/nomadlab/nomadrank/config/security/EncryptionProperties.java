package kr.co.nomadlab.nomadrank.config.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.Map;

@Data
@ConfigurationProperties("encryption")
public class EncryptionProperties {
    private String activeKey;
    private Map<String, Key> keys = new HashMap<>();

    @Data
    public static class Key {
        private String password; // 환경 변수 등에서 주입
        private String saltHex;  // 16-32 헥사 문자열 권장
    }
}
