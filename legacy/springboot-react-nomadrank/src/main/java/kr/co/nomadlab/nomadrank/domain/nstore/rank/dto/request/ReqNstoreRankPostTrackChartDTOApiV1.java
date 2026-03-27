//package kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.request;
//
//import jakarta.validation.Valid;
//import jakarta.validation.constraints.NotNull;
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
//public class ReqNstoreRankPostTrackChartDTOApiV1 {
//
//    @Valid
//    @NotNull(message = "nstoreTrackInfoList를 입력하세요.")
//    private List<NstoreRankTrackInfo> nstoreRankTrackInfoList;
//
//    public ReqNomadscrapNstoreRankPostTrackChartDTO toNomadscrapDTO() {
//        return ReqNomadscrapNstoreRankPostTrackChartDTO.builder()
//                .nstoreRankTrackInfoList(nstoreRankTrackInfoList
//                        .stream()
//                        .map(thisNstoreRankTrackInfo -> ReqNomadscrapNstoreRankPostTrackChartDTO.NstoreRankTrackInfo.builder()
//                                .id(thisNstoreRankTrackInfo.getNomadscrapNstoreRankTrackInfoId())
//                                .trackStartDate(thisNstoreRankTrackInfo.getTrackStartDate())
//                                .build())
//                        .toList())
//                .build();
//    }
//
//    @Data
//    @Builder
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class NstoreRankTrackInfo {
//        @NotNull(message = "nomadscrapNstoreRankTrackInfoId를 입력하세요.")
//        private Long nomadscrapNstoreRankTrackInfoId;
//        @NotNull(message = "trackStartDate를 입력하세요.")
//        private LocalDateTime trackStartDate;
//    }
//
//}
