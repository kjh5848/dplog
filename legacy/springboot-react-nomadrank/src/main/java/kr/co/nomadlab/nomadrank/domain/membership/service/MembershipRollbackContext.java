package kr.co.nomadlab.nomadrank.domain.membership.service;

import java.time.LocalDate;

import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MembershipRollbackContext {

    private final Long userId;

    private final Long activatedMembershipId;
    private final MembershipState activatedPreviousState;
    private final LocalDate activatedPreviousEndDate;

    private final Long previousMembershipId;
    private final MembershipState previousMembershipState;
    private final LocalDate previousMembershipEndDate;
}
