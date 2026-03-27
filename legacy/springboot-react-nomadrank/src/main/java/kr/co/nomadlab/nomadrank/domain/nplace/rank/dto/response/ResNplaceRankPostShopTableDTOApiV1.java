package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankPostTrackInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRankPostShopTableDTOApiV1 {

    private List<NplaceRankShop> nplaceRankShopList;

    public static ResNplaceRankPostShopTableDTOApiV1 of(
            List<NplaceRankShopEntity> nplaceRankShopEntityList,
            ResNomadscrapNplaceRankPostTrackInfoDTO resNomadscrapNplaceRankPostTrackInfoDTO
    ) {
        return ResNplaceRankPostShopTableDTOApiV1.builder()
                .nplaceRankShopList(ResNplaceRankPostShopTableDTOApiV1.NplaceRankShop.fromEntityListAndNomadscrapDTO(nplaceRankShopEntityList, resNomadscrapNplaceRankPostTrackInfoDTO))
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
        private String groupName;
        private List<NplaceRankTrackInfo> nplaceRankTrackInfoList;

        public static List<NplaceRankShop> fromEntityListAndNomadscrapDTO(
                List<NplaceRankShopEntity> nplaceRankShopEntityList,
                ResNomadscrapNplaceRankPostTrackInfoDTO resNomadscrapNplaceRankPostTrackInfoDTO
        ) {
            return nplaceRankShopEntityList.stream()
                    .map(thisNplaceRankShopEntity -> NplaceRankShop.fromEntityAndNomadscrapDTO(thisNplaceRankShopEntity, resNomadscrapNplaceRankPostTrackInfoDTO))
                    .toList();
        }

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
                    .groupName(Optional.ofNullable(nplaceRankShopEntity.getGroupNplaceRankShopEntityList())
                            .orElse(Collections.emptyList()) // null이면 빈 리스트로 대체
                            .stream()
                            .filter(groupNplaceRankShop -> groupNplaceRankShop.getGroupEntity().getDeleteDate() == null)
                            .map(groupNplaceRankShop -> groupNplaceRankShop.getGroupEntity().getGroupName())
                            .collect(Collectors.collectingAndThen(
                                    Collectors.joining(", "),
                                    result -> result.isEmpty() ? "기본" : result // 결과가 비어 있으면 "기본" 반환
                            )))
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
