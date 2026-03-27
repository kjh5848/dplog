package kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.response;

import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.model.nstore.rank.entity.NstoreRankProductEntity;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response.ResNomadscrapNstoreRankPostTrackInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Optional;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNstoreRankGetProductTableDTOApiV1 {

    private List<NstoreRankProduct> nstoreRankProductList;

    public static ResNstoreRankGetProductTableDTOApiV1 of(
            List<NstoreRankProductEntity> nstoreRankProductEntityList,
            ResNomadscrapNstoreRankPostTrackInfoDTO resNomadscrapNstoreRankPostTrackInfoDTO
    ) {
        return ResNstoreRankGetProductTableDTOApiV1.builder()
                .nstoreRankProductList(NstoreRankProduct.fromEntityListAndNomadscrapDTO(nstoreRankProductEntityList, resNomadscrapNstoreRankPostTrackInfoDTO))
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
        private Boolean isCatalog;
        private List<NstoreRankTrackInfo> nstoreRankTrackInfoList;

        public static List<NstoreRankProduct> fromEntityListAndNomadscrapDTO(
                List<NstoreRankProductEntity> nstoreRankProductEntityList,
                ResNomadscrapNstoreRankPostTrackInfoDTO resNomadscrapNstoreRankPostTrackInfoDTO
        ) {
            return nstoreRankProductEntityList.stream()
                    .map(thisNstoreRankProductEntity -> NstoreRankProduct.fromEntityAndNomadscrapDTO(thisNstoreRankProductEntity, resNomadscrapNstoreRankPostTrackInfoDTO))
                    .toList();
        }

        public static NstoreRankProduct fromEntityAndNomadscrapDTO(
                NstoreRankProductEntity nstoreRankProductEntity,
                ResNomadscrapNstoreRankPostTrackInfoDTO resNomadscrapNstoreRankPostTrackInfoDTO
        ) {
            List<ResNomadscrapNstoreRankPostTrackInfoDTO.DTOData.NstoreRankTrackInfo> nomadscrapNstoreRankTrackInfoList = nstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList()
                    .stream()
                    .map(thisNstoreRankProductTrackInfoEntity -> {
                        Optional<ResNomadscrapNstoreRankPostTrackInfoDTO.DTOData.NstoreRankTrackInfo> nomadscrapNstoreRankTrackInfoOptional = resNomadscrapNstoreRankPostTrackInfoDTO.getData().getNstoreRankTrackInfoList()
                                .stream()
                                .filter(thisNomadscrapNstoreRankTrackInfo -> thisNomadscrapNstoreRankTrackInfo.getId().equals(thisNstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId()))
                                .findFirst();
                        if (nomadscrapNstoreRankTrackInfoOptional.isEmpty()) {
                            throw new NomadscrapException("nomadscrapNstoreRankTrackInfo가 없습니다. id : " + thisNstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId());
                        }
                        return nomadscrapNstoreRankTrackInfoOptional.get();
                    })
                    .toList();

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
                    .isCatalog(nstoreRankProductEntity.getIsCatalog())
                    .nstoreRankTrackInfoList(NstoreRankTrackInfo.fromNomadscrapNstoreRankTrackInfoList(nomadscrapNstoreRankTrackInfoList))
                    .build();
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NstoreRankTrackInfo {

            private Long nomadscrapNstoreRankTrackInfoId;
            private String keyword;
            private Integer rankChange;
            private Integer rank;

            public static List<NstoreRankTrackInfo> fromNomadscrapNstoreRankTrackInfoList(
                    List<ResNomadscrapNstoreRankPostTrackInfoDTO.DTOData.NstoreRankTrackInfo> nomadscrapNstoreRankTrackInfoList
            ) {
                return nomadscrapNstoreRankTrackInfoList.stream()
                        .map(NstoreRankTrackInfo::fromNomadscrapNstoreRankTrackInfo)
                        .toList();
            }

            public static NstoreRankTrackInfo fromNomadscrapNstoreRankTrackInfo(
                    ResNomadscrapNstoreRankPostTrackInfoDTO.DTOData.NstoreRankTrackInfo nomadscrapNstoreRankTrackInfo
            ) {
                return NstoreRankTrackInfo.builder()
                        .nomadscrapNstoreRankTrackInfoId(nomadscrapNstoreRankTrackInfo.getId())
                        .keyword(nomadscrapNstoreRankTrackInfo.getKeyword())
                        .rankChange(nomadscrapNstoreRankTrackInfo.getRankChange())
                        .rank(!nomadscrapNstoreRankTrackInfo.getJson().isNull()
                                ? nomadscrapNstoreRankTrackInfo.getJson().get("rankInfo").get("rank").asInt()
                                : null)
                        .build();
            }

        }

    }

}
