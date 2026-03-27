package kr.co.nomadlab.nomadrank.model_external.nblog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNblogSearchInfoDTO {

    private Result result;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Result {
        private SearchDisplayInfo searchDisplayInfo;
        private Integer totalCount;
        private Boolean isAdultUser;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class SearchDisplayInfo {
            private String keyword;
        }

    }

}
