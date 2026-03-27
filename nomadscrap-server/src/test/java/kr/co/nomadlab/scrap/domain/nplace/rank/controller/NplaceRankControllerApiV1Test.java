package kr.co.nomadlab.scrap.domain.nplace.rank.controller;

import com.epages.restdocs.apispec.ResourceSnippetParameters;
import com.epages.restdocs.apispec.SimpleType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.nomadlab.scrap.common.constants.Constants;
import kr.co.nomadlab.scrap.domain.nplace.rank.dto.request.ReqNplaceRankPostTrackChartDTOApiV1;
import kr.co.nomadlab.scrap.domain.nplace.rank.dto.request.ReqNplaceRankPostTrackDTOApiV1;
import kr.co.nomadlab.scrap.domain.nplace.rank.dto.request.ReqNplaceRankPostTrackInfoDTOApiV1;
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
public class NplaceRankControllerApiV1Test {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetRealtimeSuccess() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/realtime")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("keyword", "서울역 카페")
                                .queryParam("province", "서울시")
                                .queryParam("filterValue", "스타벅스")
                                .queryParam("filterType", "COMPANY_NAME")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
                        MockMvcResultMatchers.jsonPath("message").value("success")
                )
                .andDo(
                        document("N플레이스 랭크 실시간 순위 리스트 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .summary("N플레이스 랭크 실시간 순위 리스트 조회")
                                        .description("""
                                                ## N플레이스 랭크 실시간 순위 리스트 조회 엔드포인트 입니다.
                                                                                                
                                                ---
                                                                                                
                                                keyword는 2자 이상 입력해야 하며, 한 글자씩 띄워 쓴 키워드는 검색할 수 없습니다.
                                                                                         
                                                province는 지역명을 입력하면 되며, 서울시, 충청북도 등으로 입력하면 됩니다. 입력하지 않을 시 서울시로 간주합니다.                            
                                                        
                                                filterValue는 상호명 또는 shopId 값을 입력해 주세요. 값이 없을 경우 모든 결과를 반환합니다.
                                                                                                
                                                filterType은 COMPANY_NAME 또는 SHOP_ID로 입력해야 합니다. 입력하지 않을 시 COMPANY_NAME으로 간주합니다.
                                                                                                 
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키"),
                                                parameterWithName("keyword").type(SimpleType.STRING).description("키워드"),
                                                parameterWithName("province").type(SimpleType.STRING).optional().description("지역명 (서울시, 충청북도 등)"),
                                                parameterWithName("filterValue").type(SimpleType.STRING).optional().description("필터값 (스토어명 또는 shopId값)"),
                                                parameterWithName("filterType").type(SimpleType.STRING).optional().description("필터 타입 (COMPANY_NAME 또는 SHOP_ID)")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetRealtimeFailByNoApiKey() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/realtime")
                                .queryParam("keyword", "서울역 카페")
                                .queryParam("filterValue", "스타벅스")
                                .queryParam("filterType", "COMPANY_NAME")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isBadRequest(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
                )
                .andDo(
                        document("N플레이스 랭크 실시간 순위 리스트 조회 실패 - apiKey를 입력하지 않았을 경우",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetRealtimeFailByInvalidApiKey() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/realtime")
                                .queryParam("apiKey", "testtesttest")
                                .queryParam("keyword", "서울역 카페")
                                .queryParam("filterValue", "스타벅스")
                                .queryParam("filterType", "COMPANY_NAME")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isUnauthorized(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.AUTHENTICATION_EXCEPTION)
                )
                .andDo(
                        document("N플레이스 랭크 실시간 순위 리스트 조회 실패 - 잘못된 apiKey를 입력했을 경우",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetRealtimeFailByNoKeyword() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/realtime")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("filterValue", "스타벅스")
                                .queryParam("filterType", "COMPANY_NAME")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isBadRequest(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
                )
                .andDo(
                        document("N플레이스 랭크 실시간 순위 리스트 조회 실패 - keyword를 입력하지 않았을 경우",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetRealtimeFailByShortKeyword() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/realtime")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("keyword", "")
                                .queryParam("filterValue", "스타벅스")
                                .queryParam("filterType", "COMPANY_NAME")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isBadRequest(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                )
                .andDo(
                        document("N플레이스 랭크 실시간 순위 리스트 조회 실패 - keyword를 2자보다 적게 입력했을 경우",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetRealtimeFailByInvalidKeyword() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/realtime")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("keyword", "아 오 리 사 과")
                                .queryParam("filterValue", "농장")
                                .queryParam("filterType", "COMPANY_NAME")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isBadRequest(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                )
                .andDo(
                        document("N플레이스 랭크 실시간 순위 리스트 조회 실패 - keyword를 한 글자씩 띄워쓸 경우",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .build()
                                )
                        )
                );
    }

//    @Test
//    public void testGetRealtimeFailByNoFilterValue() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/realtime")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("keyword", "아오리 사과")
//                                .queryParam("filterType", "COMPANY_NAME")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
//                )
//                .andDo(
//                        document("N플레이스 랭크 실시간 순위 리스트 조회 실패 - filterValue을 입력하지 않았을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N플레이스 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }
//
//    @Test
//    public void testGetRealtimeFailByShortFilterValue() throws Exception {
//        mockMvc.perform(
//                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/realtime")
//                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
//                                .queryParam("keyword", "아오리 사과")
//                                .queryParam("filterValue", "")
//                                .queryParam("filterType", "COMPANY_NAME")
//                )
//                .andExpectAll(
//                        MockMvcResultMatchers.status().isBadRequest(),
//                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.CONSTRAINT_VIOLATION_EXCEPTION)
//                )
//                .andDo(
//                        document("N플레이스 랭크 실시간 순위 리스트 조회 실패 - filterValue을 1자보다 적게 입력했을 경우",
//                                preprocessRequest(prettyPrint()),
//                                preprocessResponse(prettyPrint()),
//                                resource(ResourceSnippetParameters.builder()
//                                        .tag("N플레이스 랭크 스크래핑 V1")
//                                        .build()
//                                )
//                        )
//                );
//    }

    @Test
    public void testGetTrackableSuccess() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/trackable")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("url", "1203311506")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
                        MockMvcResultMatchers.jsonPath("message").value("success")
                )
                .andDo(
                        document("N플레이스 랭크 추적 가능 상품 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .summary("N플레이스 랭크 추적 가능 상품 조회")
                                        .description("""
                                                ## N플레이스 랭크 추적 가능 상품 조회 엔드포인트 입니다.
                                                                                                
                                                ---
                                                                                                 
                                                url은 아래와 같이 4종류 중 하나인 정확한 값을 입력해야 합니다.
                                                                                                
                                                1203311506 (샵ID https://m.place.naver.com/restaurant/1203311506/home 주소에서 1203311506)
                                                                                                
                                                https://m.place.naver.com/restaurant/1203311506/home (모바일 주소)
                                                                                                
                                                https://map.naver.com/p/entry/place/1203311506 (엔트리 주소)
                                                                                                
                                                https://map.naver.com/p/search/%ED%99%8D%EC%B2%A0%EC%B1%85%EB%B9%B5/place/1203311506 (검색 주소)
                                                                                                
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키"),
                                                parameterWithName("url").type(SimpleType.STRING).description("샵ID 또는 모바일/엔트리/검색 주소")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testPostTrackSuccess() throws Exception {
        ReqNplaceRankPostTrackDTOApiV1 reqDto = ReqNplaceRankPostTrackDTOApiV1.builder()
                .nplaceRankTrackInfo(
                        ReqNplaceRankPostTrackDTOApiV1.NplaceRankTrackInfo.builder()
                                .keyword("서울역 카페")
                                .province("서울시")
                                .businessSector("restaurant")
                                .shopId("1203311506")
                                .build()
                )
                .build();
        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
        mockMvc.perform(
                        RestDocumentationRequestBuilders.post("/v1/nplace/rank/track")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .content(reqDtoJson)
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
                        MockMvcResultMatchers.jsonPath("message").value("success")
                )
                .andDo(
                        document("N플레이스 랭크 추적 등록 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .summary("N플레이스 랭크 추적 등록")
                                        .description("""
                                                ## N플레이스 랭크 추적 등록 엔드포인트 입니다.
                                                                                                
                                                ---
                                                                                                
                                                keyword는 2자 이상 입력해야 하며, 한 글자씩 띄워 쓴 키워드는 검색할 수 없습니다.
                                                                             
                                                province는 지역명을 입력하면 되며, 서울시, 충청북도 등으로 입력하면 됩니다.
                                                                             
                                                businessSector는 업종을 입력하면 되며, restaurant, hospital, place 등으로 입력하면 됩니다.
                                                                                                
                                                shopId는 샵ID를 입력하면 됩니다.
                                                                                                
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
                                        )
                                        .requestFields(
                                                fieldWithPath("nplaceRankTrackInfo.keyword").type(SimpleType.STRING).description("키워드"),
                                                fieldWithPath("nplaceRankTrackInfo.province").type(SimpleType.STRING).description("지역명"),
                                                fieldWithPath("nplaceRankTrackInfo.businessSector").type(SimpleType.STRING).description("업종"),
                                                fieldWithPath("nplaceRankTrackInfo.shopId").type(SimpleType.STRING).optional().description("shopId")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetTrackStateSuccess() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/track/state")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk()
                )
                .andDo(
                        document("N플레이스 랭크 추적 상태 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .summary("N플레이스 랭크 추적 상태 조회")
                                        .description("""
                                                ## N플레이스 랭크 추적 상태 조회 엔드포인트 입니다.

                                                ---

                                                추적 상태 조회를 조회합니다.
                                                
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetTrackInfoSuccess() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/rank/track/info")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
                        MockMvcResultMatchers.jsonPath("message").value("success")
                )
                .andDo(
                        document("N플레이스 랭크 등록된 모든 추적 정보 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .summary("N플레이스 랭크 등록된 모든 추적 정보 조회")
                                        .description("""
                                                ## N플레이스 랭크 등록된 추적 모든 정보 조회 엔드포인트 입니다.

                                                ---

                                                등록된 모든 추적 정보를 조회합니다.
                                                
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testPostTrackInfoSuccess() throws Exception {
        ReqNplaceRankPostTrackDTOApiV1 reqDto = ReqNplaceRankPostTrackDTOApiV1.builder()
                .nplaceRankTrackInfo(
                        ReqNplaceRankPostTrackDTOApiV1.NplaceRankTrackInfo.builder()
                                .keyword("서울역 카페")
                                .province("서울시")
                                .businessSector("restaurant")
                                .shopId("1203311506")
                                .build()
                )
                .build();
        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
        MvcResult mvcResult = mockMvc.perform(
                RestDocumentationRequestBuilders.post("/v1/nplace/rank/track")
                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                        .content(reqDtoJson)
                        .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();
        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
        ReqNplaceRankPostTrackInfoDTOApiV1 reqTrackInfoDto = ReqNplaceRankPostTrackInfoDTOApiV1.builder()
                .nplaceRankTrackInfoIdList(List.of(
                        jsonNode.get("data").get("nplaceRankTrackInfo").get("id").asLong()
                ))
                .build();

        String reqTrackInfoDtoJson = objectMapper.writeValueAsString(reqTrackInfoDto);
        mockMvc.perform(
                        RestDocumentationRequestBuilders.post("/v1/nplace/rank/track/info")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .content(reqTrackInfoDtoJson)
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
                        MockMvcResultMatchers.jsonPath("message").value("success")
                )
                .andDo(
                        document("N플레이스 랭크 등록된 추적 정보 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .summary("N플레이스 랭크 등록된 추적 정보 조회")
                                        .description("""
                                                ## N플레이스 랭크 등록된 추적 정보 조회 엔드포인트 입니다.

                                                ---

                                                nplaceRankTrackInfoIdList에 등록된 추적 정보 id리스트를 담아서 요청 합니다.

                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testPostTrackChartSuccess() throws Exception {
        ReqNplaceRankPostTrackDTOApiV1 reqDto = ReqNplaceRankPostTrackDTOApiV1.builder()
                .nplaceRankTrackInfo(
                        ReqNplaceRankPostTrackDTOApiV1.NplaceRankTrackInfo.builder()
                                .keyword("서울역 카페")
                                .province("서울시")
                                .businessSector("restaurant")
                                .shopId("1203311506")
                                .build()
                )
                .build();
        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
        MvcResult mvcResult = mockMvc.perform(
                RestDocumentationRequestBuilders.post("/v1/nplace/rank/track")
                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                        .content(reqDtoJson)
                        .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();
        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
        ReqNplaceRankPostTrackChartDTOApiV1 reqTrackChartDto = ReqNplaceRankPostTrackChartDTOApiV1.builder()
                .nplaceRankTrackInfoList(List.of(
                        ReqNplaceRankPostTrackChartDTOApiV1.NplaceRankTrackInfo.builder()
                                .id(jsonNode.get("data").get("nplaceRankTrackInfo").get("id").asLong())
                                .trackStartDate(LocalDateTime.now().minusNanos(1))
                                .build()
                ))
                .build();
        String reqTrackChartDtoJson = objectMapper.writeValueAsString(reqTrackChartDto);
        mockMvc.perform(
                        RestDocumentationRequestBuilders.post("/v1/nplace/rank/track/chart")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .content(reqTrackChartDtoJson)
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
                        MockMvcResultMatchers.jsonPath("message").value("success")
                )
                .andDo(
                        document("N플레이스 랭크 추적 차트 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .summary("N플레이스 랭크 추적 차트 조회")
                                        .description("""
                                                ## N플레이스 랭크 추적 차트 조회 엔드포인트 입니다.

                                                ---

                                                nplaceRankTrackInfoList에 아래의 값이 포함된 객체를 리스트로 담아주세요.

                                                id : 추적 id
                                                                                                
                                                trackStartDate : 추적 시작 날짜

                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testDeleteTrackSuccess() throws Exception {
        ReqNplaceRankPostTrackDTOApiV1 reqDto = ReqNplaceRankPostTrackDTOApiV1.builder()
                .nplaceRankTrackInfo(
                        ReqNplaceRankPostTrackDTOApiV1.NplaceRankTrackInfo.builder()
                                .keyword("서울역 카페")
                                .province("서울시")
                                .businessSector("restaurant")
                                .shopId("1203311506")
                                .build()
                )
                .build();
        String reqDtoJson = objectMapper.writeValueAsString(reqDto);
        MvcResult mvcResult = mockMvc.perform(
                RestDocumentationRequestBuilders.post("/v1/nplace/rank/track")
                        .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                        .content(reqDtoJson)
                        .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();
        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
        Long nplaceRankTrackInfoId = jsonNode.get("data").get("nplaceRankTrackInfo").get("id").asLong();
        mockMvc.perform(
                        RestDocumentationRequestBuilders.delete(
                                        "/v1/nplace/rank/track/{nplaceRankTrackInfoId}",
                                        nplaceRankTrackInfoId
                                )
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
                        MockMvcResultMatchers.jsonPath("message").value("success")
                )
                .andDo(
                        document("N플레이스 랭크 추적 삭제 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 랭크 스크래핑 V1")
                                        .summary("N플레이스 랭크 추적 삭제")
                                        .description("""
                                                ## N플레이스 랭크 추적 삭제 엔드포인트 입니다.
                                                                                                
                                                ---
                                                
                                                주의! 개별 이용자의 추적 정보가 아닌 APIKEY 유저 단위로 삭제됩니다. 
                                                                                    
                                                nplaceRankTrackInfo의 id를 입력합니다.
                                                                                    
                                                """)
                                        .pathParameters(
                                                parameterWithName("nplaceRankTrackInfoId").type(SimpleType.NUMBER).description("추적 ID")
                                        )
                                        .queryParameters(
                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키")
                                        )
                                        .build()
                                )
                        )
                );
    }
}
