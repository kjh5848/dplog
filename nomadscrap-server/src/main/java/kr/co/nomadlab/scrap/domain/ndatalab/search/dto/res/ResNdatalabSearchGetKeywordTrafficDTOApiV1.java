package kr.co.nomadlab.scrap.domain.ndatalab.search.dto.res;

import kr.co.nomadlab.scrap.model_external.ndatalab.dto.res.ResNdatalabSearchDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNdatalabSearchGetKeywordTrafficDTOApiV1 {

    private NdatalabSearchKeywordTraffic ndatalabSearchKeywordTraffic;

    public static ResNdatalabSearchGetKeywordTrafficDTOApiV1 of(ResNdatalabSearchDTO resNdatalabSearchDTO) {
        return ResNdatalabSearchGetKeywordTrafficDTOApiV1.builder()
                .ndatalabSearchKeywordTraffic(NdatalabSearchKeywordTraffic.fromEntity(resNdatalabSearchDTO))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NdatalabSearchKeywordTraffic {

        private String peakDate;

        public static NdatalabSearchKeywordTraffic fromEntity(ResNdatalabSearchDTO resNdatalabSearchDTO) {
            if (resNdatalabSearchDTO.getResults().isEmpty()
                    || resNdatalabSearchDTO.getResults().get(0).getData().isEmpty()
            ) {
                return NdatalabSearchKeywordTraffic.builder()
                        .peakDate(null)
                        .build();
            }
            ResNdatalabSearchDTO.Result.DataElement dataElement = null;
            for (ResNdatalabSearchDTO.Result.DataElement dataElementForFiltering : resNdatalabSearchDTO.getResults().get(0).getData()) {
                if (dataElement == null) {
                    dataElement = dataElementForFiltering;
                } else {
                    if (dataElementForFiltering.getRatio() > dataElement.getRatio()) {
                        dataElement = dataElementForFiltering;
                    }
                }
            }
            return NdatalabSearchKeywordTraffic.builder()
                    .peakDate(dataElement.getPeriod().substring(0, 7))
                    .build();
        }

    }

}
