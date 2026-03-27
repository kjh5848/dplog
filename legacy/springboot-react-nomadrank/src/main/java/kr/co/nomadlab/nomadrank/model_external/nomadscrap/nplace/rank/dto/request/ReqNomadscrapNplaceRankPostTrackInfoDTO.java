package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNomadscrapNplaceRankPostTrackInfoDTO {

    private List<Long> nplaceRankTrackInfoIdList;

}
