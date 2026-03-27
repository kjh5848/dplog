package kr.co.nomadlab.scrap.model_external.nomadproxy.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NomadproxyWirelessEntity {
    private Integer code;
    private String message;
    private ModelData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModelData {
        Integer port;
    }
}
