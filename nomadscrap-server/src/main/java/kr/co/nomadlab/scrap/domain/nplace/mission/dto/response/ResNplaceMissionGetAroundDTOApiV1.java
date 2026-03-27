package kr.co.nomadlab.scrap.domain.nplace.mission.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceMissionGetAroundDTOApiV1 {

    private JsonNode nplaceMissionAround;

    public static ResNplaceMissionGetAroundDTOApiV1 of(JsonNode jsonNode) {
        return ResNplaceMissionGetAroundDTOApiV1.builder()
                .nplaceMissionAround(jsonNode)
                .build();
    }

}
