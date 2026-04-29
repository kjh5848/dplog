package kr.co.nomadlab.dplog.owner;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record OwnerVerificationRequest(
        @NotBlank String businessNumber,
        @NotNull LocalDate openingDate,
        @NotBlank String representativeName,
        @NotBlank String placeId,
        @NotBlank String placeName,
        @NotBlank String category
) {
}
