package kr.co.nomadlab.nomadrank.domain.nstore.keyword.dto.response;

import kr.co.nomadlab.nomadrank.model_external.nblog.dto.response.ResNblogSearchInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNstoreKeywordGetNblogSearchInfoDTOApiV1 {

    private Result result;

    public static ResNstoreKeywordGetNblogSearchInfoDTOApiV1 of(
            ResNblogSearchInfoDTO.Result resNblogSearchInfoResult
    ) {
        return ResNstoreKeywordGetNblogSearchInfoDTOApiV1.builder()
                .result(Result.fromResNblogSearchInfoResult(resNblogSearchInfoResult))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Result {
        private SearchDisplayInfo searchDisplayInfo;
        private Integer totalCount;
        private Boolean isAdultUser;

        public static Result fromResNblogSearchInfoResult(ResNblogSearchInfoDTO.Result resNblogSearchInfoResult) {
            return Result.builder()
                    .searchDisplayInfo(SearchDisplayInfo.fromResNblogSearchInfoResultSearchDisplayInfo(resNblogSearchInfoResult.getSearchDisplayInfo()))
                    .totalCount(resNblogSearchInfoResult.getTotalCount())
                    .isAdultUser(resNblogSearchInfoResult.getIsAdultUser())
                    .build();
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class SearchDisplayInfo {
            private String keyword;

            public static SearchDisplayInfo fromResNblogSearchInfoResultSearchDisplayInfo(ResNblogSearchInfoDTO.Result.SearchDisplayInfo resNblogSearchInfoResultSearchDisplayInfo) {
                return SearchDisplayInfo.builder()
                        .keyword(resNblogSearchInfoResultSearchDisplayInfo.getKeyword())
                        .build();
            }
        }

    }

}
