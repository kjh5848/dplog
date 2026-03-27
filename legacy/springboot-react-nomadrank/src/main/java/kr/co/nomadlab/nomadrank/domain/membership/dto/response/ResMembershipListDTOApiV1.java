package kr.co.nomadlab.nomadrank.domain.membership.dto.response;

import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.text.DecimalFormat;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResMembershipListDTOApiV1 {

    List<Membership> membershipList;

    public static ResMembershipListDTOApiV1 of(List<MembershipEntity> membershipEntityList) {
        return ResMembershipListDTOApiV1.builder()
                .membershipList(ResMembershipListDTOApiV1.Membership.fromMembershipEntityList(membershipEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Membership {
        private Long id;
        private String name;
        private Integer point;
        private BigDecimal price;
        private String priceFormatted;
        private Boolean isPopular;
        private String colorScheme;
        private Integer sortOrder;
        private Integer level;
        private String recommendedRevenueHint;
        private Boolean trialAvailable;
        private Integer trialDays;
        private BigDecimal priceYearly;
        private Integer discountPercent;

        public static List<Membership> fromMembershipEntityList(List<MembershipEntity> membershipEntityList) {
            return membershipEntityList.stream()
                    .map(Membership::fromMembershipEntity)
                    .toList();
        }

        public static Membership fromMembershipEntity(MembershipEntity membershipEntity) {
            BigDecimal price = membershipEntity.getPrice();
            String priceFormatted = formatPrice(price);
            return Membership.builder()
                    .id(membershipEntity.getId())
                    .name(membershipEntity.getName())
                    .point(membershipEntity.getPoint())
                    .price(price)
                    .priceFormatted(priceFormatted)
                    .isPopular(membershipEntity.getIsPopular())
                    .colorScheme(membershipEntity.getColorScheme())
                    .sortOrder(membershipEntity.getSortOrder())
                    .level(membershipEntity.getLevel())
                    .recommendedRevenueHint(membershipEntity.getRecommendedRevenueHint())
                    .trialAvailable(membershipEntity.getTrialAvailable())
                    .trialDays(membershipEntity.getTrialDays())
                    .priceYearly(membershipEntity.getPriceYearly())
                    .discountPercent(membershipEntity.getDiscountPercent())
                    .build();
        }

        private static String formatPrice(BigDecimal price) {
            if (price == null) return null;
            try {
                DecimalFormat df = new DecimalFormat("#,###");
                return df.format(price);
            } catch (Exception e) {
                return price.toPlainString();
            }
        }
    }

}
