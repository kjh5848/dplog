//package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request;
//
//import jakarta.validation.Valid;
//import jakarta.validation.constraints.NotNull;
//import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.request.ReqNomadscrapNplaceRankPostTrackChartDTO;
//import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.request.ReqNomadscrapNstoreRankPostTrackChartDTO;
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//public class ReqNplaceRankPostTrackChartDTOApiV1 {
//
//    @Valid
//    @NotNull(message = "nplaceRankTrackInfoList를 입력하세요.")
//    private List<NplaceRankTrackInfo> nplaceRankTrackInfoList;
//
//    public ReqNomadscrapNplaceRankPostTrackChartDTO toNomadscrapDTO() {
//        return ReqNomadscrapNplaceRankPostTrackChartDTO.builder()
//                .nplaceRankTrackInfoList(nplaceRankTrackInfoList
//                        .stream()
//                        .map(thisNplaceRankTrackInfo -> ReqNomadscrapNplaceRankPostTrackChartDTO.NplaceRankTrackInfo.builder()
//                                .id(thisNplaceRankTrackInfo.getNomadscrapNplaceRankTrackInfoId())
//                                .trackStartDate(thisNplaceRankTrackInfo.getTrackStartDate())
//                                .build()
//                        )
//                        .toList())
//                .build();
//    }
//
//
//    @Data
//    @Builder
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class NplaceRankTrackInfo {
//        @NotNull(message = "nomadscrapNplaceRankTrackInfoId를 입력하세요.")
//        private Long nomadscrapNplaceRankTrackInfoId;
//        @NotNull(message = "trackStartDate를 입력하세요.")
//        private LocalDateTime trackStartDate;
//    }
//
//}
