package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRankGetRealtimeWithKeywordDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRankCheckData를 입력하세요.")
    private NplaceRankCheckData nplaceRankCheckData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankCheckData {
        @NotNull(message = "keyword를 입력하세요.")
        private String keyword;
        @NotNull(message = "province를 입력하세요.")
        private String province;
        @NotNull(message = "searchDate를 입력하세요.")
        private LocalDateTime searchDate;
//        @NotNull(message = "keywordCreateDate를 입력하세요.")
//        private LocalDateTime keywordCreateDate;

    }
}
