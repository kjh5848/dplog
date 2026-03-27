package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNomadscrapNplaceRankDeleteTrackDTO {

    private Integer code;
    private String message;

}
