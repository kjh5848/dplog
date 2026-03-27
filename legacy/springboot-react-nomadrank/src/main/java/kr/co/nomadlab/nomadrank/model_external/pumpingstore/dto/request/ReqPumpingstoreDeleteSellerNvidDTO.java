package kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqPumpingstoreDeleteSellerNvidDTO {

    private SellerNvid sellerNvid;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerNvid {
        private String nvId;
    }
}
