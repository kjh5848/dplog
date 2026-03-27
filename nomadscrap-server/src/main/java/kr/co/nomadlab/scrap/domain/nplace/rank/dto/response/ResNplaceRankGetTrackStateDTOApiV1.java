package kr.co.nomadlab.scrap.domain.nplace.rank.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackInfoEntity;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Objects;

@Getter
@Builder
public class ResNplaceRankGetTrackStateDTOApiV1 {
    private Integer totalTrackInfoCount;
    private Integer completedTrackInfoCount;
    private List<TrackInfo> completedTrackInfoList;

    public static ResNplaceRankGetTrackStateDTOApiV1 of(List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList) {
        List<TrackInfo> trackInfoList = nplaceRankTrackInfoEntityList.stream()
                .map(TrackInfo::from)
                .distinct()
                .toList();
        List<TrackInfo> completedTrackInfoList = trackInfoList.stream()
                .filter(trackInfo -> trackInfo.getTrackStatus().equals(TrackStatusType.COMPLETE))
                .toList();
        return ResNplaceRankGetTrackStateDTOApiV1.builder()
                .totalTrackInfoCount(trackInfoList.size())
                .completedTrackInfoCount(completedTrackInfoList.size())
                .completedTrackInfoList(completedTrackInfoList)
                .build();
    }

    @Getter
    @Builder
    public static class TrackInfo {
        private String keyword;
        private String province;
        @JsonIgnore
        private TrackStatusType trackStatus;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof TrackInfo trackInfo)) return false;
            return Objects.equals(keyword, trackInfo.keyword) && Objects.equals(province, trackInfo.province);
        }

        @Override
        public int hashCode() {
            return Objects.hash(keyword, province);
        }

        public static List<TrackInfo> from(List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList) {
            return nplaceRankTrackInfoEntityList.stream()
                    .map(TrackInfo::from)
                    .toList();
        }

        public static TrackInfo from(NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity) {
            return TrackInfo.builder()
                    .keyword(nplaceRankTrackInfoEntity.getKeyword())
                    .province(nplaceRankTrackInfoEntity.getProvince())
                    .trackStatus(nplaceRankTrackInfoEntity.getTrackStatus())
                    .build();
        }
    }

}