package kr.co.nomadlab.scrap.domain.nplace.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRankGetTrackableDTOApiV1 {

    private JsonNode nplaceRankShop;

    public static ResNplaceRankGetTrackableDTOApiV1 of(JsonNode jsonNode) {
        return ResNplaceRankGetTrackableDTOApiV1.builder()
                .nplaceRankShop(jsonNode)
                .build();
    }
}