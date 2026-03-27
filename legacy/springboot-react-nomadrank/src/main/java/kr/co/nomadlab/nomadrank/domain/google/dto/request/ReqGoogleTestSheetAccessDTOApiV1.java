package kr.co.nomadlab.nomadrank.domain.google.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqGoogleTestSheetAccessDTOApiV1 {

    @Valid
    @NotNull(message = "googleSheetInfo를 입력하세요.")
    private GoogleSheetInfo googleSheetInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleSheetInfo {
        private String googleSheetUrl;
        private String googleCredentialJson;
    }
}
