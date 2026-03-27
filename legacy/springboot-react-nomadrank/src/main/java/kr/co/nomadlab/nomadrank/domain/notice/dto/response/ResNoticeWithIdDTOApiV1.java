package kr.co.nomadlab.nomadrank.domain.notice.dto.response;

import kr.co.nomadlab.nomadrank.model.notice.entity.NoticeEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNoticeWithIdDTOApiV1 {

    private Notice notice;

    public static ResNoticeWithIdDTOApiV1 of(
            NoticeEntity noticeEntity
    ) {
        return ResNoticeWithIdDTOApiV1.builder()
                .notice(Notice.fromEntity(noticeEntity))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Notice {
        private String categoryName;
        private String categoryValue;
        private String subject;
        private String content;

        public static Notice fromEntity(NoticeEntity noticeEntity) {
            return Notice.builder()
                    .categoryValue(noticeEntity.getCategory().getValue())
                    .categoryName(noticeEntity.getCategory().name())
                    .subject(noticeEntity.getSubject())
                    .content(noticeEntity.getContent())
                    .build();
        }
    }

}
