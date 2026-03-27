package kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.response;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.model.nstore.rank.entity.NstoreRankProductEntity;
import kr.co.nomadlab.nomadrank.model.nstore.rank.entity.NstoreRankProductTrackInfoEntity;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response.ResNomadscrapNstoreRankPostTrackChartDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNstoreRankGetProductWithIdDTOApiV1 {

    private NstoreRankProduct nstoreRankProduct;

    public static ResNstoreRankGetProductWithIdDTOApiV1 of(
            NstoreRankProductEntity nstoreRankProductEntity,
            ResNomadscrapNstoreRankPostTrackChartDTO resNomadscrapNstoreRankPostTrackChartDTO
    ) {
        return ResNstoreRankGetProductWithIdDTOApiV1.builder()
                .nstoreRankProduct(NstoreRankProduct.fromEntityAndNomadscrapDTO(nstoreRankProductEntity, resNomadscrapNstoreRankPostTrackChartDTO))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NstoreRankProduct {

        private Long id;
        private String mid;
        private String productId;
        private String productName;
        private String productImageUrl;
        private String category;
        private String price;
        private String mallName;
        private String reviewCount;
        private String scoreInfo;
        private Map<String, NstoreRankTrackInfo> nstoreRankTrackInfoMap;

        public static NstoreRankProduct fromEntityAndNomadscrapDTO(
                NstoreRankProductEntity nstoreRankProductEntity,
                ResNomadscrapNstoreRankPostTrackChartDTO resNomadscrapNstoreRankPostTrackChartDTO
        ) {

            Map<NstoreRankProductTrackInfoEntity, ResNomadscrapNstoreRankPostTrackChartDTO.DTOData.NstoreRankTrackInfo> trackInfoChartMap = nstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList()
                    .stream()
                    .map(thisNstoreRankProductTrackInfoEntity -> {
                        Optional<ResNomadscrapNstoreRankPostTrackChartDTO.DTOData.NstoreRankTrackInfo> nomadscrapNstoreRankTrackInfoOptional = resNomadscrapNstoreRankPostTrackChartDTO.getData().getNstoreRankTrackInfoMap().values()
                                .stream()
                                .filter(thisNomadscrapNstoreRankTrackInfo -> thisNomadscrapNstoreRankTrackInfo.getId().equals(thisNstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId()))
                                .findFirst();
                        if (nomadscrapNstoreRankTrackInfoOptional.isEmpty()) {
                            throw new BadRequestException("nomadscrapNstoreRankTrackInfo가 존재하지 않습니다.");
                        }
                        return Map.entry(thisNstoreRankProductTrackInfoEntity, nomadscrapNstoreRankTrackInfoOptional.get());
                    })
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            return NstoreRankProduct.builder()
                    .id(nstoreRankProductEntity.getId())
                    .mid(nstoreRankProductEntity.getMid())
                    .productId(nstoreRankProductEntity.getProductId())
                    .productName(nstoreRankProductEntity.getProductName())
                    .productImageUrl(nstoreRankProductEntity.getProductImageUrl())
                    .category(nstoreRankProductEntity.getCategory())
                    .price(nstoreRankProductEntity.getPrice())
                    .mallName(nstoreRankProductEntity.getMallName())
                    .reviewCount(nstoreRankProductEntity.getReviewCount())
                    .scoreInfo(nstoreRankProductEntity.getScoreInfo())
                    .nstoreRankTrackInfoMap(NstoreRankTrackInfo.fromNomadscrapNstoreRankTrackInfoMap(trackInfoChartMap))
                    .build();
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NstoreRankTrackInfo {
            private Long id;
            private String keyword;
            private Integer rankChange;
            private Integer rank;
            private List<NstoreRankTrack> nstoreRankTrackList;

            public static Map<String, NstoreRankTrackInfo> fromNomadscrapNstoreRankTrackInfoMap(
                    Map<NstoreRankProductTrackInfoEntity, ResNomadscrapNstoreRankPostTrackChartDTO.DTOData.NstoreRankTrackInfo> trackInfoChartMap
            ) {
                return trackInfoChartMap
                        .entrySet()
                        .stream()
                        .map(NstoreRankTrackInfo::fromNomadscrapNstoreRankTrackInfoEntry)
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
            }

            public static Map.Entry<String, NstoreRankTrackInfo> fromNomadscrapNstoreRankTrackInfoEntry(
                    Map.Entry<NstoreRankProductTrackInfoEntity, ResNomadscrapNstoreRankPostTrackChartDTO.DTOData.NstoreRankTrackInfo> trackInfoChartEntry
            ) {
                return Map.entry(
                        trackInfoChartEntry.getValue().getKeyword(),
                        NstoreRankTrackInfo.builder()
                                .id(trackInfoChartEntry.getKey().getId())
                                .keyword(trackInfoChartEntry.getValue().getKeyword())
                                .rankChange(trackInfoChartEntry.getValue().getRankChange())
                                .rank(!trackInfoChartEntry.getValue().getJson().isNull()
                                        ? trackInfoChartEntry.getValue().getJson().get("rankInfo").get("rank").asInt()
                                        : null)
                                .nstoreRankTrackList(NstoreRankTrack.fromNomadscrapDTOList(trackInfoChartEntry.getValue().getNstoreRankTrackList()))
                                .build()
                );
            }

            @Data
            @Builder
            @NoArgsConstructor
            @AllArgsConstructor
            public static class NstoreRankTrack {

                private Integer rank;
                private Integer prevRank;
                private String price;
                private String reviewCount;
                private String scoreInfo;
                private String ampm;
                private Boolean isValid;
                private LocalDateTime chartDate;

                public static List<NstoreRankTrack> fromNomadscrapDTOList(List<ResNomadscrapNstoreRankPostTrackChartDTO.DTOData.NstoreRankTrackInfo.NstoreRankTrack> nomadscrapNstoreRankTrackList) {
                    return nomadscrapNstoreRankTrackList.stream()
                            .filter(nomadscrapNstoreRankTrack -> nomadscrapNstoreRankTrack.getIsValid())
                            .map(NstoreRankTrack::fromNomadscrapDTO)
                            .toList();
                }

                public static NstoreRankTrack fromNomadscrapDTO(ResNomadscrapNstoreRankPostTrackChartDTO.DTOData.NstoreRankTrackInfo.NstoreRankTrack nomadscrapNstoreRankTrack) {
                    return NstoreRankTrack.builder()
                            .rank(nomadscrapNstoreRankTrack.getRank())
                            .prevRank(nomadscrapNstoreRankTrack.getPrevRank())
                            .price(nomadscrapNstoreRankTrack.getPrice())
                            .reviewCount(nomadscrapNstoreRankTrack.getReviewCount())
                            .scoreInfo(nomadscrapNstoreRankTrack.getScoreInfo())
                            .isValid(nomadscrapNstoreRankTrack.getIsValid())
                            .chartDate(nomadscrapNstoreRankTrack.getChartDate())
                            .build();
                }

            }

        }

    }


}
