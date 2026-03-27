package kr.co.nomadlab.scrap.domain.nstore.rank.dto.response;

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
public class ResNstoreRankGetTrackableMallProductDTOApiV1 {

    private List<JsonNode> nstoreRankMallProductList;

    public static ResNstoreRankGetTrackableMallProductDTOApiV1 of(List<JsonNode> jsonNodeList) {
        return ResNstoreRankGetTrackableMallProductDTOApiV1.builder()
                .nstoreRankMallProductList(jsonNodeList)
                .build();
    }
}