package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceRewardBlogWritersEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRewardGetBlogWritersDTOApiV1 {

    BlogWriters blogWriters;

    public static ResNplaceRewardGetBlogWritersDTOApiV1 of(NplaceRewardBlogWritersEntity nplaceRewardBlogWritersEntity) {
        return ResNplaceRewardGetBlogWritersDTOApiV1.builder()
                .blogWriters(ResNplaceRewardGetBlogWritersDTOApiV1.BlogWriters.fromBlogWritersEntity(nplaceRewardBlogWritersEntity))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlogWriters {
        private Long id;
        private String nplaceRewardBlogWritersType;
        private String nplaceRewardBlogWritersTypeValue;
        private Integer price;
        private String accountNumber;
        private String deposit;
        private String bankName;

        public static BlogWriters fromBlogWritersEntity(NplaceRewardBlogWritersEntity nplaceRewardBlogWritersEntity) {
            return BlogWriters.builder()
                    .id(nplaceRewardBlogWritersEntity.getId())
                    .nplaceRewardBlogWritersType(nplaceRewardBlogWritersEntity.getNplaceRewardBlogWritersType().name())
                    .nplaceRewardBlogWritersTypeValue(nplaceRewardBlogWritersEntity.getNplaceRewardBlogWritersType().getValue())
                    .price(nplaceRewardBlogWritersEntity.getPrice())
                    .accountNumber(nplaceRewardBlogWritersEntity.getAccountNumber())
                    .deposit(nplaceRewardBlogWritersEntity.getDeposit())
                    .bankName(nplaceRewardBlogWritersEntity.getBankName())
                    .build();
        }
    }
}
