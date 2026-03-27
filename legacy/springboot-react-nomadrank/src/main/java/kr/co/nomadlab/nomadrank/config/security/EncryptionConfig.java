package kr.co.nomadlab.nomadrank.config.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableConfigurationProperties(EncryptionProperties.class)
public class EncryptionConfig {

    @Bean
    public EncryptionService encryptionService(EncryptionProperties props) {
        Map<String, TextEncryptor> map = new HashMap<>();
        props.getKeys().forEach((keyId, k) -> {
            // Spring Security Crypto의 PBKDF2 기반 패스워드 유도 + AES 암호화
            map.put(keyId, Encryptors.text(k.getPassword(), k.getSaltHex()));
        });
        return new EncryptionService(props.getActiveKey(), map);
    }
}
