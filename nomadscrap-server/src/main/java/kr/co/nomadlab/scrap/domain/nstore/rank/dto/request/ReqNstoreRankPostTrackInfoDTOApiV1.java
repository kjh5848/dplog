package kr.co.nomadlab.scrap.domain.nstore.rank.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNstoreRankPostTrackInfoDTOApiV1 {

    @Valid
    @NotNull(message = "nstoreRankTrackInfoIdList를 입력하세요.")
    private List<Long> nstoreRankTrackInfoIdList;

}
