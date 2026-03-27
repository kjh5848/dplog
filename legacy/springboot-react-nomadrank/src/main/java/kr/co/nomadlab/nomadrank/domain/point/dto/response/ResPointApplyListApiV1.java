package kr.co.nomadlab.nomadrank.domain.point.dto.response;

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
public class ResPointApplyListApiV1 {

    List<PointApply> pointApplyList;

    public static ResPointApplyListApiV1 of(List<PointChargeEntity> pointApplyEntityList) {
        return ResPointApplyListApiV1.builder()
                .pointApplyList(ResPointApplyListApiV1.PointApply.fromPointApplyEntityList(pointApplyEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PointApply {
        private Long id;
        private String name;
        private LocalDateTime createDate;
        private LocalDateTime updateDate;
        private Integer amount;
        private String status;
        private String statusName;


        public static List<PointApply> fromPointApplyEntityList(List<PointChargeEntity> pointApplyEntityList) {
            return pointApplyEntityList.stream()
                    .map(PointApply::fromPointApplyEntity)
                    .toList();
        }

        public static PointApply fromPointApplyEntity(PointChargeEntity pointApplyEntity) {
            return PointApply.builder()
                    .id(pointApplyEntity.getId())
                    .name(pointApplyEntity.getUserEntity().getCompanyName() + "(" + pointApplyEntity.getUserEntity().getUsername() + ")")
                    .createDate(pointApplyEntity.getCreateDate())
                    .updateDate(pointApplyEntity.getUpdateDate())
                    .amount(pointApplyEntity.getAmount())
                    .status(pointApplyEntity.getStatus().toString())
                    .statusName(pointApplyEntity.getStatus().getValue())
                    .build();
        }
    }
}
