package kr.co.nomadlab.dplog.owner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import kr.co.nomadlab.dplog.auth.AppUser;
import kr.co.nomadlab.dplog.auth.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:dplog-owner-verification-test;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "dplog.kakao.client-id=test-client",
        "dplog.kakao.jwk-set-uri=http://localhost/.well-known/jwks.json"
})
class OwnerVerificationServiceTest {

    @Autowired
    private OwnerVerificationService ownerVerificationService;

    @Autowired
    private AppUserRepository userRepository;

    @MockBean
    private BusinessRegistrationVerifier businessRegistrationVerifier;

    @Test
    void verifiesRestaurantOwnerWhenPublicDataResultIsValid() {
        AppUser user = userRepository.save(testUser("owner-valid"));
        when(businessRegistrationVerifier.verify("1234567890", "20260429", "김사장"))
                .thenReturn(BusinessRegistrationResult.verified());

        OwnerVerificationResponse response = ownerVerificationService.submit(user, new OwnerVerificationRequest(
                "123-45-67890",
                LocalDate.of(2026, 4, 29),
                "김사장",
                "place/123",
                "연산정",
                "한식 음식점"
        ));

        assertThat(response.status()).isEqualTo(OwnerVerificationStatus.VERIFIED);
        assertThat(ownerVerificationService.hasVerifiedOwner(user)).isTrue();
    }

    @Test
    void rejectsNonRestaurantCategoryBeforeExternalVerification() {
        AppUser user = userRepository.save(testUser("owner-invalid-category"));

        OwnerVerificationResponse response = ownerVerificationService.submit(user, new OwnerVerificationRequest(
                "123-45-67890",
                LocalDate.of(2026, 4, 29),
                "김사장",
                "place/999",
                "테스트상점",
                "미용실"
        ));

        assertThat(response.status()).isEqualTo(OwnerVerificationStatus.REJECTED_NOT_RESTAURANT);
        assertThat(ownerVerificationService.hasVerifiedOwner(user)).isFalse();
    }

    private AppUser testUser(String subject) {
        AppUser user = new AppUser();
        user.setKakaoSubject(subject);
        user.setEmail(subject + "@example.com");
        user.setName("테스트");
        user.setNickname("테스트");
        return user;
    }
}
