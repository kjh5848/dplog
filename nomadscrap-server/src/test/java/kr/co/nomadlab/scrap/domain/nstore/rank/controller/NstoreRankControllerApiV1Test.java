package kr.co.nomadlab.scrap.domain.nstore.rank.controller;

import com.epages.restdocs.apispec.ResourceSnippetParameters;
import com.epages.restdocs.apispec.SimpleType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.nomadlab.scrap.common.constants.Constants;
import kr.co.nomadlab.scrap.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackChartDTOApiV1;
import kr.co.nomadlab.scrap.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackDTOApiV1;
import kr.co.nomadlab.scrap.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackInfoDTOApiV1;
import kr.co.nomadlab.scrap.util.UtilFunction;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static com.epages.restdocs.apispec.MockMvcRestDocumentationWrapper.document;
import static com.epages.restdocs.apispec.ResourceDocumentation.parameterWithName;
import static com.epages.restdocs.apispec.ResourceDocumentation.resource;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;

@SpringBootTest
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("dev")
public class NstoreRankControllerApiV1Test {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @Test
//    public void testGetRealtimeSuccess() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/realtime")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("keyword", "롱패딩")
//                                .queryParam("filterValue", "시슬")
//                                .queryParam("filterType", "COMPANY_NAME")
//                                .queryParam("compare", "true")
//                                .queryParam("ad", "false")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
//                        MockMvcResultMatchers.jsonPath("message").value("success")
//                )
//                .andDo(
//                        document("N스토어 랭크 실시간 순위 리스트 조회 성공",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .summary("N스토어 랭크 실시간 순위 리스트 조회")
//                                        .description("""
//                                                ## N스토어 랭크 실시간 순위 리스트 조회 엔드포인트 입니다.
//
//                                                ---
//
//                                                keyword는 2자 이상 입력해야 하며, 한 글자씩 띄워 쓴 키워드는 검색할 수 없습니다.
//
//                                                filterValue은 1자 이상 입력해야 합니다.
//
//                                                filterType은 COMPANY_NAME 또는 MID로 입력해야 합니다. 입력하지 않을 시 COMPANY_NAME으로 간주합니다.
//
//                                                compare는 true 또는 false로 입력해야 합니다. 입력하지 않을 시 true로 간주합니다.
//
//                                                ad는 true 또는 false로 입력해야 합니다. 입력하지 않을 시 false로 간주합니다.
//
//                                                """)
//                                        .queryParameters(
//                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키"),
//                                                parameterWithName("keyword").type(SimpleType.STRING).description("키워드"),
//                                                parameterWithName("filterValue").type(SimpleType.STRING).description("필터값 (스토어명 또는 mid값)"),
//                                                parameterWithName("filterType").type(SimpleType.STRING).optional().description("필터 타입 (COMPANY_NAME 또는 MID)"),
//                                                parameterWithName("compare").type(SimpleType.BOOLEAN).optional().description("비교 여부 (true 또는 false)"),
//                                                parameterWithName("ad").type(SimpleType.BOOLEAN).optional().description("광고 포함 여부 (true 또는 false)")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetRealtimeFailByNoApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/realtime")
//                                .queryParam("keyword", "아오리 사과")
//                                .queryParam("filterValue", "농장")
//                                .queryParam("filterType", "COMPANY_NAME")
//                                .queryParam("compare", "false")
//                                .queryParam("ad", "false")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 실시간 순위 리스트 조회 실패 - apiKey를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetRealtimeFailByInvalidApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/realtime")
//                                .queryParam("apiKey", "testtesttest")
//                                .queryParam("keyword", "아오리 사과")
//                                .queryParam("filterValue", "농장")
//                                .queryParam("filterType", "COMPANY_NAME")
//                                .queryParam("compare", "false")
//                                .queryParam("ad", "false")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isUnauthorized(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.AUTHENTICATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 실시간 순위 리스트 조회 실패 - 잘못된 apiKey를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetRealtimeFailByNoKeyword() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/realtime")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("filterValue", "농장")
//                                .queryParam("filterType", "COMPANY_NAME")
//                                .queryParam("compare", "false")
//                                .queryParam("ad", "false")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 실시간 순위 리스트 조회 실패 - keyword를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetRealtimeFailByShortKeyword() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/realtime")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("keyword", "")
//                                .queryParam("filterValue", "농장")
//                                .queryParam("filterType", "COMPANY_NAME")
//                                .queryParam("compare", "false")
//                                .queryParam("ad", "false")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 실시간 순위 리스트 조회 실패 - keyword를 2자보다 적게 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetRealtimeFailByInvalidKeyword() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/realtime")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("keyword", "아 오 리 사 과")
//                                .queryParam("filterValue", "농장")
//                                .queryParam("filterType", "COMPANY_NAME")
//                                .queryParam("compare", "false")
//                                .queryParam("ad", "false")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 실시간 순위 리스트 조회 실패 - keyword를 한 글자씩 띄워쓸 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetRealtimeFailByNoFilterValue() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/realtime")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("keyword", "아오리 사과")
//                                .queryParam("filterType", "COMPANY_NAME")
//                                .queryParam("compare", "false")
//                                .queryParam("ad", "false")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 실시간 순위 리스트 조회 실패 - filterValue을 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetRealtimeFailByShortFilterValue() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/realtime")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("keyword", "아오리 사과")
//                                .queryParam("filterValue", "")
//                                .queryParam("filterType", "COMPANY_NAME")
//                                .queryParam("compare", "false")
//                                .queryParam("ad", "false")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.CONSTRAINT_VIOLATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 실시간 순위 리스트 조회 실패 - filterValue을 1자보다 적게 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
////    @Test
////    public void testGetTrackableDetailSuccess() throws Exception {
////        mockMvc.perform(
////                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/trackable/{productId}", "9775303010")
////                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
////                )
////                .andExpectAll(
////                        MockMvcResultMatchers.status().isOk(),
////                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
////                )
////                .andDo(
////                        document("N스토어 랭크 추적 가능 상품 상세 조회 성공",
////                                preprocessRequest(prettyPrint()),
////                                preprocessResponse(prettyPrint()),
////                                resource(ResourceSnippetParameters.builder()
////                                        .tag("N스토어 랭크 스크래핑 V1")
////                                        .summary("N스토어 랭크 추적 가능 상품 상세 조회")
////                                        .description("""
////                                                ## N스토어 랭크 추적 가능 상품 상세 조회 엔드포인트 입니다.
////
////                                                ---
////
////                                                productId는 N스토어 상품 ID만 입력해야 합니다.
////
////                                                """)
////                                        .queryParameters(
////                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
////                                        )
////                                        .pathParameters(
////                                                parameterWithName("productId").type(SimpleType.STRING).description("N스토어 상품 ID")
////                                        )
////                                        .build()
////                                )
////                        )
////                );
////    }
//
//    @Test
//    public void testGetTrackableSuccessByMallId() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/trackable")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("url", "itschool")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 가능 상품 조회 성공 - 스토어몰ID로 조회 했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .summary("N스토어 랭크 추적 가능 상품 조회")
//                                        .description("""
//                                                ## N스토어 랭크 추적 가능 상품 조회 엔드포인트 입니다.
//
//                                                ---
//
//                                                url은 정확한 값을 입력해야 합니다.
//
//                                                9205573121 (상품ID https://smartstore.naver.com/itschool/products/9205573121 주소에서 맨 뒤의 9205573121)
//
//                                                itschool (스토어몰ID https://smartstore.naver.com/itschool 주소에서 맨 뒤의 itschool)
//
//                                                https://smartstore.naver.com/itschool (스토어몰 주소)
//
//                                                https://search.shopping.naver.com/catalog/43854909626 (카탈로그 주소)
//
//                                                https://smartstore.naver.com/itschool/products/9205573121 (상품 주소)
//
//                                                스토어몰ID 나 스토어몰 주소로 검색 시 '전체상품' 탭이 없을 경우 빈 리스트로 응답됩니다.
//
//                                                """)
//                                        .queryParameters(
//                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키"),
//                                                parameterWithName("url").type(SimpleType.STRING).description("스토어몰ID 또는 스토어몰/카탈로그/상품 주소")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetTrackableSuccessByMallUrl() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/trackable")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("url", "https://smartstore.naver.com/itschool")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 가능 상품 조회 성공 - 스토어몰 주소로 조회 했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetTrackableSuccessByCatalogUrl() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/trackable")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("url", "https://search.shopping.naver.com/catalog/29159039312")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
//                        MockMvcResultMatchers.jsonPath("message").value("success")
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 가능 상품 조회 성공 - 카탈로그 주소로 조회 했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetTrackableSuccessByProductUrl() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/trackable")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("url", "https://smartstore.naver.com/itschool/products/9205573121")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 가능 상품 조회 성공 - 상품 주소로 조회 했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetTrackableFailByNoApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/trackable")
//                                .queryParam("url", "https://smartstore.naver.com/itschool/products/9205573121")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 가능 상품 조회 실패 - apiKey를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetTrackableFailByInvalidApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/trackable")
//                                .queryParam("apiKey", "testtesttest")
//                                .queryParam("url", "https://smartstore.naver.com/itschool/products/9205573121")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isUnauthorized(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.AUTHENTICATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 가능 상품 조회 실패 - 잘못된 apiKey를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetTrackableFailByNoUrl() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/trackable")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 가능 상품 조회 실패 - url을 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetTrackableFailByBadUrl() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/trackable")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("url", "tes/tte/stt/est")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 가능 상품 조회 실패 - 잘못된 url을 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackSuccessByMid() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("청송 사과")
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 등록 성공 - mid로 요청했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .summary("N스토어 랭크 추적 등록")
//                                        .description("""
//                                                ## N스토어 랭크 추적 등록 엔드포인트 입니다.
//
//                                                ---
//
//                                                keyword는 2자 이상 입력해야 하며, 한 글자씩 띄워 쓴 키워드는 검색할 수 없습니다.
//
//                                                mid 또는 productId 중 하나는 반드시 입력해야 합니다.
//
//                                                mid 또는 productId 둘 다 입력하셔도 무방하나 mid와 productId가 매칭이 되는 정확한 값을 입력해야 합니다.
//
//                                                """)
//                                        .queryParameters(
//                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
//                                        )
//                                        .requestFields(
//                                                fieldWithPath("nstoreRankTrackInfo.keyword").type(SimpleType.STRING).description("키워드"),
//                                                fieldWithPath("nstoreRankTrackInfo.mid").type(SimpleType.STRING).optional().description("mid"),
//                                                fieldWithPath("nstoreRankTrackInfo.productId").type(SimpleType.STRING).optional().description("productId")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackSuccessByProductId() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("아오리 사과")
//                                .productId("6567428975")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
//                        MockMvcResultMatchers.jsonPath("message").value("success")
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 등록 성공 - productId로 요청했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackFailByNoApiKey() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("청송 사과")
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track")
//                                .content(reqDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 등록 실패 - apiKey를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackFailByInvalidApiKey() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("청송 사과")
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track")
//                                .queryParam("apiKey", "testtesttest")
//                                .content(reqDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isUnauthorized(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.AUTHENTICATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 등록 실패 - 잘못된 apiKey를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackFailByNoKeyword() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BIND_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 등록 실패 - keyword를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackFailByBadKeyword1() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("청 송 사 과")
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 등록 실패 - keyword를 한 글자씩 띄워쓸 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackFailByBadKeyword2() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("")
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BIND_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 등록 실패 - keyword를 2자보다 적게 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackFailByNoMidAndNoProductId() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("청송 사과")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 등록 실패 - mid와 productId를 모두 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackFailByAlreadyTrack() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("청송 사과")
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        mockMvc.perform(
//                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
//                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                        .content(reqDtoJson)
//                        .contentType(MediaType.APPLICATION_JSON)
//        );
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.ENTITY_ALREADY_EXIST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 등록 실패 - 이미 추적 중인 상품을 다시 추적 등록하려고 할 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetTrackInfoSuccess() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nstore/rank/track/info")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
//                )
//                .andDo(
//                        document("N스토어 랭크 등록된 모든 추적 정보 조회 성공",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .summary("N스토어 랭크 등록된 모든 추적 정보 조회")
//                                        .description("""
//                                                ## N스토어 랭크 등록된 모든 추적 정보 조회 엔드포인트 입니다.
//
//                                                ---
//
//                                                등록된 모든 추적 정보를 조회합니다.
//
//                                                """)
//                                        .queryParameters(
//                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackInfoSuccess() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqTrackDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("청송 사과")
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqTrackDtoJson = objectMapper.writeValueAsString(reqTrackDto);
//        MvcResult mvcResult = mockMvc.perform(
//                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
//                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                        .content(reqTrackDtoJson)
//                        .contentType(MediaType.APPLICATION_JSON)
//        ).andReturn();
//        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
//        ReqNstoreRankPostTrackInfoDTOApiV1 reqTrackInfoDto = ReqNstoreRankPostTrackInfoDTOApiV1.builder()
//                .nstoreRankTrackInfoIdList(List.of(
//                        jsonNode.get("data").get("nstoreRankTrackInfo").get("id").asLong()
//                ))
//                .build();
//        String reqTrackInfoDtoJson = objectMapper.writeValueAsString(reqTrackInfoDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track/info")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqTrackInfoDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
//                )
//                .andDo(
//                        document("N스토어 랭크 등록된 추적 정보 조회 성공",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .summary("N스토어 랭크 등록된 추적 정보 조회")
//                                        .description("""
//                                                ## N스토어 랭크 등록된 추적 정보 조회 엔드포인트 입니다.
//
//                                                ---
//
//                                                nstoreRankTrackInfoIdList에 등록된 추적 정보 id리스트를 담아서 요청 합니다.
//
//                                                """)
//                                        .queryParameters(
//                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackInfoFailByNoApiKey() throws Exception {
////        ReqNstoreRankPostTrackDTOApiV1 reqTrackDto = ReqNstoreRankPostTrackDTOApiV1.builder()
////                .nstoreRankTrackInfo(
////                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
////                                .keyword("청송 사과")
////                                .mid("82772167375")
////                                .build()
////                )
////                .build();
////        String reqTrackDtoJson = objectMapper.writeValueAsString(reqTrackDto);
////        MvcResult mvcResult = mockMvc.perform(
////                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
////                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
////                        .content(reqTrackDtoJson)
////                        .contentType(MediaType.APPLICATION_JSON)
////        ).andReturn();
////        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
//        ReqNstoreRankPostTrackInfoDTOApiV1 reqTrackInfoDto = ReqNstoreRankPostTrackInfoDTOApiV1.builder()
//                .nstoreRankTrackInfoIdList(List.of(
//                        -1L
//                ))
//                .build();
//        String reqTrackInfoDtoJson = objectMapper.writeValueAsString(reqTrackInfoDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track/info")
//                                .content(reqTrackInfoDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 등록된 추적 정보 조회 실패 - apiKey를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackInfoFailByInvalidApiKey() throws Exception {
////        ReqNstoreRankPostTrackDTOApiV1 reqTrackDto = ReqNstoreRankPostTrackDTOApiV1.builder()
////                .nstoreRankTrackInfo(
////                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
////                                .keyword("청송 사과")
////                                .mid("82772167375")
////                                .build()
////                )
////                .build();
////        String reqTrackDtoJson = objectMapper.writeValueAsString(reqTrackDto);
////        MvcResult mvcResult = mockMvc.perform(
////                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
////                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
////                        .content(reqTrackDtoJson)
////                        .contentType(MediaType.APPLICATION_JSON)
////        ).andReturn();
////        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
//        ReqNstoreRankPostTrackInfoDTOApiV1 reqTrackInfoDto = ReqNstoreRankPostTrackInfoDTOApiV1.builder()
//                .nstoreRankTrackInfoIdList(List.of(
//                        -1L
//                ))
//                .build();
//        String reqTrackInfoDtoJson = objectMapper.writeValueAsString(reqTrackInfoDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track/info")
//                                .queryParam("apiKey", "testtesttest")
//                                .content(reqTrackInfoDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isUnauthorized(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.AUTHENTICATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 등록된 추적 정보 조회 실패 - 잘못된 apiKey를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackInfoFailByBadIdList() throws Exception {
////        ReqNstoreRankPostTrackDTOApiV1 reqTrackDto = ReqNstoreRankPostTrackDTOApiV1.builder()
////                .nstoreRankTrackInfo(
////                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
////                                .keyword("청송 사과")
////                                .mid("82772167375")
////                                .build()
////                )
////                .build();
////        String reqTrackDtoJson = objectMapper.writeValueAsString(reqTrackDto);
////        MvcResult mvcResult = mockMvc.perform(
////                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
////                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
////                        .content(reqTrackDtoJson)
////                        .contentType(MediaType.APPLICATION_JSON)
////        ).andReturn();
////        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
//        ReqNstoreRankPostTrackInfoDTOApiV1 reqTrackInfoDto = ReqNstoreRankPostTrackInfoDTOApiV1.builder()
//                .nstoreRankTrackInfoIdList(List.of(
//                        -1L, -1L
//                ))
//                .build();
//        String reqTrackInfoDtoJson = objectMapper.writeValueAsString(reqTrackInfoDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track/info")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqTrackInfoDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 등록된 추적 정보 조회 실패 - 중복되거나 없는 추적 정보 id를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .summary("N스토어 랭크 등록된 추적 정보 조회")
//                                        .description("""
//                                                ## N스토어 랭크 등록된 추적 정보 조회 엔드포인트 입니다.
//
//                                                ---
//
//                                                nstoreRankTrackInfoIdList에 등록된 추적 id를 담아서 요청 합니다.
//
//                                                nstoreRankTrackInfoIdList가 빈 리스트일 경우 모든 추적 정보를 조회합니다.
//
//                                                """)
//                                        .queryParameters(
//                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackChartSuccess() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqTrackDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("청송 사과")
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqTrackDtoJson = objectMapper.writeValueAsString(reqTrackDto);
//        MvcResult mvcResult = mockMvc.perform(
//                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
//                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                        .content(reqTrackDtoJson)
//                        .contentType(MediaType.APPLICATION_JSON)
//        ).andReturn();
//        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
//        ReqNstoreRankPostTrackChartDTOApiV1 reqTrackChartDto = ReqNstoreRankPostTrackChartDTOApiV1.builder()
//                .nstoreRankTrackInfoList(List.of(
//                        ReqNstoreRankPostTrackChartDTOApiV1.NstoreRankTrackInfo.builder()
//                                .id(jsonNode.get("data").get("nstoreRankTrackInfo").get("id").asLong())
//                                .trackStartDate(LocalDateTime.now().minusNanos(1))
//                                .build()
//                ))
//                .build();
//        String reqTrackChartDtoJson = objectMapper.writeValueAsString(reqTrackChartDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track/chart")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqTrackChartDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
//                        MockMvcResultMatchers.jsonPath("message").value("success")
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 차트 조회 성공",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .summary("N스토어 랭크 추적 차트 조회")
//                                        .description("""
//                                                ## N스토어 랭크 추적 차트 조회 엔드포인트 입니다.
//
//                                                ---
//
//                                                nstoreRankTrackInfoList에 아래의 값이 포함된 객체를 리스트로 담아주세요.
//
//                                                id : 추적 id
//
//                                                trackStartDate : 추적 시작 날짜
//
//                                                """)
//                                        .queryParameters(
//                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackChartFailByNoApiKey() throws Exception {
////        ReqNstoreRankPostTrackDTOApiV1 reqTrackDto = ReqNstoreRankPostTrackDTOApiV1.builder()
////                .nstoreRankTrackInfo(
////                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
////                                .keyword("청송 사과")
////                                .mid("82772167375")
////                                .build()
////                )
////                .build();
////        String reqTrackDtoJson = objectMapper.writeValueAsString(reqTrackDto);
////        MvcResult mvcResult = mockMvc.perform(
////                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
////                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
////                        .content(reqTrackDtoJson)
////                        .contentType(MediaType.APPLICATION_JSON)
////        ).andReturn();
////        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
//        ReqNstoreRankPostTrackChartDTOApiV1 reqTrackMapDto = ReqNstoreRankPostTrackChartDTOApiV1.builder()
//                .nstoreRankTrackInfoList(List.of(
//                        ReqNstoreRankPostTrackChartDTOApiV1.NstoreRankTrackInfo.builder()
//                                .id(-1L)
//                                .trackStartDate(LocalDateTime.now().minusNanos(1))
//                                .build()
//                ))
//                .build();
//        String reqTrackMapDtoJson = objectMapper.writeValueAsString(reqTrackMapDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track/chart")
////                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqTrackMapDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 차트 조회 실패 - apiKey를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackChartFailByInvalidApiKey() throws Exception {
////        ReqNstoreRankPostTrackDTOApiV1 reqTrackDto = ReqNstoreRankPostTrackDTOApiV1.builder()
////                .nstoreRankTrackInfo(
////                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
////                                .keyword("청송 사과")
////                                .mid("82772167375")
////                                .build()
////                )
////                .build();
////        String reqTrackDtoJson = objectMapper.writeValueAsString(reqTrackDto);
////        MvcResult mvcResult = mockMvc.perform(
////                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
////                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
////                        .content(reqTrackDtoJson)
////                        .contentType(MediaType.APPLICATION_JSON)
////        ).andReturn();
////        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
//        ReqNstoreRankPostTrackChartDTOApiV1 reqTrackMapDto = ReqNstoreRankPostTrackChartDTOApiV1.builder()
//                .nstoreRankTrackInfoList(List.of(
//                        ReqNstoreRankPostTrackChartDTOApiV1.NstoreRankTrackInfo.builder()
//                                .id(-1L)
//                                .trackStartDate(LocalDateTime.now().minusNanos(1))
//                                .build()
//                ))
//                .build();
//        String reqTrackMapDtoJson = objectMapper.writeValueAsString(reqTrackMapDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track/chart")
//                                .queryParam("apiKey", "testtesttest")
//                                .content(reqTrackMapDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isUnauthorized(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.AUTHENTICATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 차트 조회 실패 - 잘못된 apiKey를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testPostTrackChartFailByBadTrackInfoId() throws Exception {
////        ReqNstoreRankPostTrackDTOApiV1 reqTrackDto = ReqNstoreRankPostTrackDTOApiV1.builder()
////                .nstoreRankTrackInfo(
////                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
////                                .keyword("청송 사과")
////                                .mid("82772167375")
////                                .build()
////                )
////                .build();
////        String reqTrackDtoJson = objectMapper.writeValueAsString(reqTrackDto);
////        MvcResult mvcResult = mockMvc.perform(
////                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
////                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
////                        .content(reqTrackDtoJson)
////                        .contentType(MediaType.APPLICATION_JSON)
////        ).andReturn();
////        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
//        ReqNstoreRankPostTrackChartDTOApiV1 reqTrackMapDto = ReqNstoreRankPostTrackChartDTOApiV1.builder()
//                .nstoreRankTrackInfoList(List.of(
//                        ReqNstoreRankPostTrackChartDTOApiV1.NstoreRankTrackInfo.builder()
//                                .id(-1L)
//                                .trackStartDate(LocalDateTime.now().minusNanos(1))
//                                .build()
//                ))
//                .build();
//        String reqTrackMapDtoJson = objectMapper.writeValueAsString(reqTrackMapDto);
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.post("/v1/nstore/rank/track/chart")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .content(reqTrackMapDtoJson)
//                                .contentType(MediaType.APPLICATION_JSON)
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 차트 조회 실패 - 존재하지 않는 추적 id를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .summary("N스토어 랭크 추적 차트 조회")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testDeleteTrackSuccess() throws Exception {
//        ReqNstoreRankPostTrackDTOApiV1 reqDto = ReqNstoreRankPostTrackDTOApiV1.builder()
//                .nstoreRankTrackInfo(
//                        ReqNstoreRankPostTrackDTOApiV1.NstoreRankTrackInfo.builder()
//                                .keyword("청송 사과")
//                                .mid("82772167375")
//                                .build()
//                )
//                .build();
//        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
//        MvcResult mvcResult = mockMvc.perform(
//                MockMvcRequestBuilders.post("/v1/nstore/rank/track")
//                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                        .content(reqDtoJson)
//                        .contentType(MediaType.APPLICATION_JSON)
//        ).andReturn();
//        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
//        Long nstoreRankTrackInfoId =
//                jsonNode.get("data").get("nstoreRankTrackInfo").get("id").asLong();
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.delete(
//                                        "/v1/nstore/rank/track/{nstoreRankTrackInfoId}",
//                                        nstoreRankTrackInfoId
//                                )
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isOk(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
//                        MockMvcResultMatchers.jsonPath("message").value("success")
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 삭제 성공",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .summary("N스토어 랭크 추적 삭제")
//                                        .description("""
//                                                ## N스토어 랭크 추적 삭제 엔드포인트 입니다.
//
//                                                ---
//
//                                                주의! 개별 이용자의 추적 정보가 아닌 APIKEY 유저 단위로 삭제됩니다.
//
//                                                nstoreRankTrackInfo의 id를 입력합니다.
//
//                                                """)
//                                        .pathParameters(
//                                                parameterWithName("nstoreRankTrackInfoId").type(SimpleType.NUMBER).description("추적 ID")
//                                        )
//                                        .queryParameters(
//                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
//                                        )
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testDeleteTrackFailByNoApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.delete(
//                                "/v1/nstore/rank/track/{nstoreRankTrackInfoId}",
//                                -1
//                        )
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 삭제 실패 - apiKey를 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testDeleteTrackFailByInvalidApiKey() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.delete(
//                                        "/v1/nstore/rank/track/{nstoreRankTrackInfoId}",
//                                        -1
//                                )
//                                .queryParam("apiKey", "testtesttest")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isUnauthorized(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.AUTHENTICATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 삭제 실패 - apiKey를 잘못 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testDeleteTrackFailByNotExistNstoreRankTrackInfoId() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.delete(
//                                        "/v1/nstore/rank/track/{nstoreRankTrackInfoId}",
//                                        -1
//                                )
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                )
//                .andDo(
//                        document("N스토어 랭크 추적 삭제 실패 - 존재하지 않는 추적 ID를 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N스토어 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }

}
