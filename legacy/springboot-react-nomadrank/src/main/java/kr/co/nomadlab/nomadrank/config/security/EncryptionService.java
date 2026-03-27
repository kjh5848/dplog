package kr.co.nomadlab.nomadrank.config.security;

import org.springframework.security.crypto.encrypt.TextEncryptor;

import java.util.Map;

public class EncryptionService {
    private final String activeKeyId;
    private final Map<String, TextEncryptor> encryptors;

    public EncryptionService(String activeKeyId, Map<String, TextEncryptor> encryptors) {
        this.activeKeyId = activeKeyId;
        this.encryptors = encryptors;
    }

    // DB에는 "vX:<cipher>" 형태로 저장 → 키 버전 프리픽스 포함
    public String encrypt(String plaintext) {
        if (plaintext == null) return null;
        TextEncryptor enc = encryptors.get(activeKeyId);
        if (enc == null) throw new IllegalStateException("Active key not configured: " + activeKeyId);
        return activeKeyId + ":" + enc.encrypt(plaintext);
    }

    public String decrypt(String cipherWithVersion) {
        if (cipherWithVersion == null) return null;
        int idx = cipherWithVersion.indexOf(':');
        if (idx <= 0) throw new IllegalArgumentException("Missing key version prefix");
        String keyId = cipherWithVersion.substring(0, idx);
        String payload = cipherWithVersion.substring(idx + 1);

        TextEncryptor enc = encryptors.get(keyId);
        if (enc == null) throw new IllegalStateException("Unknown key version: " + keyId);

        return enc.decrypt(payload);
    }
}
