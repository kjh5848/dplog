package kr.co.nomadlab.scrap.domain.kgift.mission.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResKgiftMissionGetProductWishDTOApiV1 {

    private JsonNode kgiftMissionProduct;

    public static ResKgiftMissionGetProductWishDTOApiV1 of(JsonNode jsonNode) {
        return ResKgiftMissionGetProductWishDTOApiV1.builder()
                .kgiftMissionProduct(jsonNode)
                .build();
    }

}
