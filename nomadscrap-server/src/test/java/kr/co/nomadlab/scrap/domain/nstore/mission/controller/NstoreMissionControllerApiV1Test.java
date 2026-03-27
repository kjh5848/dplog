package kr.co.nomadlab.scrap.domain.nstore.mission.controller;

import com.epages.restdocs.apispec.ResourceSnippetParameters;
import kr.co.nomadlab.scrap.common.constants.Constants;
import kr.co.nomadlab.scrap.domain.nstore.mission.constraint.NstoreMissionProductDibsFilterType;
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
import static org.awaitility.Awaitility.await;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;

@SpringBootTest
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("dev")
public class NstoreMissionControllerApiV1Test {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Test
//    public void testGetMallFeedSuccess() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/mall-feed")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("url", "https://smartstore.naver.com/itschool")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
//                )
//                .andDo(
//                        document("N스토어 미션 몰 알림받기 정보 조회 성공",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .summary("N스토어 미션 몰 알림받기 정보 조회")
//                                        .description("""
//                                                ## N스토어 미션 몰 알림받기 정보 조회 엔드포인트 입니다.
//
//                                                ---
//
//                                                url은 정확히 입력해야 합니다.
//
//                                                ex) https://smartstore.naver.com/itschool
//
//                                                """)
//                                        .queryParameters(
//                                                parameterWithName("apiKey").description("API 키"),
//                                                parameterWithName("url").description("N스토어 몰 주소")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetMallFeedFailByNoApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/mall-feed")
//                                .queryParam("url", "https://smartstore.naver.com/itschool")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 몰 알림받기 정보 조회 실패 - apiKey를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetMallFeedFailByInvalidApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/mall-feed")
//                                .queryParam("apiKey", "testtesttest")
//                                .queryParam("url", "https://smartstore.naver.com/itschool")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isUnauthorized(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.AUTHENTICATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 몰 알림받기 정보 조회 실패 - 잘못된 apiKey를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetMallFeedFailByNoUrl() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/mall-feed")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 몰 알림받기 정보 조회 실패 - url을 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetMallFeedFailByBadUrl() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/mall-feed")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("url", "httptore.naver.com/mdishop")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.CONSTRAINT_VIOLATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 몰 알림받기 정보 조회 실패 - url을 잘못 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetMallFeedFailByNoResult() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/mall-feed")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("url", "https://smartstore.naver.com/mdishoptemptemp")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 몰 알림받기 정보 조회 실패 - url로 검색이 되지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsSuccessByUrl() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("filterValue", "https://smartstore.naver.com/itschool/products/9205573121")
//                                .queryParam("filterType", NstoreMissionProductDibsFilterType.URL.toString())
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
//                        MockMvcResultMatchers.jsonPath("message").value("success")
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 성공 - URL타입으로 조회했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .summary("N스토어 미션 상품 방문 찜 정보 조회")
//                                        .description("""
//                                                ## N스토어 상품 방문 찜 정보 조회 엔드포인트 입니다.
//
//                                                ---
//
//                                                filterType은 URL 또는 MID 입니다.
//
//                                                filterType이 MID 일 경우 keyword, filterValue를 필수로 입력해야 합니다.
//
//                                                filterType이 URL 일 경우 filterValue만 입력하면 됩니다.
//
//                                                filterValue는 filterType에 맞는 값을 입력해야 합니다.
//
//                                                - URL: https://smartstore.naver.com/itschool/products/9205573121
//                                                - MID: 85842816116
//
//                                                keyword는 2자 이상 입력해야 하며, 한 글자씩 띄워 쓴 키워드는 검색할 수 없습니다.
//
//                                                """)
//                                        .queryParameters(
//                                                parameterWithName("apiKey").description("API 키"),
//                                                parameterWithName("keyword").optional().description("MID타입 검색 시 필요한 키워드"),
//                                                parameterWithName("filterValue").description("검색할 URL 또는 MID"),
//                                                parameterWithName("filterType").description("검색할 필터 타입 (MID, URL)")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsSuccessByMid() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("keyword", "장난감")
//                                .queryParam("filterValue", "86177075319")
//                                .queryParam("filterType", NstoreMissionProductDibsFilterType.MID.toString())
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
//                        MockMvcResultMatchers.jsonPath("message").value("success")
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 성공 - MID타입으로 조회했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsFailByNoApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("filterValue", "https://smartstore.naver.com/itschool/products/9205573121")
//                                .queryParam("filterType", NstoreMissionProductDibsFilterType.URL.toString())
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 실패 - apiKey를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsFailByInvalidApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("apiKey", "testtesttest")
//                                .queryParam("filterValue", "https://smartstore.naver.com/itschool/products/9205573121")
//                                .queryParam("filterType", NstoreMissionProductDibsFilterType.URL.toString())
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isUnauthorized(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.AUTHENTICATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 실패 - 잘못된 apiKey를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsFailByNoFilterType() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("filterValue", "https://smartstore.naver.com/itschool/products/9205573121")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 실패 - filterType을 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsFailByBadFilterType() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("filterValue", "https://smartstore.naver.com/itschool/products/9205573121")
//                                .queryParam("filterType", "testtesttest")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.METHOD_ARGUMENT_TYPE_MISMATCH_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 실패 - 잘못된 filterType을 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsFailByNoFilterValue() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("filterType", NstoreMissionProductDibsFilterType.URL.toString())
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 실패 - filterValue를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsFailByShortFilterValue() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("filterValue", "")
//                                .queryParam("filterType", NstoreMissionProductDibsFilterType.URL.toString())
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.CONSTRAINT_VIOLATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 실패 - filterValue를 1자 미만으로 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsFailByNoKeyword() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("filterValue", "85842816116")
//                                .queryParam("filterType", NstoreMissionProductDibsFilterType.MID.toString())
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 실패 - keyword를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetProductDibsFailByBadKeyword() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/mission/product-dibs")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("keyword", "아 오 리 사 과")
//                                .queryParam("filterValue", "85842816116")
//                                .queryParam("filterType", NstoreMissionProductDibsFilterType.MID.toString())
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 미션 상품 방문 찜 정보 조회 실패 - keyword를 잘못 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 미션 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }

}
