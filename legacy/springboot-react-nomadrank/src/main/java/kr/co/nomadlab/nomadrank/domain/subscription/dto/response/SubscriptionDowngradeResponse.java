package kr.co.nomadlab.nomadrank.domain.subscription.dto.response;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SubscriptionDowngradeResponse {

    private final String status;
    private final LocalDate effectiveDate;
    private final String message;
}
