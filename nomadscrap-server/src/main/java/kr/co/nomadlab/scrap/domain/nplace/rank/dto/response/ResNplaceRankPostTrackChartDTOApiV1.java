package kr.co.nomadlab.scrap.domain.nplace.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackEntity;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackInfoEntity;
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
public class ResNplaceRankPostTrackChartDTOApiV1 {

    private Map<String, NplaceRankTrackInfo> nplaceRankTrackInfoMap;

    public static ResNplaceRankPostTrackChartDTOApiV1 of(List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList) {
        return ResNplaceRankPostTrackChartDTOApiV1.builder()
                .nplaceRankTrackInfoMap(NplaceRankTrackInfo.fromEntityListToMap(nplaceRankTrackInfoEntityList))
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
        private String shopId;
        private Integer rankChange;
        private List<NplaceRankTrack> nplaceRankTrackList;
        private JsonNode json;

        public static Map<String, NplaceRankTrackInfo> fromEntityListToMap(List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList) {
            HashMap<String, NplaceRankTrackInfo> nstoreTrackInfoMap = new HashMap<>();
            for (NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity : nplaceRankTrackInfoEntityList) {
                nstoreTrackInfoMap.put(
                        "[%s]%s".formatted(nplaceRankTrackInfoEntity.getProvince(), nplaceRankTrackInfoEntity.getKeyword()),
                        NplaceRankTrackInfo.fromEntity(nplaceRankTrackInfoEntity)
                );
            }
            return nstoreTrackInfoMap;
        }

        public static NplaceRankTrackInfo fromEntity(NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity) {
            try {
                return NplaceRankTrackInfo.builder()
                        .id(nplaceRankTrackInfoEntity.getId())
                        .keyword(nplaceRankTrackInfoEntity.getKeyword())
                        .province(nplaceRankTrackInfoEntity.getProvince())
                        .shopId(nplaceRankTrackInfoEntity.getShopId())
                        .rankChange(nplaceRankTrackInfoEntity.getRankChange())
                        .nplaceRankTrackList(NplaceRankTrack.fromEntityList(nplaceRankTrackInfoEntity.getNplaceRankTrackEntityList(), nplaceRankTrackInfoEntity.getTrackStartDate()))
                        .json(nplaceRankTrackInfoEntity.getJson())
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
        public static class NplaceRankTrack {

            private Integer rank;
            private Integer prevRank;
            private String visitorReviewCount;
            private String blogReviewCount;
            private String scoreInfo;
            private String saveCount;
            private String ampm;
            private Boolean isValid;
            private LocalDateTime chartDate;
            private LocalDateTime createDate;

            public static List<NplaceRankTrack> fromEntityList(List<NplaceRankTrackEntity> nplaceRankTrackEntityList, LocalDateTime trackStartDate) {
                return nplaceRankTrackEntityList
                        .stream()
                        .filter(rankNplaceTrackEntity -> rankNplaceTrackEntity.getChartDate().isAfter(trackStartDate.minusNanos(1)))
                        .map(NplaceRankTrack::fromEntity)
                        .toList();
            }

            public static NplaceRankTrack fromEntity(NplaceRankTrackEntity nplaceRankTrackEntity) {
                return NplaceRankTrack.builder()
                        .rank(nplaceRankTrackEntity.getRank())
                        .prevRank(nplaceRankTrackEntity.getPrevRank())
                        .visitorReviewCount(nplaceRankTrackEntity.getVisitorReviewCount())
                        .blogReviewCount(nplaceRankTrackEntity.getBlogReviewCount())
                        .scoreInfo(nplaceRankTrackEntity.getScoreInfo())
                        .saveCount(nplaceRankTrackEntity.getSaveCount())
                        .isValid(nplaceRankTrackEntity.getIsValid())
                        .ampm(nplaceRankTrackEntity.getAmpm().toString())
                        .chartDate(nplaceRankTrackEntity.getChartDate())
                        .createDate(nplaceRankTrackEntity.getCreateDate())
                        .build();
            }

        }

    }

}
