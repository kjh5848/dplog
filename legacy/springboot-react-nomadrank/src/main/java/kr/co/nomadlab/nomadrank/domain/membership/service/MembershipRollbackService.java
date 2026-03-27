package kr.co.nomadlab.nomadrank.domain.membership.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipRollbackService {

    private final MembershipUserRepository membershipUserRepository;

    @Transactional
    public void rollbackToPreviousPlan(MembershipRollbackContext context) {
        if (context == null) {
            return;
        }

        restoreActivatedMembership(context);
        restorePreviousMembership(context);
    }

    private void restoreActivatedMembership(MembershipRollbackContext context) {
        if (context.getActivatedMembershipId() == null) {
            return;
        }

        membershipUserRepository.findById(context.getActivatedMembershipId()).ifPresent(membership -> {
            MembershipState targetState = context.getActivatedPreviousState() != null
                    ? context.getActivatedPreviousState()
                    : MembershipState.READY;

            membership.setMembershipState(targetState);
            membership.setEndDate(context.getActivatedPreviousEndDate());
            membershipUserRepository.save(membership);

            log.info("[MembershipRollback] 새 멤버십 롤백 - membershipId={}, state={}",
                    membership.getId(), targetState);
        });
    }

    private void restorePreviousMembership(MembershipRollbackContext context) {
        if (context.getPreviousMembershipId() == null) {
            return;
        }

        membershipUserRepository.findById(context.getPreviousMembershipId()).ifPresent(previous -> {
            MembershipState targetState = context.getPreviousMembershipState() != null
                    ? context.getPreviousMembershipState()
                    : MembershipState.ACTIVATE;
            previous.setMembershipState(targetState);
            previous.setEndDate(context.getPreviousMembershipEndDate());
            membershipUserRepository.save(previous);

            log.info("[MembershipRollback] 기존 멤버십 복원 - membershipId={}, state={}",
                    previous.getId(), targetState);
        });
    }
}
