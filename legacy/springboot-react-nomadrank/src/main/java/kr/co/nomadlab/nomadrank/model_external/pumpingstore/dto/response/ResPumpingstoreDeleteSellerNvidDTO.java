package kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResPumpingstoreDeleteSellerNvidDTO {

    private Integer code;
    private String message;
    private DTOData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DTOData {

        private JsonNode sellerNvid;

    }
}
