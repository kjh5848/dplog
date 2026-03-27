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
public class ResNplaceMissionGetMallDetailDTOApiV1 {

    private JsonNode nplaceMissionMall;

    public static ResNplaceMissionGetMallDetailDTOApiV1 of(JsonNode jsonNode) {
        return ResNplaceMissionGetMallDetailDTOApiV1.builder()
                .nplaceMissionMall(jsonNode)
                .build();
    }

}
