package kr.co.nomadlab.nomadrank.domain.membership.dto.response;

import java.math.BigDecimal;

import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResMembershipCheckDTOApiV1 {

    public enum CompareResult {
        HIGHER, EQUAL, LOWER, NONE
    }

    private Long id;
    private String name;
    // private Integer point;
    private BigDecimal price;
    private String recommendedRevenueHint;
    private Boolean isPopular;
    private String colorScheme;
    private Integer sortOrder;
    private BillingCycle billingCycle;
    private BigDecimal priceMonthly;
    private BigDecimal priceYearly;

    private Long currentMembershipId;
    private String currentMembershipName;
    private BigDecimal currentMembershipPrice;
    private BigDecimal currentMembershipPriceMonthly;
    private BigDecimal currentMembershipPriceYearly;

    private boolean canPurchase;
    private CompareResult compareResult;
    private String message;

    public static ResMembershipCheckDTOApiV1 from(MembershipEntity selected,
            MembershipEntity current,
            BillingCycle billingCycle) {
        BillingCycle effectiveCycle = billingCycle != null ? billingCycle : BillingCycle.MONTHLY;

        BigDecimal selectedMonthlyPrice = selected != null ? safePrice(selected.getPrice()) : null;
        BigDecimal selectedYearlyPrice = selected != null ? selected.getPriceYearly() : null;
        BigDecimal selectedCyclePrice = resolvePriceForCycle(selected, effectiveCycle, false);

        BigDecimal currentMonthlyPrice = current != null ? safePrice(current.getPrice()) : null;
        BigDecimal currentYearlyPrice = current != null ? current.getPriceYearly() : null;
        BigDecimal currentCyclePrice = resolvePriceForCycle(current, effectiveCycle, true);

        CompareResult result;
        boolean canPurchase;
        String message;

        if (current == null) {
            result = CompareResult.NONE;
            canPurchase = true;
            message = "구매 가능합니다.";
        } else {
            int cmp = selectedCyclePrice.compareTo(currentCyclePrice);
            result = cmp > 0 ? CompareResult.HIGHER : (cmp == 0 ? CompareResult.EQUAL : CompareResult.LOWER);
            canPurchase = cmp > 0;

            if (canPurchase) {
                message = "상위 멤버십으로 업그레이드 가능합니다.";
            } else if (cmp == 0) {
                message = "현재 보유한 멤버십과 동일합니다. 연간으로 업그레이드 할 수 있습니다.";
            } else {
                message = "현재 보유한 멤버십이 더 높거나 같습니다.";
            }
        }

        return ResMembershipCheckDTOApiV1.builder()
                .id(selected != null ? selected.getId() : null)
                .name(selected != null ? selected.getName() : null)
                // .point(selected != null ? selected.getPoint() : null)
                .price(selectedCyclePrice)
                .recommendedRevenueHint(selected != null ? selected.getRecommendedRevenueHint() : null)
                .isPopular(selected != null ? selected.getIsPopular() : null)
                .colorScheme(selected != null ? selected.getColorScheme() : null)
                .sortOrder(selected != null ? selected.getSortOrder() : null)
                .billingCycle(effectiveCycle)
                .priceMonthly(selectedMonthlyPrice)
                .priceYearly(selectedYearlyPrice)
                .currentMembershipId(current != null ? current.getId() : null)
                .currentMembershipName(current != null ? current.getName() : null)
                .currentMembershipPrice(currentCyclePrice)
                .currentMembershipPriceMonthly(currentMonthlyPrice)
                .currentMembershipPriceYearly(currentYearlyPrice)
                .canPurchase(canPurchase)
                .compareResult(result)
                .message(message)
                .build();
    }

    private static BigDecimal resolvePriceForCycle(MembershipEntity membership,
            BillingCycle billingCycle,
            boolean fallbackToMonthly) {
        if (membership == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal monthly = safePrice(membership.getPrice());
        if (billingCycle == BillingCycle.YEARLY) {
            BigDecimal yearly = membership.getPriceYearly();
            if (yearly != null) {
                return yearly;
            }
            return fallbackToMonthly ? monthly : BigDecimal.ZERO;
        }

        return monthly;
    }

    private static BigDecimal safePrice(BigDecimal price) {
        return price != null ? price : BigDecimal.ZERO;
    }
}
