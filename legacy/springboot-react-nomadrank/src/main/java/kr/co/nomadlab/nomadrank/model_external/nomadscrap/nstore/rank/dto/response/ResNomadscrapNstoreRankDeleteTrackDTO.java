package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNomadscrapNstoreRankDeleteTrackDTO {

    private Integer code;
    private String message;

}
