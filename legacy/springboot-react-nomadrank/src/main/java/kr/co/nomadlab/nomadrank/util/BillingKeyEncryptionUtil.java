package kr.co.nomadlab.nomadrank.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * 빌링키 암호화 유틸리티
 * AES-256-CBC를 사용하여 빌링키를 안전하게 암호화/복호화
 */
@Slf4j
@Component
public class BillingKeyEncryptionUtil {
    
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";
    private static final int IV_LENGTH = 16;
    
    @Value("${portone.billing.encryption-key}")
    private String encryptionKey;
    
    /**
     * 빌링키 암호화
     * @param billingKey 원본 빌링키
     * @return 암호화된 빌링키 (Base64 인코딩, IV 포함)
     */
    public String encrypt(String billingKey) {
        try {
            if (billingKey == null || billingKey.isEmpty()) {
                throw new IllegalArgumentException("빌링키는 null이거나 빈 값일 수 없습니다");
            }
            
            // 32바이트 키 생성 (AES-256)
            byte[] keyBytes = getKeyBytes();
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
            
            // 랜덤 IV 생성
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            
            // 암호화
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
            byte[] encryptedBytes = cipher.doFinal(billingKey.getBytes(StandardCharsets.UTF_8));
            
            // IV + 암호화된 데이터를 Base64로 인코딩
            byte[] result = new byte[IV_LENGTH + encryptedBytes.length];
            System.arraycopy(iv, 0, result, 0, IV_LENGTH);
            System.arraycopy(encryptedBytes, 0, result, IV_LENGTH, encryptedBytes.length);
            
            return Base64.getEncoder().encodeToString(result);
            
        } catch (Exception e) {
            log.error("빌링키 암호화 실패", e);
            throw new RuntimeException("빌링키 암호화에 실패했습니다", e);
        }
    }
    
    /**
     * 빌링키 복호화
     * @param encryptedBillingKey 암호화된 빌링키 (Base64 인코딩, IV 포함)
     * @return 복호화된 원본 빌링키
     */
    public String decrypt(String encryptedBillingKey) {
        try {
            if (encryptedBillingKey == null || encryptedBillingKey.isEmpty()) {
                throw new IllegalArgumentException("암호화된 빌링키는 null이거나 빈 값일 수 없습니다");
            }
            
            // Base64 디코딩
            byte[] encryptedData = Base64.getDecoder().decode(encryptedBillingKey);
            
            if (encryptedData.length <= IV_LENGTH) {
                throw new IllegalArgumentException("암호화된 데이터 형식이 올바르지 않습니다");
            }
            
            // IV 분리
            byte[] iv = new byte[IV_LENGTH];
            System.arraycopy(encryptedData, 0, iv, 0, IV_LENGTH);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            
            // 암호화된 데이터 분리
            byte[] cipherText = new byte[encryptedData.length - IV_LENGTH];
            System.arraycopy(encryptedData, IV_LENGTH, cipherText, 0, cipherText.length);
            
            // 32바이트 키 생성
            byte[] keyBytes = getKeyBytes();
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
            
            // 복호화
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
            byte[] decryptedBytes = cipher.doFinal(cipherText);
            
            return new String(decryptedBytes, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            log.error("빌링키 복호화 실패", e);
            throw new RuntimeException("빌링키 복호화에 실패했습니다", e);
        }
    }
    
    /**
     * 설정된 암호화 키에서 32바이트 키 생성
     */
    private byte[] getKeyBytes() {
        if (encryptionKey == null || encryptionKey.length() < 32) {
            throw new IllegalStateException("암호화 키는 최소 32자 이상이어야 합니다");
        }
        
        // 32바이트로 자르거나 패딩
        return encryptionKey.substring(0, 32).getBytes(StandardCharsets.UTF_8);
    }
    
    /**
     * 빌링키 마스킹 (로그 및 응답용)
     * 예: billing_key_abc123 → billing_***_123
     */
    public String maskBillingKey(String billingKey) {
        if (billingKey == null || billingKey.length() < 8) {
            return "***";
        }
        
        String prefix = billingKey.substring(0, 8);
        String suffix = billingKey.substring(billingKey.length() - 3);
        return prefix + "***" + suffix;
    }
}