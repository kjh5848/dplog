package kr.co.nomadlab.nomadrank.domain.membership.dto.response;

import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResMembershipCurrentDTOApiV1 {
    
    private Long membershipId;
    private String membershipName;
    private LocalDate startDate;
    private LocalDate endDate;
    private MembershipState membershipState;
    private Long remainingDays;
    private Integer point;

    public static ResMembershipCurrentDTOApiV1 of(MembershipUserEntity membershipUserEntity) {
        if (membershipUserEntity == null) {
            return null;
        }
        
        LocalDate today = LocalDate.now();
        Long remainingDays = null;
        
        if (membershipUserEntity.getEndDate() != null) {
            if (membershipUserEntity.getEndDate().isAfter(today)) {
                remainingDays = ChronoUnit.DAYS.between(today, membershipUserEntity.getEndDate());
            } else {
                remainingDays = 0L;
            }
        }

        return ResMembershipCurrentDTOApiV1.builder()
                .membershipId(membershipUserEntity.getMembershipEntity().getId())
                .membershipName(membershipUserEntity.getMembershipEntity().getName())
                .startDate(membershipUserEntity.getStartDate())
                .endDate(membershipUserEntity.getEndDate())
                .membershipState(membershipUserEntity.getMembershipState())
                .remainingDays(remainingDays)
                .point(membershipUserEntity.getMembershipEntity().getPoint())
                .build();
    }
}
