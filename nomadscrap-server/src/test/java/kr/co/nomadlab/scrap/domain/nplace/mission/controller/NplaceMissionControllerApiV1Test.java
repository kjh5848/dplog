package kr.co.nomadlab.scrap.domain.nplace.mission.controller;

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
import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;

@SpringBootTest
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("dev")
public class NplaceMissionControllerApiV1Test {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetHomeSuccess() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/mission/home")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("url", "https://m.place.naver.com/restaurant/1008616984/home")
                                .queryParam("filter", "phone")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
                )
                .andDo(
                        document("N플레이스 미션 홈 정보 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 미션 스크래핑 V1")
                                        .summary("N플레이스 미션 홈 정보 조회")
                                        .description("""
                                                ## N플레이스 미션 홈 정보 조회 엔드포인트 입니다.
                                                                                                
                                                ---
                                                
                                                ### filter 정보
                                                - phone : 전화번호
                                                                                        
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").description("API 키"),
                                                parameterWithName("url").description("URL"),
                                                parameterWithName("filter").description("필터")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetAroundSuccess() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/mission/around")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("url", "https://m.place.naver.com/restaurant/1008616984/home")
                                .queryParam("filter", "100")
                                .queryParam("tag", "100010")
                                .queryParam("answerIndex", "2")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
                )
                .andDo(
                        document("N플레이스 미션 주변 정보 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 미션 스크래핑 V1")
                                        .summary("N플레이스 미션 주변 정보 조회")
                                        .description("""
                                                ## N플레이스 미션 주변 정보 조회 엔드포인트 입니다.
                                                                                                
                                                ---
                                                
                                                ### filter 정보
                                                - 100 : 명소
                                                
                                                                                               
                                                ### tag 정보
                                                - 미입력 : 전체
                                                - 100010 : 공원
                                                                                    
                                                ### answerIndex 정보
                                                - 정답 위치
                                                - 1 ~ 5 만 입력 가능, 랜덤의 경우 0 입력
                                                - 랜덤을 선택할 경우 주변의 한글 이름을 가진 장소를 반환합니다.
                                                                           
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").description("API 키"),
                                                parameterWithName("url").description("URL"),
                                                parameterWithName("filter").description("필터"),
                                                parameterWithName("tag").optional().description("태그"),
                                                parameterWithName("answerIndex").description("정답 위치")
                                        )
                                        .build()
                                )
                        )
                );
    }

    @Test
    public void testGetMallFeedSuccess() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/nplace/mission/mall-bookmark")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("mallId", "1008616984")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK),
                        MockMvcResultMatchers.jsonPath("message").value("success")
                )
                .andDo(
                        document("N플레이스 미션 몰 저장 정보 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N플레이스 미션 스크래핑 V1")
                                        .summary("N플레이스 미션 몰 저장 정보 조회")
                                        .description("""
                                                ## N플레이스 미션 몰 저장 정보 조회 엔드포인트 입니다.
                                                                                                
                                                ---
                                                                                        
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").description("API 키"),
                                                parameterWithName("mallId").description("N플레이스 몰 ID")
                                        )
                                        .build()
                                )
                        )
                );
    }
}
