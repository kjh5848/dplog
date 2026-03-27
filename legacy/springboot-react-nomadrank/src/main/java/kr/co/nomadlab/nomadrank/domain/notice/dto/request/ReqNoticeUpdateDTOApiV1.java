package kr.co.nomadlab.nomadrank.domain.notice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.notice.enums.Category;
import kr.co.nomadlab.nomadrank.model.notice.entity.NoticeEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNoticeUpdateDTOApiV1 {

    @Valid
    @NotNull(message = "notice를 입력하세요.")
    private Notice notice;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Notice {
        @NotNull(message = "id를 입력하세요.")
        private Long id;
        @NotNull(message = "카테고리를 입력하세요.")
        private Category category;
        @NotNull(message = "제목을 입력하세요.")
        private String subject;
        @NotNull(message = "내용을 입력하세요.")
        private String content;

    }

    public NoticeEntity toNoticeEntity(ReqNoticeUpdateDTOApiV1 reqDto) {
        return NoticeEntity.builder()
                .category(reqDto.getNotice().getCategory())
                .subject(reqDto.getNotice().getSubject())
                .content(reqDto.getNotice().getContent())
                .build();
    }
}
