package kr.co.nomadlab.scrap.domain.ndatalab.search.controller;

import com.epages.restdocs.apispec.ResourceSnippetParameters;
import com.epages.restdocs.apispec.SimpleType;
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
public class NdatalabSearchControllerApiV1Test {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetKeywordTraffic() throws Exception {
        mockMvc.perform(
                        RestDocumentationRequestBuilders.get("/v1/ndatalab/search/keyword-traffic")
                                .queryParam("apiKey", "77687a4cb07e44f4b79302abfd122911")
                                .queryParam("keyword", "범내골술집")
                                .queryParam("keywordTraffic", "범내골술집")
                )
                .andExpectAll(
                        MockMvcResultMatchers.status().isOk(),
                        MockMvcResultMatchers.jsonPath("code").value(Constants.ResCode.OK)
                )
                .andDo(
                        document("N데이터랩 검색 키워드 트래픽 조회 성공",
                                preprocessRequest(prettyPrint()),
                                preprocessResponse(prettyPrint()),
                                resource(ResourceSnippetParameters.builder()
                                        .tag("N데이터랩 검색 스크래핑 V1")
                                        .summary("N데이터랩 검색 키워드 트래픽 조회")
                                        .description("""
                                                ## N데이터랩 검색 키워드 트래픽 조회 엔드포인트 입니다.
                                                
                                                ---
                                                
                                                keyword, keywordTraffic은 2자 이상 입력해야 하며, 한 글자씩 띄워 쓴 키워드는 검색할 수 없습니다.
                                                
                                                """)
                                        .queryParameters(
                                                parameterWithName("apiKey").type(SimpleType.STRING).description("API 키"),
                                                parameterWithName("keyword").type(SimpleType.STRING).description("키워드"),
                                                parameterWithName("keywordTraffic").type(SimpleType.STRING).description("키워드 트래픽")
                                        )
                                        .build()
                                )
                        )
                );
    }
}
