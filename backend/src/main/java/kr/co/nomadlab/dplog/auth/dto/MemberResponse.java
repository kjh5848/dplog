package kr.co.nomadlab.dplog.auth.dto;

import kr.co.nomadlab.dplog.auth.domain.Member;

/**
 * 회원 정보 응답 DTO
 * - 프론트엔드 User 타입과 1:1 대응
 */
public record MemberResponse(
        String id,
        String email,
        String nickname,
        String name,
        String profileImageUrl,
        String provider,
        String providerId,
        String createdAt
) {
    /** Member 엔티티 → 응답 DTO 변환 */
    public static MemberResponse from(Member member) {
        return new MemberResponse(
                member.getId().toString(),
                member.getEmail(),
                member.getNickname(),
                member.getName(),
                member.getProfileImageUrl(),
                member.getProvider().name(),
                member.getProviderId(),
                member.getCreatedAt().toString()
        );
    }
}
