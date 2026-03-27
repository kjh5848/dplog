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
public class ResNstoreMissionGetMallFeedDTOApiV1 {

    private JsonNode nstoreMissionMall;

    public static ResNstoreMissionGetMallFeedDTOApiV1 of(JsonNode jsonNode) {
        return ResNstoreMissionGetMallFeedDTOApiV1.builder()
                .nstoreMissionMall(jsonNode)
                .build();
    }

}
