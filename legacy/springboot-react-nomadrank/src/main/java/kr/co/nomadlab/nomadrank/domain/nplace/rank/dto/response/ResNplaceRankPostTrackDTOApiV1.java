package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankPostTrackInfoDTO;
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
public class ResNplaceRankPostTrackDTOApiV1 {

    private NplaceRankShop nplaceRankShop;

    public static ResNplaceRankPostTrackDTOApiV1 of(
            NplaceRankShopEntity nplaceRankShopEntity,
            ResNomadscrapNplaceRankPostTrackInfoDTO resNomadscrapNplaceRankPostTrackInfoDTO
    ) {
        return ResNplaceRankPostTrackDTOApiV1.builder()
                .nplaceRankShop(NplaceRankShop.fromEntityAndNomadscrapDTO(nplaceRankShopEntity, resNomadscrapNplaceRankPostTrackInfoDTO))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankShop {

        private Long id;
        private String shopId;
        private String shopName;
        private String shopImageUrl;
        private String category;
        private String address;
        private String roadAddress;
        private String visitorReviewCount;
        private String blogReviewCount;
        private String scoreInfo;
        private List<NplaceRankTrackInfo> nplaceRankTrackInfoList;

        public static NplaceRankShop fromEntityAndNomadscrapDTO(
                NplaceRankShopEntity nplaceRankShopEntity,
                ResNomadscrapNplaceRankPostTrackInfoDTO resNomadscrapNplaceRankPostTrackInfoDTO
        ) {
            List<ResNomadscrapNplaceRankPostTrackInfoDTO.DTOData.NplaceRankTrackInfo> nomadscrapNplaceRankTrackInfoList = nplaceRankShopEntity.getNplaceRankShopTrackInfoEntityList()
                    .stream()
                    .map(thisNplaceRankShopTrackInfoEntity -> {
                        Optional<ResNomadscrapNplaceRankPostTrackInfoDTO.DTOData.NplaceRankTrackInfo> nomadscrapNplaceRankTrackInfoOptional = resNomadscrapNplaceRankPostTrackInfoDTO.getData().getNplaceRankTrackInfoList()
                                .stream()
                                .filter(thisNplaceRankTrackInfo -> thisNplaceRankTrackInfo.getId().equals(thisNplaceRankShopTrackInfoEntity.getNomadscrapNplaceRankTrackInfoId()))
                                .findFirst();
                        if (nomadscrapNplaceRankTrackInfoOptional.isEmpty())
                            throw new RuntimeException("nomadscrapNplaceRankTrackInfo가 없습니다. id : " + thisNplaceRankShopTrackInfoEntity.getNomadscrapNplaceRankTrackInfoId());
                        return nomadscrapNplaceRankTrackInfoOptional.get();
                    })
                    .toList();

            return NplaceRankShop.builder()
                    .id(nplaceRankShopEntity.getId())
                    .shopId(nplaceRankShopEntity.getShopId())
                    .shopName(nplaceRankShopEntity.getShopName())
                    .shopImageUrl(nplaceRankShopEntity.getShopImageUrl())
                    .category(nplaceRankShopEntity.getCategory())
                    .address(nplaceRankShopEntity.getAddress())
                    .roadAddress(nplaceRankShopEntity.getRoadAddress())
                    .visitorReviewCount(nplaceRankShopEntity.getVisitorReviewCount())
                    .blogReviewCount(nplaceRankShopEntity.getBlogReviewCount())
                    .scoreInfo(nplaceRankShopEntity.getScoreInfo())
                    .nplaceRankTrackInfoList(NplaceRankTrackInfo.fromNomadscrapNplaceRankTrackInfoList(nomadscrapNplaceRankTrackInfoList))
                    .build();
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NplaceRankTrackInfo {

            private Long nomadscrapNplaceRankTrackInfoId;
            private String keyword;
            private String province;
            private Integer rankChange;
            private Integer rank;

            public static List<NplaceRankTrackInfo> fromNomadscrapNplaceRankTrackInfoList(
                    List<ResNomadscrapNplaceRankPostTrackInfoDTO.DTOData.NplaceRankTrackInfo> nomadscrapNplaceRankTrackInfoList
            ) {
                return nomadscrapNplaceRankTrackInfoList.stream()
                        .map(NplaceRankTrackInfo::fromNomadscrapNplaceRankTrackInfo)
                        .toList();
            }

            public static NplaceRankTrackInfo fromNomadscrapNplaceRankTrackInfo(
                    ResNomadscrapNplaceRankPostTrackInfoDTO.DTOData.NplaceRankTrackInfo nomadscrapNplaceRankTrackInfo
            ) {
                return NplaceRankTrackInfo.builder()
                        .nomadscrapNplaceRankTrackInfoId(nomadscrapNplaceRankTrackInfo.getId())
                        .keyword(nomadscrapNplaceRankTrackInfo.getKeyword())
                        .province(nomadscrapNplaceRankTrackInfo.getProvince())
                        .rankChange(nomadscrapNplaceRankTrackInfo.getRankChange())
                        .rank(!nomadscrapNplaceRankTrackInfo.getJson().isNull()
                                ? nomadscrapNplaceRankTrackInfo.getJson().get("rankInfo").get("rank").asInt()
                                : null)
                        .build();
            }

        }

    }

}
