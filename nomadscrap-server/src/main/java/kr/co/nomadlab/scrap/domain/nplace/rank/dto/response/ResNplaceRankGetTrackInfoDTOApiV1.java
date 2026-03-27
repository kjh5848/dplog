package kr.co.nomadlab.scrap.domain.nplace.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackInfoEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRankGetTrackInfoDTOApiV1 {

    private List<NplaceRankTrackInfo> nplaceRankTrackInfoList;

    public static ResNplaceRankGetTrackInfoDTOApiV1 of(List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList) {
        return ResNplaceRankGetTrackInfoDTOApiV1.builder()
                .nplaceRankTrackInfoList(NplaceRankTrackInfo.fromEntityList(nplaceRankTrackInfoEntityList))
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
        private String businessSector;
        private String shopId;
        private Integer rankChange;
        private JsonNode json;

        public static List<NplaceRankTrackInfo> fromEntityList(List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList) {
            return nplaceRankTrackInfoEntityList.stream()
                    .map(NplaceRankTrackInfo::fromEntity)
                    .toList();
        }

        public static NplaceRankTrackInfo fromEntity(NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity) {
            try {
                return NplaceRankTrackInfo.builder()
                        .id(nplaceRankTrackInfoEntity.getId())
                        .keyword(nplaceRankTrackInfoEntity.getKeyword())
                        .province(nplaceRankTrackInfoEntity.getProvince())
                        .businessSector(nplaceRankTrackInfoEntity.getBusinessSector())
                        .shopId(nplaceRankTrackInfoEntity.getShopId())
                        .rankChange(nplaceRankTrackInfoEntity.getRankChange())
                        .json(nplaceRankTrackInfoEntity.getJson())
                        .build();
            } catch (Exception e) {
                e.printStackTrace();
                throw new BadRequestException("데이터 파싱 중 오류가 발생하였습니다.");
            }
        }

    }

}
