package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.response;

import kr.co.nomadlab.nomadrank.model.notice.entity.NoticeEntity;
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
public class ResNplaceRewardGetNotificationDTOApiV1 {

    private List<NplaceRewardNotification> nplaceRewardNotificationList;

    public static ResNplaceRewardGetNotificationDTOApiV1 of(
            List<NoticeEntity> noticeEntityList
    ) {
        return ResNplaceRewardGetNotificationDTOApiV1.builder()
                .nplaceRewardNotificationList(ResNplaceRewardGetNotificationDTOApiV1.NplaceRewardNotification.fromEntityList(noticeEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRewardNotification {

        private String content;
        private LocalDateTime createDate;
        private LocalDateTime updateDate;

        public static List<NplaceRewardNotification> fromEntityList(
                List<NoticeEntity> noticeEntityList
        ) {
            return noticeEntityList.stream()
                    .map(NplaceRewardNotification::fromEntity)
                    .toList();
        }

        public static NplaceRewardNotification fromEntity(
                NoticeEntity noticeEntity
        ) {
            return NplaceRewardNotification.builder()
                    .content(noticeEntity.getSubject())
                    .createDate(noticeEntity.getCreateDate())
                    .updateDate(noticeEntity.getUpdateDate())
                    .build();
        }

    }



}
