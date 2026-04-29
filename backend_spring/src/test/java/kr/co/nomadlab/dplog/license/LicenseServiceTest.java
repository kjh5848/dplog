package kr.co.nomadlab.dplog.license;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import kr.co.nomadlab.dplog.auth.AppUser;
import kr.co.nomadlab.dplog.auth.AppUserRepository;
import kr.co.nomadlab.dplog.auth.UserRole;
import kr.co.nomadlab.dplog.owner.BusinessRegistrationResult;
import kr.co.nomadlab.dplog.owner.BusinessRegistrationVerifier;
import kr.co.nomadlab.dplog.owner.OwnerVerificationRequest;
import kr.co.nomadlab.dplog.owner.OwnerVerificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "dplog.kakao.client-id=test-client",
        "dplog.kakao.jwk-set-uri=http://localhost/.well-known/jwks.json"
})
class LicenseServiceTest {

    @Autowired
    private LicenseService licenseService;

    @Autowired
    private OwnerVerificationService ownerVerificationService;

    @Autowired
    private AppUserRepository userRepository;

    @MockBean
    private BusinessRegistrationVerifier businessRegistrationVerifier;

    @Test
    void issuesProductKeyOnceAndVerifiesDesktopLicense() {
        AppUser owner = userRepository.save(testUser("license-owner", UserRole.USER));
        when(businessRegistrationVerifier.verify("1234567890", "20260429", "김사장"))
                .thenReturn(BusinessRegistrationResult.verified());
        ownerVerificationService.submit(owner, new OwnerVerificationRequest(
                "123-45-67890",
                LocalDate.of(2026, 4, 29),
                "김사장",
                "place/123",
                "연산정",
                "한식 음식점"
        ));

        LicenseResponse first = licenseService.requestProductKey(owner);
        LicenseResponse second = licenseService.requestProductKey(owner);

        assertThat(first.oneTimeProductKey()).startsWith("DPL-");
        assertThat(second.oneTimeProductKey()).isNull();
        assertThat(first.deleteKeyStatus()).isEqualTo(DeleteKeyRequestStatus.PENDING_ADMIN_APPROVAL);

        VerifyLicenseResponse verified = licenseService.verifyLicense(new VerifyLicenseRequest(
                first.oneTimeProductKey(),
                null,
                "device-1",
                "macos",
                "0.1.0"
        ));

        assertThat(verified.valid()).isTrue();
        assertThat(verified.licenseId()).isEqualTo(first.licenseId());
    }

    @Test
    void adminApprovalReturnsDeleteKeyOnlyAtApprovalTime() {
        AppUser owner = userRepository.save(testUser("delete-owner", UserRole.USER));
        AppUser admin = userRepository.save(testUser("admin", UserRole.ADMIN));
        when(businessRegistrationVerifier.verify("2222222222", "20260429", "박사장"))
                .thenReturn(BusinessRegistrationResult.verified());
        ownerVerificationService.submit(owner, new OwnerVerificationRequest(
                "222-22-22222",
                LocalDate.of(2026, 4, 29),
                "박사장",
                "place/456",
                "테스트식당",
                "음식점"
        ));

        LicenseResponse license = licenseService.requestProductKey(owner);
        AdminDeleteKeyRequestDto request = licenseService.getAdminDeleteKeyRequests().get(0);

        AdminDeleteKeyApprovalResponse response = licenseService.approveDeleteKey(request.requestId(), admin);

        assertThat(response.licenseId()).isEqualTo(license.licenseId());
        assertThat(response.oneTimeDeleteKey()).startsWith("DEL-");
        assertThat(response.status()).isEqualTo(DeleteKeyRequestStatus.APPROVED);
    }

    private AppUser testUser(String subject, UserRole role) {
        AppUser user = new AppUser();
        user.setKakaoSubject(subject);
        user.setEmail(subject + "@example.com");
        user.setName("테스트");
        user.setNickname("테스트");
        user.setRole(role);
        return user;
    }
}
