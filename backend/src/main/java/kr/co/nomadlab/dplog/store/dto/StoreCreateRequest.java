package kr.co.nomadlab.dplog.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 가게 등록 요청 DTO
 */
public record StoreCreateRequest(
        @NotBlank(message = "가게명은 필수입니다.")
        @Size(max = 100, message = "가게명은 100자 이내여야 합니다.")
        String name,

        @NotBlank(message = "카테고리는 필수입니다.")
        @Size(max = 50, message = "카테고리는 50자 이내여야 합니다.")
        String category,

        @NotBlank(message = "주소는 필수입니다.")
        @Size(max = 300, message = "주소는 300자 이내여야 합니다.")
        String address,

        @NotBlank(message = "플레이스 URL은 필수입니다.")
        @Size(max = 500, message = "플레이스 URL은 500자 이내여야 합니다.")
        String placeUrl,

        @Size(max = 20, message = "전화번호는 20자 이내여야 합니다.")
        String phone
) {}
