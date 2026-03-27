package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.response;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopKeywordEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopTrackInfoEntity;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankPostTrackChartDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRankGetShopWithIdDTOApiV1 {

    private NplaceRankShop nplaceRankShop;

    public static ResNplaceRankGetShopWithIdDTOApiV1 of(
            NplaceRankShopEntity nplaceRankShopEntity,
            ResNomadscrapNplaceRankPostTrackChartDTO resNomadscrapNplaceRankPostTrackChartDTO,
            List<String> keywordList
    ) {
        return ResNplaceRankGetShopWithIdDTOApiV1.builder()
                .nplaceRankShop(NplaceRankShop.fromEntityAndNomadscrapDTO(nplaceRankShopEntity, resNomadscrapNplaceRankPostTrackChartDTO, keywordList))
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
        private String businessSector;
        private List<String> keywordList;
        private Map<String, NplaceRankTrackInfo> nplaceRankTrackInfoMap;
        private LocalDateTime createDate;

        public static NplaceRankShop fromEntityAndNomadscrapDTO(
                NplaceRankShopEntity nplaceRankShopEntity,
                ResNomadscrapNplaceRankPostTrackChartDTO resNomadscrapNplaceRankPostTrackChartDTO,
                List<String> keywordList) {

            Map<NplaceRankShopTrackInfoEntity, ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo> trackInfoChartMap = nplaceRankShopEntity.getNplaceRankShopTrackInfoEntityList()
                    .stream()
                    .map(thisNplaceRankShopTrackInfoEntity -> {
                        Optional<ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo> nomadscrapNplaceRankTrackInfoOptional = resNomadscrapNplaceRankPostTrackChartDTO.getData().getNplaceRankTrackInfoMap().values()
                                .stream()
                                .filter(thisNomadscrapNplaceRankTrackInfo -> thisNomadscrapNplaceRankTrackInfo.getId().equals(thisNplaceRankShopTrackInfoEntity.getNomadscrapNplaceRankTrackInfoId()))
                                .findFirst();
                        if (nomadscrapNplaceRankTrackInfoOptional.isEmpty()) {
                            throw new BadRequestException("nomadscrapNplaceRankTrackInfo가 존재하지 않습니다.");
                        }
                        return Map.entry(thisNplaceRankShopTrackInfoEntity, nomadscrapNplaceRankTrackInfoOptional.get());
                    })
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
            return NplaceRankShop.builder()
                    .id(nplaceRankShopEntity.getId())
                    .shopId(nplaceRankShopEntity.getShopId())
                    .shopName(nplaceRankShopEntity.getShopName())
                    .shopImageUrl(nplaceRankShopEntity.getShopImageUrl())
                    .category(nplaceRankShopEntity.getCategory())
                    .address(nplaceRankShopEntity.getAddress())
                    .roadAddress(nplaceRankShopEntity.getRoadAddress())
                    .visitorReviewCount(nplaceRankShopEntity.getVisitorReviewCount().equals("null") ? "0" : nplaceRankShopEntity.getVisitorReviewCount())
                    .blogReviewCount(nplaceRankShopEntity.getBlogReviewCount())
                    .scoreInfo(nplaceRankShopEntity.getScoreInfo())
                    .keywordList(keywordList)
                    .businessSector(nplaceRankShopEntity.getBusinessSector())
                    .nplaceRankTrackInfoMap(NplaceRankTrackInfo.fromNomadscrapNplaceRankTrackInfoMap(trackInfoChartMap))
                    .createDate(nplaceRankShopEntity.getCreateDate())
                    .build();
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NplaceRankTrackInfo {

            private Long id;
            private String keyword;
            private String province;
            private Integer rankChange;
            private Integer rank;
            private List<NplaceRankTrack> nplaceRankTrackList;

            public static Map<String, NplaceRankTrackInfo> fromNomadscrapNplaceRankTrackInfoMap(
                    Map<NplaceRankShopTrackInfoEntity, ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo> trackInfoChartMap
            ) {
                return trackInfoChartMap
                        .entrySet()
                        .stream()
                        .map(NplaceRankTrackInfo::fromNomadscrapNplaceRankTrackInfoEntry)
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
            }

            public static Map.Entry<String, NplaceRankTrackInfo> fromNomadscrapNplaceRankTrackInfoEntry(
                    Map.Entry<NplaceRankShopTrackInfoEntity, ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo> trackInfoChartEntry
            ) {
                return Map.entry(
                        "[%s]%s".formatted(trackInfoChartEntry.getValue().getProvince(), trackInfoChartEntry.getValue().getKeyword()),
                        NplaceRankTrackInfo.builder()
                                .id(trackInfoChartEntry.getKey().getId())
                                .keyword(trackInfoChartEntry.getValue().getKeyword())
                                .province(trackInfoChartEntry.getValue().getProvince())
                                .rankChange(trackInfoChartEntry.getValue().getRankChange())
                                .rank(!trackInfoChartEntry.getValue().getJson().isNull()
                                        ? trackInfoChartEntry.getValue().getJson().get("rankInfo").get("rank").asInt()
                                        : null)
                                .nplaceRankTrackList(NplaceRankTrack.fromNomadscrapDTOList(trackInfoChartEntry.getValue().getNplaceRankTrackList()))
                                .build()
                );
            }

            @Data
            @Builder
            @NoArgsConstructor
            @AllArgsConstructor
            public static class NplaceRankTrack {

                private Integer rank;
                private Integer prevRank;
                private String visitorReviewCount;
                private String blogReviewCount;
                private String saveCount;
                private String scoreInfo;
                private String ampm;
                private Boolean isValid;
                private LocalDateTime chartDate;

                public static List<NplaceRankTrack> fromNomadscrapDTOList(
                        List<ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo.NplaceRankTrack> nomadscrapNplaceRankTrackList
                ) {
                    return nomadscrapNplaceRankTrackList.stream()
                            .filter(nomadscrapNplaceRankTrack -> nomadscrapNplaceRankTrack.getIsValid())
                            .map(NplaceRankTrack::fromNomadscrapDTO)
                            .toList();
                }

                public static NplaceRankTrack fromNomadscrapDTO(
                        ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo.NplaceRankTrack nomadscrapNplaceRankTrack
                ) {
                    return NplaceRankTrack.builder()
                            .rank(nomadscrapNplaceRankTrack.getRank())
                            .prevRank(nomadscrapNplaceRankTrack.getPrevRank())
                            .visitorReviewCount(nomadscrapNplaceRankTrack.getVisitorReviewCount())
                            .blogReviewCount(nomadscrapNplaceRankTrack.getBlogReviewCount())
                            .saveCount(nomadscrapNplaceRankTrack.getSaveCount())
                            .scoreInfo(nomadscrapNplaceRankTrack.getScoreInfo())
                            .ampm(nomadscrapNplaceRankTrack.getAmpm())
                            .isValid(nomadscrapNplaceRankTrack.getIsValid())
                            .chartDate(nomadscrapNplaceRankTrack.getChartDate())
                            .build();

                }

            }

        }

    }

}
