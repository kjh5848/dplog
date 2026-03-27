package kr.co.nomadlab.nomadrank.model_external.nblog.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.model_external.nblog.dto.response.ResNblogSearchInfoDTO;
import kr.co.nomadlab.nomadrank.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.ZoneId;

@Slf4j
@Repository
@RequiredArgsConstructor
public class NblogRepository {

    private final ObjectMapper objectMapper;

    public synchronized ResNblogSearchInfoDTO getNblogSearchInfo(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return ResNblogSearchInfoDTO.builder()
                    .result(ResNblogSearchInfoDTO.Result.builder()
                            .totalCount(0)
                            .isAdultUser(false)
                            .build())
                    .build();
        }
        String keywordWithTrim = keyword.replaceAll(" ", "");
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("https://section.blog.naver.com/ajax/SearchList.naver")
                .queryParam("keyword", keyword)
                .queryParam("startDate", LocalDate.now(ZoneId.of("Asia/Seoul")).withDayOfMonth(1).toString())
                .queryParam("endDate", LocalDate.now(ZoneId.of("Asia/Seoul")).toString())
                .queryParam("orderBy", "sim")
                .queryParam("countPerPage", "1")
                .queryParam("currentPage", "1")
                .queryParam("type", "post")
                .build();
        ResponseEntity<String> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .get()
                .uri(uriComponents.toUriString())
                .header("Referer", "https://section.blog.naver.com/Search/Post.naver")
                .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
                .block();
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new NomadscrapException("블로그 정보 API 호출에 실패했습니다. " + responseEntity.getBody());
        }
        ResNblogSearchInfoDTO resNblogSearchInfoDTO = null;
        try {
            resNblogSearchInfoDTO = objectMapper.readValue(responseEntity.getBody().replaceFirst("\\)]}',", ""), ResNblogSearchInfoDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("블로그 정보 API 호출에 실패했습니다. " + e.getMessage());
        }
        return resNblogSearchInfoDTO;
    }
}
