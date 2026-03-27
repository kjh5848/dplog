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
public class ResNstoreRankGetRealtimeDTOApiV1 {

    private List<JsonNode> nstoreRankSearchProductList;

    public static ResNstoreRankGetRealtimeDTOApiV1 of(List<JsonNode> jsonNodeList) {
        return ResNstoreRankGetRealtimeDTOApiV1.builder()
                .nstoreRankSearchProductList(jsonNodeList)
                .build();
    }
}