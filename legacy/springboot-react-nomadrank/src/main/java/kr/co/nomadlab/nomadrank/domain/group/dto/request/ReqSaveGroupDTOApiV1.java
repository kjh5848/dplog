package kr.co.nomadlab.nomadrank.domain.group.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqSaveGroupDTOApiV1 {

    @Valid
    @NotNull(message = "group를 입력하세요.")
    private Group group;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Group {

        @NotNull(message = "상품은 필수입니다.")
        private ServiceSort serviceSort;

        @NotNull(message = "그룹명은 필수입니다.")
        private String groupName;

        private String memo;
    }


    public GroupEntity toGroupEntity(UserEntity userEntity) {
        return GroupEntity.builder()
                .groupName(group.getGroupName())
                .serviceSort(group.getServiceSort())
                .memo(group.getMemo())
                .userEntity(userEntity)
                .build();
    }
}
