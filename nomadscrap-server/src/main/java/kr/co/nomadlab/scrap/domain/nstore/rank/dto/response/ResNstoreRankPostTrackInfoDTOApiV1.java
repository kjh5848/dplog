package kr.co.nomadlab.scrap.domain.nstore.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackInfoEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNstoreRankPostTrackInfoDTOApiV1 {

    private List<NstoreRankTrackInfo> nstoreRankTrackInfoList;

    public static ResNstoreRankPostTrackInfoDTOApiV1 of(List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList) {
        return ResNstoreRankPostTrackInfoDTOApiV1.builder()
                .nstoreRankTrackInfoList(NstoreRankTrackInfo.fromEntityList(nstoreRankTrackInfoEntityList))
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
        private JsonNode json;

        public static List<NstoreRankTrackInfo> fromEntityList(List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList) {
            return nstoreRankTrackInfoEntityList.stream()
                    .map(NstoreRankTrackInfo::fromEntity)
                    .toList();
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
                        .build();
            } catch (Exception e) {
                e.printStackTrace();
                throw new BadRequestException("데이터 파싱 중 오류가 발생하였습니다.");
            }
        }

    }

}
