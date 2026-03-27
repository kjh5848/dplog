package kr.co.nomadlab.nomadrank.domain.nplace.reply.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.model.nplace.reply.entity.NplaceReplyEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.naver.entity.UserNaverEntity;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.request.ReqPumpingstorePostSellerNvidDTO;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.request.ReqPumpingstorePutSellerNvidDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceReplyChangeNplaceReplyDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceReplyInfo를 입력하세요.")
    private NplaceReplyInfo nplaceReplyInfo;

    public NplaceReplyEntity toEntity(UserEntity userEntity) {
        return NplaceReplyEntity.builder()
                .userEntity(userEntity)
                .placeId(nplaceReplyInfo.getPlaceId())
                .active(nplaceReplyInfo.getActive())
                .build();
    }

    public ReqPumpingstorePostSellerNvidDTO toPumpingstorePostNvIdDTO(UserNaverEntity userNaverEntity) {
        return ReqPumpingstorePostSellerNvidDTO.builder()
                .sellerNvid(
                        ReqPumpingstorePostSellerNvidDTO.SellerNvid.builder()
                                .nvId(userNaverEntity.getNaverId())
                                .nvPw(userNaverEntity.getNaverPw())
                                .nplaceId(nplaceReplyInfo.getPlaceId())
                                .build()
                )
                .build();
    }

    public ReqPumpingstorePutSellerNvidDTO toPumpingstorePutNvIdDTO(UserNaverEntity userNaverEntity) {
        return ReqPumpingstorePutSellerNvidDTO.builder()
                .sellerNvid(
                        ReqPumpingstorePutSellerNvidDTO.SellerNvid.builder()
                                .nvPw(userNaverEntity.getNaverPw())
                                .nplaceId(nplaceReplyInfo.getPlaceId())
                                .active(nplaceReplyInfo.getActive())
                                .build()
                )
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceReplyInfo {
        @NotNull(message = "placeId를 입력하세요.")
        private String placeId;
        @NotNull(message = "활성화 여부를 입력하세요.")
        private Boolean active;
    }
}
