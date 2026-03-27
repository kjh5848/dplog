package kr.co.nomadlab.nomadrank.domain.nplace.keyword.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceKeywordPostNsearchadKeywordstoolDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceCampaignBlogWriters를 입력하세요.")
    private NplaceKeywordNsearchadKeywordstoolKeyword nplaceKeywordNsearchadKeywordstoolKeyword;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceKeywordNsearchadKeywordstoolKeyword {
        private String keywordString;
    }

}
