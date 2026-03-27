package kr.co.nomadlab.nomadrank.domain.auth.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

/**
 * 카카오 사용자 정보 조회 API 응답 DTO
 * 
 * 카카오 API에서 사용자 정보 조회 시 반환되는 데이터를 매핑합니다.
 * 
 * 참조: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoUserResponseDTO {

    /**
     * 카카오 사용자 고유 ID
     */
    @JsonProperty("id")
    private Long id;

    /**
     * 서비스 연결 완료 시각 (ISO 8601)
     */
    @JsonProperty("connected_at")
    private String connectedAt;

    /**
     * 사용자 프로퍼티
     * 닉네임, 프로필 이미지 등의 기본 정보
     */
    @JsonProperty("properties")
    private Properties properties;

    /**
     * 카카오계정 정보
     * 이메일, 프로필 등의 상세 정보
     */
    @JsonProperty("kakao_account")
    private KakaoAccount kakaoAccount;

    /**
     * 사용자 프로퍼티 내부 클래스
     */
    @Getter
    @Setter
    public static class Properties {
        
        /**
         * 닉네임
         */
        @JsonProperty("nickname")
        private String nickname;

        /**
         * 프로필 이미지 URL (640px)
         */
        @JsonProperty("profile_image")
        private String profileImage;

        /**
         * 썸네일 이미지 URL (110px)
         */
        @JsonProperty("thumbnail_image")
        private String thumbnailImage;
    }

    /**
     * 카카오계정 정보 내부 클래스
     */
    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KakaoAccount {

        // ====== Needs agreement flags ======
        @JsonProperty("profile_needs_agreement")
        private Boolean profileNeedsAgreement;

        @JsonProperty("profile_nickname_needs_agreement")
        private Boolean profileNicknameNeedsAgreement;

        @JsonProperty("profile_image_needs_agreement")
        private Boolean profileImageNeedsAgreement;

        @JsonProperty("name_needs_agreement")
        private Boolean nameNeedsAgreement;

        @JsonProperty("email_needs_agreement")
        private Boolean emailNeedsAgreement;

        @JsonProperty("age_range_needs_agreement")
        private Boolean ageRangeNeedsAgreement;

        @JsonProperty("birthyear_needs_agreement")
        private Boolean birthyearNeedsAgreement;

        @JsonProperty("birthday_needs_agreement")
        private Boolean birthdayNeedsAgreement;

        @JsonProperty("gender_needs_agreement")
        private Boolean genderNeedsAgreement;

        @JsonProperty("phone_number_needs_agreement")
        private Boolean phoneNumberNeedsAgreement;

        // ====== Account fields ======
        @JsonProperty("name")
        private String name;

        /**
         * 프로필 정보 제공 동의 여부
         */
        // kept above

        /**
         * 이메일 유효성 확인 여부
         */
        @JsonProperty("is_email_valid")
        private Boolean isEmailValid;

        /**
         * 이메일 인증 여부
         */
        @JsonProperty("is_email_verified")
        private Boolean isEmailVerified;

        /**
         * 이메일 주소
         */
        @JsonProperty("email")
        private String email;

        /**
         * 프로필 정보
         */
        @JsonProperty("profile")
        private Profile profile;

        // 추가 개인정보 항목
        @JsonProperty("age_range")
        private String ageRange;  // 예: "20~29"

        @JsonProperty("birthyear")
        private String birthyear; // YYYY

        @JsonProperty("birthday")
        private String birthday;  // MMDD

        @JsonProperty("birthday_type")
        private String birthdayType; // SOLAR 또는 LUNAR

        @JsonProperty("is_leap_month")
        private Boolean isLeapMonth;

        @JsonProperty("gender")
        private String gender; // male / female

        @JsonProperty("phone_number")
        private String phoneNumber;

        /**
         * 프로필 정보 내부 클래스
         */
        @Getter
        @Setter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Profile {
            
            /**
             * 닉네임
             */
            @JsonProperty("nickname")
            private String nickname;

            /**
             * 썸네일 이미지 URL
             */
            @JsonProperty("thumbnail_image_url")
            private String thumbnailImageUrl;

            /**
             * 프로필 이미지 URL
             */
            @JsonProperty("profile_image_url")
            private String profileImageUrl;

            /**
             * 기본 이미지 여부
             */
            @JsonProperty("is_default_image")
            private Boolean isDefaultImage;
        }

        /**
         * 약관 동의 내역(legal_needs)
         */
        @JsonProperty("legal_needs")
        private List<LegalNeed> legalNeeds;

        /**
         * 약관 동의 항목
         */
        @Getter
        @Setter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class LegalNeed {
            /** 약관 코드 (예: TOS, PRIVACY 등) */
            @JsonProperty("code")
            private String code;

            /** 필수 약관 여부 */
            @JsonProperty("required")
            private Boolean required;

            /** 동의 여부 */
            @JsonProperty("agreed")
            private Boolean agreed;

            /** 약관 개정 시각(버전) */
            @JsonProperty("revision_time")
            private String revisionTime;

            /** 동의 시각 */
            @JsonProperty("agreed_at")
            private String agreedAt;
        }
    }

    /**
     * 사용자 닉네임 반환 (우선순위: account.profile > properties)
     */
    public String getNickname() {
        if (kakaoAccount != null && kakaoAccount.getProfile() != null && kakaoAccount.getProfile().getNickname() != null) {
            return kakaoAccount.getProfile().getNickname();
        }
        if (properties != null && properties.getNickname() != null) {
            return properties.getNickname();
        }
        return null;
    }

    /**
     * 프로필 이미지 URL 반환 (우선순위: account.profile > properties)
     */
    public String getProfileImageUrl() {
        if (kakaoAccount != null && kakaoAccount.getProfile() != null && kakaoAccount.getProfile().getProfileImageUrl() != null) {
            return kakaoAccount.getProfile().getProfileImageUrl();
        }
        if (properties != null && properties.getProfileImage() != null) {
            return properties.getProfileImage();
        }
        return null;
    }

    /**
     * 이메일 주소 반환
     */
    public String getEmail() {
        if (kakaoAccount != null) {
            return kakaoAccount.getEmail();
        }
        return null;
    }

    /**
     * 실명 반환 (카카오계정 이름)
     */
    public String getRealName() {
        return kakaoAccount != null ? kakaoAccount.getName() : null;
    }

    /**
     * 성별 반환 (male/female)
     */
    public String getGender() {
        return kakaoAccount != null ? kakaoAccount.getGender() : null;
    }

    /**
     * 출생연도 반환 (YYYY)
     */
    public String getBirthyear() {
        return kakaoAccount != null ? kakaoAccount.getBirthyear() : null;
    }

    /**
     * 생일 반환 (MMDD)
     */
    public String getBirthday() {
        return kakaoAccount != null ? kakaoAccount.getBirthday() : null;
    }

    /**
     * 생일 타입 반환 (SOLAR/LUNAR)
     */
    public String getBirthdayType() {
        return kakaoAccount != null ? kakaoAccount.getBirthdayType() : null;
    }

    /**
     * 전화번호 반환
     */
    public String getPhoneNumber() {
        return kakaoAccount != null ? kakaoAccount.getPhoneNumber() : null;
    }

    /**
     * 연령대 반환 (예: 20~29)
     */
    public String getAgeRange() {
        return kakaoAccount != null ? kakaoAccount.getAgeRange() : null;
    }

    /**
     * YYYY + MMDD 조합으로 LocalDate 생성 (SOLAR일 때만)
     */
    public java.time.LocalDate getBirthDateOrNull() {
        try {
            String year = getBirthyear();
            String mmdd = getBirthday();
            String type = getBirthdayType();
            if (year == null || mmdd == null || mmdd.length() != 4) return null;
            if (type != null && !"SOLAR".equalsIgnoreCase(type)) return null;
            int y = Integer.parseInt(year);
            int m = Integer.parseInt(mmdd.substring(0, 2));
            int d = Integer.parseInt(mmdd.substring(2, 4));
            return java.time.LocalDate.of(y, m, d);
        } catch (Exception e) {
            return null;
        }
    }

}
