package kr.co.nomadlab.nomadrank.domain.notice.dto.response;

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
public class ResNoticeListDTOApiV1 {

    private List<Notice> noticeList;

    public static ResNoticeListDTOApiV1 of(
            List<NoticeEntity> noticeEntityList
    ) {
        return ResNoticeListDTOApiV1.builder()
                .noticeList(Notice.fromEntityList(noticeEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Notice {
        private Long id;
        private String category;
        private String subject;
        private LocalDateTime createDate;

        public static List<Notice> fromEntityList(List<NoticeEntity> noticeEntityList) {
            return noticeEntityList.stream()
                    .map(Notice::fromEntity)
                    .toList();
        }

        public static Notice fromEntity(NoticeEntity noticeEntity) {
            return Notice.builder()
                    .id(noticeEntity.getId())
                    .category(noticeEntity.getCategory().getValue())
                    .subject(noticeEntity.getSubject())
                    .createDate(noticeEntity.getCreateDate())
                    .build();
        }
    }

}
