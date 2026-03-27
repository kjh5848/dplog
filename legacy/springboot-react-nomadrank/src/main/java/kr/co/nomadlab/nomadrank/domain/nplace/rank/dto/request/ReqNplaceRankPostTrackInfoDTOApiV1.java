package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request;

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
public class ReqNplaceRankPostTrackInfoDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRankTrackInfoIdList를 입력하세요.")
    private List<Long> nplaceRankTrackInfoIdList;

}
