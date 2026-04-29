package kr.co.nomadlab.dplog.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dplog")
public class DplogProperties {

    private String frontendBaseUrl = "http://localhost:3000";
    private List<String> allowedOrigins = new ArrayList<>();
    private List<String> adminEmails = new ArrayList<>();
    private Kakao kakao = new Kakao();
    private PublicData publicData = new PublicData();
    private License license = new License();

    public String getFrontendBaseUrl() {
        return frontendBaseUrl;
    }

    public void setFrontendBaseUrl(String frontendBaseUrl) {
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public List<String> getAdminEmails() {
        return adminEmails;
    }

    public void setAdminEmails(List<String> adminEmails) {
        this.adminEmails = adminEmails;
    }

    public Kakao getKakao() {
        return kakao;
    }

    public void setKakao(Kakao kakao) {
        this.kakao = kakao;
    }

    public PublicData getPublicData() {
        return publicData;
    }

    public void setPublicData(PublicData publicData) {
        this.publicData = publicData;
    }

    public License getLicense() {
        return license;
    }

    public void setLicense(License license) {
        this.license = license;
    }

    public static class Kakao {
        private String clientId = "";
        private String clientSecret = "";
        private String redirectUri = "http://localhost:3000/kakao/callback";
        private String issuer = "https://kauth.kakao.com";
        private String authorizeUri = "https://kauth.kakao.com/oauth/authorize";
        private String tokenUri = "https://kauth.kakao.com/oauth/token";
        private String jwkSetUri = "https://kauth.kakao.com/.well-known/jwks.json";
        private String userInfoUri = "https://kapi.kakao.com/v2/user/me";
        private String channelRelationUri = "https://kapi.kakao.com/v2/api/talk/channel";
        private String channelPublicId = "";
        private List<String> requiredScopes = new ArrayList<>();

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }

        public String getClientSecret() {
            return clientSecret;
        }

        public void setClientSecret(String clientSecret) {
            this.clientSecret = clientSecret;
        }

        public String getRedirectUri() {
            return redirectUri;
        }

        public void setRedirectUri(String redirectUri) {
            this.redirectUri = redirectUri;
        }

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public String getAuthorizeUri() {
            return authorizeUri;
        }

        public void setAuthorizeUri(String authorizeUri) {
            this.authorizeUri = authorizeUri;
        }

        public String getTokenUri() {
            return tokenUri;
        }

        public void setTokenUri(String tokenUri) {
            this.tokenUri = tokenUri;
        }

        public String getJwkSetUri() {
            return jwkSetUri;
        }

        public void setJwkSetUri(String jwkSetUri) {
            this.jwkSetUri = jwkSetUri;
        }

        public String getUserInfoUri() {
            return userInfoUri;
        }

        public void setUserInfoUri(String userInfoUri) {
            this.userInfoUri = userInfoUri;
        }

        public String getChannelRelationUri() {
            return channelRelationUri;
        }

        public void setChannelRelationUri(String channelRelationUri) {
            this.channelRelationUri = channelRelationUri;
        }

        public String getChannelPublicId() {
            return channelPublicId;
        }

        public void setChannelPublicId(String channelPublicId) {
            this.channelPublicId = channelPublicId;
        }

        public List<String> getRequiredScopes() {
            return requiredScopes;
        }

        public void setRequiredScopes(List<String> requiredScopes) {
            this.requiredScopes = requiredScopes;
        }
    }

    public static class PublicData {
        private String serviceKey = "";
        private String businessValidationUri = "https://api.odcloud.kr/api/nts-businessman/v1/validate";

        public String getServiceKey() {
            return serviceKey;
        }

        public void setServiceKey(String serviceKey) {
            this.serviceKey = serviceKey;
        }

        public String getBusinessValidationUri() {
            return businessValidationUri;
        }

        public void setBusinessValidationUri(String businessValidationUri) {
            this.businessValidationUri = businessValidationUri;
        }
    }

    public static class License {
        private String hashPepper = "dev-only-change-before-production";
        private String productKeyPrefix = "DPL";
        private String macDownloadUrl = "https://download.dplog.local/dplog-mac-latest.dmg";
        private String windowsDownloadUrl = "https://download.dplog.local/dplog-windows-latest.exe";

        public String getHashPepper() {
            return hashPepper;
        }

        public void setHashPepper(String hashPepper) {
            this.hashPepper = hashPepper;
        }

        public String getProductKeyPrefix() {
            return productKeyPrefix;
        }

        public void setProductKeyPrefix(String productKeyPrefix) {
            this.productKeyPrefix = productKeyPrefix;
        }

        public String getMacDownloadUrl() {
            return macDownloadUrl;
        }

        public void setMacDownloadUrl(String macDownloadUrl) {
            this.macDownloadUrl = macDownloadUrl;
        }

        public String getWindowsDownloadUrl() {
            return windowsDownloadUrl;
        }

        public void setWindowsDownloadUrl(String windowsDownloadUrl) {
            this.windowsDownloadUrl = windowsDownloadUrl;
        }
    }
}
