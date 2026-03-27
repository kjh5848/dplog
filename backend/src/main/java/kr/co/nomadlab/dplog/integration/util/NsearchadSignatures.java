package kr.co.nomadlab.dplog.integration.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;

/**
 * 네이버 검색광고 API HMAC-SHA256 서명 유틸
 * - 레거시 NsearchadSignatures 이관
 * - BouncyCastle 제거 → 표준 JDK javax.crypto.Mac 사용
 */
public final class NsearchadSignatures {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private NsearchadSignatures() {
        // 유틸 클래스 인스턴스화 방지
    }

    /**
     * HMAC-SHA256 서명 생성
     *
     * @param timestamp 타임스탬프 (밀리초)
     * @param method    HTTP 메서드 (GET, POST 등)
     * @param resource  API 리소스 경로 (예: /keywordstool)
     * @param secretKey 네이버 검색광고 시크릿 키
     * @return Base64 인코딩된 서명 문자열
     */
    public static String of(String timestamp, String method, String resource, String secretKey) {
        return of(timestamp + "." + method + "." + resource, secretKey);
    }

    private static String of(String data, String secretKey) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] signature = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(signature);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("HMAC-SHA256 서명 생성 실패", e);
        }
    }
}
