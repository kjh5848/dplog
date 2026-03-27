package kr.co.nomadlab.nomadrank.domain.point.dto.response;

import kr.co.nomadlab.nomadrank.domain.point.enums.PointChargeStatus;
import kr.co.nomadlab.nomadrank.model.point.entity.PointChargeEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResPointChangeListApiV1 {

    List<PointCharge> pointChargeList;

    public static ResPointChangeListApiV1 of(List<PointChargeEntity> pointChargeEntityList) {
        return ResPointChangeListApiV1.builder()
                .pointChargeList(ResPointChangeListApiV1.PointCharge.fromPointChargeEntityList(pointChargeEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PointCharge {
        private String name;
        private LocalDateTime createDate;
        private String amount;
        private Integer balance;
        private String status;


        public static List<PointCharge> fromPointChargeEntityList(List<PointChargeEntity> pointChargeEntityList) {
            return pointChargeEntityList.stream()
                    .map(PointCharge::fromPointChargeEntity)
                    .toList();
        }

        public static PointCharge fromPointChargeEntity(PointChargeEntity pointChargeEntity) {
            return PointCharge.builder()
                    .name(pointChargeEntity.getUserEntity().getCompanyName() + "(" + pointChargeEntity.getUserEntity().getUsername() + ")")
                    .createDate(pointChargeEntity.getCreateDate())
                    .amount(getSignByStatus(pointChargeEntity.getStatus()) + pointChargeEntity.getAmount())
                    .balance(pointChargeEntity.getBalance())
                    .status(pointChargeEntity.getStatus().getValue())
                    .build();
        }

        private static String getSignByStatus(PointChargeStatus pointChargeStatus) {
            return switch (pointChargeStatus) {
                case DEPOSIT -> "+";
                case USE, WITHDRAW -> "-";
                default -> "";
            };
        }
    }


}
