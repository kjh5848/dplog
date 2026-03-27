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
public class ResKgiftMissionGetReviewEmpathyDTOApiV1 {

    private JsonNode kgiftMissionReview;

    public static ResKgiftMissionGetReviewEmpathyDTOApiV1 of(JsonNode jsonNode) {
        return ResKgiftMissionGetReviewEmpathyDTOApiV1.builder()
                .kgiftMissionReview(jsonNode)
                .build();
    }

}
