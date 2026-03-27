package kr.co.nomadlab.nomadrank.domain.membership.dto.response.component;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipUsageDTO {
    private Integer used;
    private Integer limit;
    private String period;
}
