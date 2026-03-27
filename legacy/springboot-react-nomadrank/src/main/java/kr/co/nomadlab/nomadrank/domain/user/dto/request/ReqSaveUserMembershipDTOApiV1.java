package kr.co.nomadlab.nomadrank.domain.user.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqSaveUserMembershipDTOApiV1 {

    @Valid
    @NotNull(message = "membership를 입력하세요.")
    private Membership membership;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Membership {
        @NotNull(message = "멤버십 ID는 필수입니다.")
        private Long membershipId;

        @NotNull(message = "시작일은 필수입니다.")
        private String startDate;

        private String endDate;

        public LocalDate getStartDateAsLocalDate() {
            return LocalDate.parse(startDate);
        }

        public LocalDate getEndDateAsLocalDate() {
            return endDate != null && !endDate.isBlank() ? LocalDate.parse(endDate) : null;
        }

    }

    public MembershipUserEntity toMembershipUserEntity(UserEntity userEntity, MembershipEntity membershipEntity) {
        LocalDate now = LocalDate.now();
        LocalDate startDate = membership.getStartDateAsLocalDate();

        MembershipState state = startDate.isEqual(now)
                ? MembershipState.ACTIVATE
                : MembershipState.READY;

        return MembershipUserEntity.builder()
                .userEntity(userEntity)
                .membershipEntity(membershipEntity)
                .startDate(membership.getStartDateAsLocalDate())
                .endDate(membership.getEndDateAsLocalDate())
                .membershipState(state)
                .build();
    }

}
