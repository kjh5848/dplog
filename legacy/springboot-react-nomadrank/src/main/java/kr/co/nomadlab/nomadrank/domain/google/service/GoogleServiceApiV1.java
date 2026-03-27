package kr.co.nomadlab.nomadrank.domain.google.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.Spreadsheet;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import kr.co.nomadlab.nomadrank.domain.google.dto.response.ResGoogleTestSheetAccessDTOApiV1;
import kr.co.nomadlab.nomadrank.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;

@Service
@RequiredArgsConstructor
public class GoogleServiceApiV1 {

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    public Sheets getSheetsService(String credentialJson) throws Exception {
        GoogleCredentials credentials = GoogleCredentials.fromStream(new ByteArrayInputStream(credentialJson.getBytes()))
                .createScoped(SheetsScopes.all());
//        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(credentialsPath))
//                .createScoped(SheetsScopes.all());
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        HttpCredentialsAdapter credentialAdapter = new HttpCredentialsAdapter(credentials);
        return new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, credentialAdapter)
                .setApplicationName("Sheets samples")
                .build();
    }

    public ResGoogleTestSheetAccessDTOApiV1 testSheetAccess(String credentialJson, String spreadsheetlUrl) {
        try {
            // 1. 스프레드시트 ID 추출
            String spreadsheetId = UtilFunction.getSheetIdFromUrl(spreadsheetlUrl);

            // 2. 임시 Sheets 서비스 생성
            Sheets sheetsService = createTemporarySheetsService(credentialJson);

            // 3. 스프레드시트 메타데이터 요청
            Spreadsheet spreadsheet = sheetsService.spreadsheets()
                    .get(spreadsheetId)
                    .execute();

            // 4. 성공적으로 접근 가능한 경우
            return ResGoogleTestSheetAccessDTOApiV1.builder()
                    .success(true)
                    .message("Successfully accessed the spreadsheet: " + spreadsheet.getProperties().getTitle())
                    .spreadsheetTitle(spreadsheet.getProperties().getTitle())
                    .spreadsheetId(spreadsheetId)
                    .build();

        } catch (GoogleJsonResponseException e) {
            // Google API 특정 에러 처리
            String errorMessage = switch (e.getStatusCode()) {
                case 404 -> "Spreadsheet not found. Please check the URL.";
                case 403 -> "Permission denied. The credential doesn't have access to this spreadsheet.";
                case 401 -> "Authentication failed. Please check the credential.";
                default -> "Failed to access spreadsheet: " + e.getMessage();
            };

            return ResGoogleTestSheetAccessDTOApiV1.builder()
                    .success(false)
                    .message(errorMessage)
                    .errorCode(e.getStatusCode())
                    .build();

        } catch (Exception e) {
            return ResGoogleTestSheetAccessDTOApiV1.builder()
                    .success(false)
                    .message("Failed to test sheet access: " + e.getMessage())
                    .build();
        }
    }

    private Sheets createTemporarySheetsService(String credentialJson) throws Exception {
        GoogleCredentials credentials = GoogleCredentials.fromStream(
                        new ByteArrayInputStream(credentialJson.getBytes()))
                .createScoped(SheetsScopes.all());

        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        HttpCredentialsAdapter credentialAdapter = new HttpCredentialsAdapter(credentials);

        return new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, credentialAdapter)
                .setApplicationName("Sheets Access Test")
                .build();
    }
}
