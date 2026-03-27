package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.mission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNomadscrapNplaceMissionGetAroundDTO {

    private Integer code;
    private String message;
    private DTOData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DTOData {

        private NplaceMissionAround nplaceMissionAround;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NplaceMissionAround {

            private Integer index;
            private String initialConsonants;
            private String answer;

        }
    }
}
