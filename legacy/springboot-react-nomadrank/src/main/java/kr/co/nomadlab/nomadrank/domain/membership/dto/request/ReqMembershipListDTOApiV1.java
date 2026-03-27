package kr.co.nomadlab.nomadrank.domain.membership.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqMembershipListDTOApiV1 {

    @Valid
    @NotNull(message = "userAuthoritySort를 입력하세요.")
    private UserAuthoritySort userAuthoritySort;
}
