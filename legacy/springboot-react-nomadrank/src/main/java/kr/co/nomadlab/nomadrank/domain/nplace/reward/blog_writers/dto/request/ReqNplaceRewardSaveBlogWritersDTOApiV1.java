package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.enums.NplaceRewardBlogWritersType;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceRewardBlogWritersEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardPlaceEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRewardSaveBlogWritersDTOApiV1 {

    @Valid
    @NotNull(message = "blogWriters를 입력하세요.")
    private BlogWriters blogWriters;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlogWriters {

        @NotNull(message = "nplaceRewardBlogWritersType는 필수입니다.")
        private NplaceRewardBlogWritersType nplaceRewardBlogWritersType;

        @NotNull(message = "price은 필수입니다.")
        private Integer price;

        @NotNull(message = "accountNumber은 필수입니다.")
        private String accountNumber;

        @NotNull(message = "deposit은 필수입니다.")
        private String deposit;

        @NotNull(message = "bankName은 필수입니다.")
        private String bankName;
    }


    public NplaceRewardBlogWritersEntity toBlogWritersEntity(UserEntity userEntity) {
        return NplaceRewardBlogWritersEntity.builder()
                .nplaceRewardBlogWritersType(blogWriters.nplaceRewardBlogWritersType)
                .price(blogWriters.price)
                .accountNumber(blogWriters.accountNumber)
                .deposit(blogWriters.deposit)
                .bankName(blogWriters.bankName)
                .userEntity(userEntity)
                .distributorEntity(userEntity.getDistributorEntity())
                .build();
    }
}
