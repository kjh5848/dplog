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
public class ResNstoreRankGetTrackableDetailDTOApiV1 {

    private JsonNode nstoreRankProduct;

    public static ResNstoreRankGetTrackableDetailDTOApiV1 of(JsonNode jsonNode) {
        return ResNstoreRankGetTrackableDetailDTOApiV1.builder()
                .nstoreRankProduct(jsonNode)
                .build();
    }
}