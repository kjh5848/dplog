package kr.co.nomadlab.nomadrank.domain.google.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResGoogleTestSheetAccessDTOApiV1 {

    private boolean success;
    private String message;
    private String spreadsheetTitle;
    private String spreadsheetId;
    private Integer errorCode;

}
