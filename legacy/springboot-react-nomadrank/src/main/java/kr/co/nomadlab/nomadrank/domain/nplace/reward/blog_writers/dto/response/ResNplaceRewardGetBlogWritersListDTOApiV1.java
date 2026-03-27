package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceRewardBlogWritersEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRewardGetBlogWritersListDTOApiV1 {

    List<BlogWriters> blogWritersList;

    public static ResNplaceRewardGetBlogWritersListDTOApiV1 of(List<NplaceRewardBlogWritersEntity> nplaceRewardBlogWritersEntityList) {
        return ResNplaceRewardGetBlogWritersListDTOApiV1.builder()
                .blogWritersList(ResNplaceRewardGetBlogWritersListDTOApiV1.BlogWriters.fromBlogWritersEntityList(nplaceRewardBlogWritersEntityList))
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

        public static List<BlogWriters> fromBlogWritersEntityList(List<NplaceRewardBlogWritersEntity> nplaceRewardBlogWritersEntityList) {
            return nplaceRewardBlogWritersEntityList.stream()
                    .map(BlogWriters::fromBlogWritersEntity)
                    .toList();
        }

        public static BlogWriters fromBlogWritersEntity(NplaceRewardBlogWritersEntity NplaceRewardBlogWritersEntity) {
            return BlogWriters.builder()
                    .id(NplaceRewardBlogWritersEntity.getId())
                    .nplaceRewardBlogWritersType(NplaceRewardBlogWritersEntity.getNplaceRewardBlogWritersType().name())
                    .nplaceRewardBlogWritersTypeValue(NplaceRewardBlogWritersEntity.getNplaceRewardBlogWritersType().getValue())
                    .price(NplaceRewardBlogWritersEntity.getPrice())
                    .accountNumber(NplaceRewardBlogWritersEntity.getAccountNumber())
                    .deposit(NplaceRewardBlogWritersEntity.getDeposit())
                    .bankName(NplaceRewardBlogWritersEntity.getBankName())
                    .build();
        }
    }
}
