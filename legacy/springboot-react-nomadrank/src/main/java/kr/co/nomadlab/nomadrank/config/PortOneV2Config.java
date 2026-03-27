package kr.co.nomadlab.nomadrank.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

/**
 * 포트원 V2 API 설정
 */
@ConfigurationProperties(prefix = "portone")
@Getter
@Setter
public class PortOneV2Config {
    
    private V2 v2 = new V2();
    private Billing billing = new Billing();
    
    @Getter
    @Setter
    public static class V2 {
        private String storeId;
        private String apiSecret;
        private String channelKey;
        private String apiUrl;
        private String webhookSecret;
    }
    
    @Getter
    @Setter
    public static class Billing {
        private String encryptionKey;
        private int maxRetryCount = 3;
        private int maxFailureCount = 3;
        private int retryIntervalHours = 24;
    }
}