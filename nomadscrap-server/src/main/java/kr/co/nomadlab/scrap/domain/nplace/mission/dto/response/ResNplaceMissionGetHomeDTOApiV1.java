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
public class ResNplaceMissionGetHomeDTOApiV1 {

    private JsonNode nplaceMissionHome;

    public static ResNplaceMissionGetHomeDTOApiV1 of(JsonNode jsonNode) {
        return ResNplaceMissionGetHomeDTOApiV1.builder()
                .nplaceMissionHome(jsonNode)
                .build();
    }

}
