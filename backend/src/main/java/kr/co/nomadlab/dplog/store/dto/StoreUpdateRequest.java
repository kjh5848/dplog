package kr.co.nomadlab.dplog.store.dto;

import jakarta.validation.constraints.Size;

/**
 * 가게 수정 요청 DTO
 * - 모든 필드 옵션 (부분 수정 지원)
 * - null인 필드는 기존 값 유지
 */
public record StoreUpdateRequest(
        @Size(max = 100, message = "가게명은 100자 이내여야 합니다.")
        String name,

        @Size(max = 50, message = "카테고리는 50자 이내여야 합니다.")
        String category,

        @Size(max = 300, message = "주소는 300자 이내여야 합니다.")
        String address,

        @Size(max = 500, message = "플레이스 URL은 500자 이내여야 합니다.")
        String placeUrl,

        @Size(max = 20, message = "전화번호는 20자 이내여야 합니다.")
        String phone
) {}
