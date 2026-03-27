package kr.co.nomadlab.nomadrank.domain.point.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.point.enums.PointChargeStatus;
import kr.co.nomadlab.nomadrank.model.point.entity.PointChargeEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqPointApplyPostDTOApiV1 {

    @Valid
    @NotNull(message = "point를 입력하세요.")
    private Point point;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Point {
        @NotNull(message = "point를 입력하세요.")
        private Integer point;

    }

    public PointChargeEntity toPointChargeEntity(UserEntity userEntity) {
        return PointChargeEntity.builder()
                .userEntity(userEntity)
                .amount(point.getPoint())
                .balance(userEntity.getBalance())
                .status(PointChargeStatus.WAIT)
                .build();
    }

}
