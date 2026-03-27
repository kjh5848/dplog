package kr.co.nomadlab.scrap.domain.nstore.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNstoreRankGetTrackableProductDTOApiV1 {

    private JsonNode nstoreRankProduct;

    public static ResNstoreRankGetTrackableProductDTOApiV1 of(JsonNode jsonNode) {
        return ResNstoreRankGetTrackableProductDTOApiV1.builder()
                .nstoreRankProduct(jsonNode)
                .build();
    }
}