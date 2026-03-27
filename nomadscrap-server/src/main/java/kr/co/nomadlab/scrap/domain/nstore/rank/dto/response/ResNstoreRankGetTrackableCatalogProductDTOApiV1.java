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
public class ResNstoreRankGetTrackableCatalogProductDTOApiV1 {

    private List<JsonNode> nstoreRankCatalogProductList;

    public static ResNstoreRankGetTrackableCatalogProductDTOApiV1 of(List<JsonNode> jsonNodeList) {
        return ResNstoreRankGetTrackableCatalogProductDTOApiV1.builder()
                .nstoreRankCatalogProductList(jsonNodeList)
                .build();
    }
}