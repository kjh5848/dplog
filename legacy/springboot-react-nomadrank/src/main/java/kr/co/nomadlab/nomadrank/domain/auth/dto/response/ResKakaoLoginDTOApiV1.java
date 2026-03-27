package kr.co.nomadlab.nomadrank.domain.auth.dto.response;

import kr.co.nomadlab.nomadrank.domain.auth.dto.external.KakaoUserResponseDTO;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

/**
 * 카카오 로그인 응답 DTO
 * 
 * 카카오 로그인 성공 시 클라이언트에게 전달되는 카카오 원본 사용자 정보를 담는 DTO입니다.
 */
@Getter
@Builder
public class ResKakaoLoginDTOApiV1 {

    /**
     * 카카오 사용자 ID
     */
    private Long id; // 앱 내 사용자 ID (주의: 카카오 ID 아님)

    /**
     * 닉네임
     */
    private String nickname;

    /**
     * 실명(카카오계정 이름)
     */
    private String realName;

    /**
     * 이메일 주소
     */
    private String email;

    private Boolean emailValid;
    private Boolean emailVerified;

    /**
     * 프로필 이미지 URL
     */
    private String profileImage;

    /**
     * 성별
     */
    private String gender;

    /**
     * 생년월일
     */
    private LocalDate birthDate;

    private String ageRange;   // 예: 20~29
    private String birthyear;  // YYYY
    private String birthday;   // MMDD
    private String birthdayType; // SOLAR/LUNAR
    private Boolean leapMonth;   // 윤달 여부

    /**
     * 전화번호
     */
    private String phoneNumber;

    // 동의 필요 플래그 (needs_agreement)
    private Boolean profileNeedsAgreement;
    private Boolean profileNicknameNeedsAgreement;
    private Boolean profileImageNeedsAgreement;
    private Boolean nameNeedsAgreement;
    private Boolean emailNeedsAgreement;
    private Boolean ageRangeNeedsAgreement;
    private Boolean birthyearNeedsAgreement;
    private Boolean birthdayNeedsAgreement;
    private Boolean genderNeedsAgreement;
    private Boolean phoneNumberNeedsAgreement;

    /**
     * UserEntity로부터 DTO 생성
     */
    public static ResKakaoLoginDTOApiV1 of(UserEntity userEntity) {
        return ResKakaoLoginDTOApiV1.builder()
                .id(userEntity.getId())
                .nickname(userEntity.getName())
                .email(userEntity.getEmail())
                .profileImage(userEntity.getProfileImage())
                .gender(userEntity.getGender())
                .birthDate(userEntity.getBirthDate())
                .phoneNumber(userEntity.getTel())
                .build();
    }

    /**
     * UserEntity + Kakao 원본 응답을 함께 포함한 확장 팩토리
     */
    public static ResKakaoLoginDTOApiV1 of(UserEntity userEntity, KakaoUserResponseDTO kakao) {
        ResKakaoLoginDTOApiV1Builder b = ResKakaoLoginDTOApiV1.builder()
                .id(userEntity.getId())
                .nickname(userEntity.getName())
                .realName(kakao != null ? kakao.getRealName() : null)
                .email(userEntity.getEmail())
                .emailValid(kakao != null && kakao.getKakaoAccount() != null ? kakao.getKakaoAccount().getIsEmailValid() : null)
                .emailVerified(kakao != null && kakao.getKakaoAccount() != null ? kakao.getKakaoAccount().getIsEmailVerified() : null)
                .profileImage(userEntity.getProfileImage())
                .gender(userEntity.getGender())
                .birthDate(userEntity.getBirthDate())
                .ageRange(kakao != null ? kakao.getAgeRange() : null)
                .birthyear(kakao != null ? kakao.getBirthyear() : null)
                .birthday(kakao != null ? kakao.getBirthday() : null)
                .birthdayType(kakao != null ? kakao.getBirthdayType() : null)
                .leapMonth(kakao != null && kakao.getKakaoAccount() != null ? kakao.getKakaoAccount().getIsLeapMonth() : null)
                .phoneNumber(userEntity.getTel());

        if (kakao != null && kakao.getKakaoAccount() != null) {
            var a = kakao.getKakaoAccount();
            b.profileNeedsAgreement(a.getProfileNeedsAgreement())
             .profileNicknameNeedsAgreement(a.getProfileNicknameNeedsAgreement())
             .profileImageNeedsAgreement(a.getProfileImageNeedsAgreement())
             .nameNeedsAgreement(a.getNameNeedsAgreement())
             .emailNeedsAgreement(a.getEmailNeedsAgreement())
             .ageRangeNeedsAgreement(a.getAgeRangeNeedsAgreement())
             .birthyearNeedsAgreement(a.getBirthyearNeedsAgreement())
             .birthdayNeedsAgreement(a.getBirthdayNeedsAgreement())
             .genderNeedsAgreement(a.getGenderNeedsAgreement())
             .phoneNumberNeedsAgreement(a.getPhoneNumberNeedsAgreement());
        }

        return b.build();
    }
}
