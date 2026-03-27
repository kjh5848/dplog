package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNomadscrapNstoreRankGetTrackableDTO {

    private Integer code;
    private String message;
    private JsonNode data;

}