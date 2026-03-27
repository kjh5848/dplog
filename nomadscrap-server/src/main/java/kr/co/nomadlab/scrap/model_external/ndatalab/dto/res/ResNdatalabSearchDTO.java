package kr.co.nomadlab.scrap.model_external.ndatalab.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNdatalabSearchDTO {

    private LocalDate startDate;
    private LocalDate endDate;
    private String timeUnit;
    private List<Result> results;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Result {

        private String title;
        private List<String> keywords;
        private List<DataElement> data;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class DataElement {

            private String period;
            private Double ratio;

        }

    }

}
