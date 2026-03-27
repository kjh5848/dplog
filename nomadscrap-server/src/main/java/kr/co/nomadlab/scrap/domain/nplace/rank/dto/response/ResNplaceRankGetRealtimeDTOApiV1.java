package kr.co.nomadlab.scrap.domain.nplace.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRankGetRealtimeDTOApiV1 {

    private List<JsonNode> nplaceRankSearchShopList;

    public static ResNplaceRankGetRealtimeDTOApiV1 of(List<JsonNode> jsonNodeList) {
        return ResNplaceRankGetRealtimeDTOApiV1.builder()
                .nplaceRankSearchShopList(jsonNodeList)
                .build();
    }

}
