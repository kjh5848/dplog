package kr.co.nomadlab.dplog.license;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import kr.co.nomadlab.dplog.auth.AppUser;
import kr.co.nomadlab.dplog.auth.AppUserRepository;
import kr.co.nomadlab.dplog.auth.DplogPrincipal;
import kr.co.nomadlab.dplog.auth.UserRole;
import kr.co.nomadlab.dplog.owner.BusinessRegistrationResult;
import kr.co.nomadlab.dplog.owner.BusinessRegistrationVerifier;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:dplog-http-e2e;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "dplog.license.hash-pepper=http-e2e-test-pepper"
})
@AutoConfigureMockMvc
class LicenseHttpE2eTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private DeleteKeyRequestRepository deleteKeyRequestRepository;

    @MockBean
    private BusinessRegistrationVerifier businessRegistrationVerifier;

    @Test
    void verifiedOwnerCanIssueProductKeyVerifyDesktopAndAdminCanApproveDeleteKey() throws Exception {
        AppUser owner = saveUser("owner-kakao-subject", "owner@example.com", UserRole.USER);
        AppUser admin = saveUser("admin-kakao-subject", "admin@example.com", UserRole.ADMIN);

        given(businessRegistrationVerifier.verify(eq("1234567890"), eq("20260429"), eq("홍길동")))
                .willReturn(BusinessRegistrationResult.verified());

        mockMvc.perform(post("/v1/owner-verifications")
                        .with(authenticatedAs(owner))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "businessNumber": "123-45-67890",
                                  "openingDate": "2026-04-29",
                                  "representativeName": "홍길동",
                                  "placeId": "place-1",
                                  "placeName": "테스트 한식당",
                                  "category": "한식 음식점"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("VERIFIED"));

        MvcResult licenseResult = mockMvc.perform(post("/v1/account/license/request")
                        .with(authenticatedAs(owner))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.oneTimeProductKey", not(blankOrNullString())))
                .andExpect(jsonPath("$.data.deleteKeyStatus").value("PENDING_ADMIN_APPROVAL"))
                .andReturn();

        String productKey = readText(licenseResult, "/data/oneTimeProductKey");

        mockMvc.perform(post("/v1/auth/verify-license")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productKey": "%s",
                                  "deviceId": "device-http-e2e",
                                  "platform": "mac",
                                  "appVersion": "0.1.0"
                                }
                                """.formatted(productKey)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid").value(true));

        DeleteKeyRequest pendingDeleteKeyRequest = deleteKeyRequestRepository.findAll().get(0);

        mockMvc.perform(post("/v1/admin/delete-key-requests/{id}/approve", pendingDeleteKeyRequest.getId())
                        .with(authenticatedAs(admin))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"))
                .andExpect(jsonPath("$.data.oneTimeDeleteKey", not(blankOrNullString())));

        mockMvc.perform(post("/v1/admin/delete-key-requests/{id}/approve", pendingDeleteKeyRequest.getId())
                        .with(authenticatedAs(admin))
                        .with(csrf()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("DELETE_KEY_ALREADY_HANDLED"));
    }

    private AppUser saveUser(String kakaoSubject, String email, UserRole role) {
        AppUser user = new AppUser();
        user.setKakaoSubject(kakaoSubject);
        user.setEmail(email);
        user.setNickname(email);
        user.setName(email);
        user.setRole(role);
        return userRepository.save(user);
    }

    private RequestPostProcessor authenticatedAs(AppUser user) {
        DplogPrincipal principal = new DplogPrincipal(user.getId(), user.getEmail(), user.getRole());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        return authentication(authentication);
    }

    private String readText(MvcResult result, String pointer) throws Exception {
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.at(pointer).asText();
    }
}
