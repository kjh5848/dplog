package kr.co.nomadlab.nomadrank.domain.group.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqDeleteGroupDTOApiV1 {

    @Valid
    @NotNull(message = "group를 입력하세요.")
    private Group group;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Group {

        @NotNull(message = "id는 필수입니다.")
        private Long id;
    }

}
