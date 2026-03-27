package kr.co.nomadlab.nomadrank.model_external.nsearchad.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNsearchadKeywordstoolDTO {

    private List<Keyword> keywordList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Keyword {
        private String relKeyword;
        private String monthlyPcQcCnt;
        private String monthlyMobileQcCnt;
        private Double monthlyAvePcClkCnt;
        private Double monthlyAveMobileClkCnt;
        private Double monthlyAvePcCtr;
        private Double monthlyAveMobileCtr;
        private Integer plAvgDepth;
        private String compIdx;
    }

}
