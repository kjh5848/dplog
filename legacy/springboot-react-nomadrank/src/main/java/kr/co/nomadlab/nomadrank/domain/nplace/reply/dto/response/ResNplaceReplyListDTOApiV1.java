package kr.co.nomadlab.nomadrank.domain.nplace.reply.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reply.entity.NplaceReplyEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceReplyListDTOApiV1 {

    private List<NplaceReply> nplaceReplyList;

    public static ResNplaceReplyListDTOApiV1 of(
            List<NplaceReplyEntity> nplaceReplyEntityList
    ) {
        return ResNplaceReplyListDTOApiV1.builder()
                .nplaceReplyList(ResNplaceReplyListDTOApiV1.NplaceReply.fromEntityList(nplaceReplyEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceReply {
        private Long id;
        private String placeId;
        private Boolean active;

        public static List<ResNplaceReplyListDTOApiV1.NplaceReply> fromEntityList(List<NplaceReplyEntity> nplaceReplyEntityList) {
            return nplaceReplyEntityList.stream()
                    .map(ResNplaceReplyListDTOApiV1.NplaceReply::fromEntity)
                    .toList();
        }

        public static ResNplaceReplyListDTOApiV1.NplaceReply fromEntity(NplaceReplyEntity nplaceReplyEntity) {
            return ResNplaceReplyListDTOApiV1.NplaceReply.builder()
                    .id(nplaceReplyEntity.getId())
                    .placeId(nplaceReplyEntity.getPlaceId())
                    .active(nplaceReplyEntity.getActive())
                    .build();
        }
    }
}
