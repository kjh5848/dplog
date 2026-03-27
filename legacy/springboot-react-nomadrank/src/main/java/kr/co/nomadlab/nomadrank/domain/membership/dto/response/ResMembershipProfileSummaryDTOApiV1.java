package kr.co.nomadlab.nomadrank.domain.membership.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import kr.co.nomadlab.nomadrank.domain.membership.dto.response.component.MembershipUsageDTO;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResMembershipProfileSummaryDTOApiV1 {

    private CurrentDTO current;
    private List<HistoryItemDTO> history;
    private HistoryPageInfoDTO historyPageInfo;
    private UsageDTO usage;
    private List<PaymentDTO> payments;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentDTO {
        private Long membershipUserId;
        private Long membershipId;
        private String membershipName;
        private BillingCycle billingCycle;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer remainingDays;
        private Integer compareLevel;
        private BigDecimal comparePriceMonthly;
        private BigDecimal comparePriceYearly;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryItemDTO {
        private Long membershipUserId;
        private Long membershipId;
        private String membershipName;
        private BillingCycle billingCycle;
        private LocalDate startDate;
        private LocalDate endDate;
        private MembershipState state;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryPageInfoDTO {
        private String nextCursor;
        private boolean hasNextPage;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsageDTO {
        private MembershipUsageDTO trackKeywords;
        private MembershipUsageDTO realtimeQueries;
        private Map<String, MembershipUsageDTO> extras;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDTO {
        private String id;
        private BigDecimal amount;
        private String planName;
        private String paymentMethod;
        private String status;
        private String paidAt;
        private String receiptUrl;
    }
}
