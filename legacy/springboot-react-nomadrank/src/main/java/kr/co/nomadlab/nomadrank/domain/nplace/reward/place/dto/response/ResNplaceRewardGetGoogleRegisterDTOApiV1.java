package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.response;

import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardShopKeywordRegisterStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRewardGetGoogleRegisterDTOApiV1 {

    private Long registerId;
    private boolean approved;

}
