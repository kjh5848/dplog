package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNomadscrapNstoreRankPostTrackInfoDTO {

    private List<Long> nstoreRankTrackInfoIdList;

}
