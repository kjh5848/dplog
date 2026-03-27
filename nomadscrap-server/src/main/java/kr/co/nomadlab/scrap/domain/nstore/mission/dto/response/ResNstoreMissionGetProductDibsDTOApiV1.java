package kr.co.nomadlab.scrap.domain.nstore.mission.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNstoreMissionGetProductDibsDTOApiV1 {

    private JsonNode nstoreMissionProduct;

    public static ResNstoreMissionGetProductDibsDTOApiV1 of(JsonNode jsonNode) {
        return ResNstoreMissionGetProductDibsDTOApiV1.builder()
                .nstoreMissionProduct(jsonNode)
                .build();
    }

}
