package kr.co.nomadlab.nomadrank.domain.google.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.domain.distributor.dto.request.ReqDistributorDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.google.dto.request.ReqGoogleTestSheetAccessDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.google.dto.response.ResGoogleTestSheetAccessDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.google.service.GoogleServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/google")
@Validated
public class GoogleControllerApiV1 {

    private final GoogleServiceApiV1 googleServiceApiV1;

    @PostMapping("/test-access")
    public HttpEntity<?> testSheetAccess(
        @RequestBody @Valid ReqGoogleTestSheetAccessDTOApiV1 reqDto
    ) {
        String credentialJson = reqDto.getGoogleSheetInfo().getGoogleCredentialJson();
        String spreadsheetUrl = reqDto.getGoogleSheetInfo().getGoogleSheetUrl();
        ResGoogleTestSheetAccessDTOApiV1 result = googleServiceApiV1.testSheetAccess(credentialJson, spreadsheetUrl);
        return new ResponseEntity<>(
            ResDTO.builder()
                    .code(0)
                    .message("success")
                    .data(result)
                    .build(),
            HttpStatus.OK
        );
    }
}
