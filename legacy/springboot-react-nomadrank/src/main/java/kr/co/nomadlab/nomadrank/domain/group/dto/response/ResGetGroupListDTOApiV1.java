package kr.co.nomadlab.nomadrank.domain.group.dto.response;

import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResGetGroupListDTOApiV1 {

    List<Group> groupList;

    public static ResGetGroupListDTOApiV1 of(List<GroupEntity> groupEntityList) {
        return ResGetGroupListDTOApiV1.builder()
                .groupList(ResGetGroupListDTOApiV1.Group.fromGroupEntityList(groupEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Group {
        private Long id;
        private String serviceSortName;
        private String serviceSortValue;
        private String groupName;
        private String memo;
        private int count;
        private String createDate;

        public static List<Group> fromGroupEntityList(List<GroupEntity> groupEntityList) {
            return groupEntityList.stream()
                    .map(Group::fromGroupEntity)
                    .toList();
        }

        public static Group fromGroupEntity(GroupEntity groupEntity) {
            return Group.builder()
                    .id(groupEntity.getId())
                    .serviceSortName(groupEntity.getServiceSort().name())
                    .serviceSortValue(groupEntity.getServiceSort().getValue())
                    .groupName(groupEntity.getGroupName())
                    .memo(groupEntity.getMemo())
                    .count(groupEntity.getGroupNplaceRankShopEntityList().size())
                    .createDate(groupEntity.getCreateDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                    .build();
        }
    }
}
