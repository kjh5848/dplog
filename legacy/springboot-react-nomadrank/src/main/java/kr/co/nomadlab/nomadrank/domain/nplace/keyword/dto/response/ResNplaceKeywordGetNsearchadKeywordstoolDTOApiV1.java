package kr.co.nomadlab.nomadrank.domain.nplace.keyword.dto.response;

import kr.co.nomadlab.nomadrank.model_external.nsearchad.dto.response.ResNsearchadKeywordstoolDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceKeywordGetNsearchadKeywordstoolDTOApiV1 {

    private List<KeywordTool> keywordToolList;

    public static ResNplaceKeywordGetNsearchadKeywordstoolDTOApiV1 of(
            List<ResNsearchadKeywordstoolDTO.Keyword> resNsearchadKeywordstoolKeywordList
    ) {
        return ResNplaceKeywordGetNsearchadKeywordstoolDTOApiV1.builder()
                .keywordToolList(KeywordTool.fromResNsearchadKeywordstoolKeywordList(resNsearchadKeywordstoolKeywordList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KeywordTool {
        private String relKeyword;
        private Integer monthlyPcQcCnt;
        private Integer monthlyMobileQcCnt;
        private Double monthlyAvePcClkCnt;
        private Double monthlyAveMobileClkCnt;
        private Double monthlyAvePcCtr;
        private Double monthlyAveMobileCtr;
        private Integer plAvgDepth;
        private String compIdx;

        public static List<KeywordTool> fromResNsearchadKeywordstoolKeywordList(List<ResNsearchadKeywordstoolDTO.Keyword> resNsearchadKeywordstoolKeywordList) {
            return resNsearchadKeywordstoolKeywordList.stream()
                    .map(KeywordTool::fromNsearchadKeywordstoolKeyword)
                    .toList();
        }

        public static KeywordTool fromNsearchadKeywordstoolKeyword(ResNsearchadKeywordstoolDTO.Keyword nsearchadKeywordstoolKeyword) {
            return KeywordTool.builder()
                    .relKeyword(nsearchadKeywordstoolKeyword.getRelKeyword())
                    .monthlyPcQcCnt(
                            Integer.parseInt(nsearchadKeywordstoolKeyword.getMonthlyPcQcCnt().replace("<", "").replace(" ", ""))
                    )
                    .monthlyMobileQcCnt(
                            Integer.parseInt(nsearchadKeywordstoolKeyword.getMonthlyMobileQcCnt().replace("<", "").replace(" ", ""))
                    )
                    .monthlyAvePcClkCnt(nsearchadKeywordstoolKeyword.getMonthlyAvePcClkCnt())
                    .monthlyAveMobileClkCnt(nsearchadKeywordstoolKeyword.getMonthlyAveMobileClkCnt())
                    .monthlyAvePcCtr(nsearchadKeywordstoolKeyword.getMonthlyAvePcCtr())
                    .monthlyAveMobileCtr(nsearchadKeywordstoolKeyword.getMonthlyAveMobileCtr())
                    .plAvgDepth(nsearchadKeywordstoolKeyword.getPlAvgDepth())
                    .compIdx(nsearchadKeywordstoolKeyword.getCompIdx())
                    .build();
        }
    }

}
