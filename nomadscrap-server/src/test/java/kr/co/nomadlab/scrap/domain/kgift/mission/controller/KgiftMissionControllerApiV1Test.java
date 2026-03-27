package kr.co.nomadlab.scrap.domain.kgift.mission.controller;

import com.epages.restdocs.apispec.ResourceSnippetParameters;
import kr.co.nomadlab.scrap.common.constants.Constants;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.transaction.annotation.Transactional;

import static com.epages.restdocs.apispec.MockMvcRestDocumentationWrapper.document;
import static com.epages.restdocs.apispec.ResourceDocumentation.parameterWithName;
import static com.epages.restdocs.apispec.ResourceDocumentation.resource;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;

@SpringBootTest
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("dev")
public class KgiftMissionControllerApiV1Test {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetProductWishSuccess() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/kgift/mission/product-wish")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("productId", "7886639")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
                )
                .andDo(
                        document("K선물하기 미션 상품 방문 위시 정보 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("K선물하기 미션 스크래핑 V1")
                                        .summary("K선물하기 미션 상품 방문 위시 정보 조회")
                                        .description("""
                                                ## K선물하기 미션 상품 방문 위시 정보 조회 엔드포인트 입니다.
                                                                                                
                                                ---
                                                                                        
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").description("API 키"),
                                                parameterWithName("productId").description("K선물하기 상품 ID")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetReviewEmpathySuccess() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/kgift/mission/review-empathy")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("url", "https://kko.to/0FAXKhVysM")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
                )
                .andDo(
                        document("K선물하기 미션 리뷰 공감 정보 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("K선물하기 미션 스크래핑 V1")
                                        .summary("K선물하기 미션 리뷰 공감 정보 조회")
                                        .description("""
                                                ## K선물하기 미션 리뷰 공감 정보 조회 엔드포인트 입니다.
                                                                                                
                                                ---
                                                                                        
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").description("API 키"),
                                                parameterWithName("url").description("K선물하기 리뷰 공유 URL")
                                        )
                                        .build()
                                )
                        )
                );
    }
}
