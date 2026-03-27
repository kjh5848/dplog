package kr.co.nomadlab.scrap.domain.nstore.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackInfoEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNstoreRankPostTrackChartDTOApiV1 {

    private Map<String, NstoreRankTrackInfo> nstoreRankTrackInfoMap;

    public static ResNstoreRankPostTrackChartDTOApiV1 of(List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList) {
        return ResNstoreRankPostTrackChartDTOApiV1.builder()
                .nstoreRankTrackInfoMap(NstoreRankTrackInfo.fromEntityListToMap(nstoreRankTrackInfoEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NstoreRankTrackInfo {

        private Long id;
        private String keyword;
        private String mid;
        private String productId;
        private Integer rankChange;
        private Integer rankWithAdChange;
        private List<NstoreRankTrack> nstoreRankTrackList;
        private JsonNode json;

        public static Map<String, NstoreRankTrackInfo> fromEntityListToMap(List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList) {
            HashMap<String, NstoreRankTrackInfo> nstoreTrackInfoMap = new HashMap<>();
            for (NstoreRankTrackInfoEntity nstoreRankTrackInfoEntity : nstoreRankTrackInfoEntityList) {
                nstoreTrackInfoMap.put(
                        nstoreRankTrackInfoEntity.getKeyword(),
                        NstoreRankTrackInfo.fromEntity(nstoreRankTrackInfoEntity)
                );
            }
            return nstoreTrackInfoMap;
        }

        public static NstoreRankTrackInfo fromEntity(NstoreRankTrackInfoEntity nstoreRankTrackInfoEntity) {
            try {
                return NstoreRankTrackInfo.builder()
                        .id(nstoreRankTrackInfoEntity.getId())
                        .keyword(nstoreRankTrackInfoEntity.getKeyword())
                        .mid(nstoreRankTrackInfoEntity.getMid())
                        .productId(nstoreRankTrackInfoEntity.getProductId())
                        .rankChange(nstoreRankTrackInfoEntity.getRankChange())
                        .rankWithAdChange(nstoreRankTrackInfoEntity.getRankWithAdChange())
                        .json(nstoreRankTrackInfoEntity.getJson())
                        .nstoreRankTrackList(NstoreRankTrack.fromEntityList(nstoreRankTrackInfoEntity.getNstoreRankTrackEntityList(), nstoreRankTrackInfoEntity.getTrackStartDate()))
                        .build();
            } catch (Exception e) {
                e.printStackTrace();
                throw new BadRequestException("데이터 파싱 중 오류가 발생하였습니다.");
            }
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NstoreRankTrack {

            private Integer rank;
            private Integer prevRank;
            private Integer rankWithAd;
            private Integer prevRankWithAd;
            private String price;
            private String reviewCount;
            private String scoreInfo;
            private String ampm;
            private Boolean isValid;
            private LocalDateTime chartDate;
            private LocalDateTime createDate;

            public static List<NstoreRankTrack> fromEntityList(List<NstoreRankTrackEntity> nstoreRankTrackEntityList, LocalDateTime trackStartDate) {
                return nstoreRankTrackEntityList
                        .stream()
                        .filter(rankNstoreTrackEntity -> rankNstoreTrackEntity.getChartDate().isAfter(trackStartDate.minusNanos(1)))
                        .map(NstoreRankTrack::fromEntity)
                        .toList();
            }

            public static NstoreRankTrack fromEntity(NstoreRankTrackEntity nstoreRankTrackEntity) {
                return NstoreRankTrack.builder()
                        .rank(nstoreRankTrackEntity.getRank())
                        .prevRank(nstoreRankTrackEntity.getPrevRank())
                        .rankWithAd(nstoreRankTrackEntity.getRankWithAd())
                        .prevRankWithAd(nstoreRankTrackEntity.getPrevRankWithAd())
                        .price(nstoreRankTrackEntity.getPrice())
                        .reviewCount(nstoreRankTrackEntity.getReviewCount())
                        .scoreInfo(nstoreRankTrackEntity.getScoreInfo())
                        .isValid(nstoreRankTrackEntity.getIsValid())
                        .ampm(nstoreRankTrackEntity.getAmpm().toString())
                        .chartDate(nstoreRankTrackEntity.getChartDate())
                        .createDate(nstoreRankTrackEntity.getCreateDate())
                        .build();
            }

        }

    }

}
