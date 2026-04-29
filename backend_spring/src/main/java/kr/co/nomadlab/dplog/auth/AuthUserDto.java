package kr.co.nomadlab.dplog.auth;

import java.time.Instant;
import java.util.UUID;

public record AuthUserDto(
        UUID id,
        String email,
        String nickname,
        String name,
        String profileImageUrl,
        String provider,
        String providerId,
        UserRole role,
        Instant createdAt
) {
    public static AuthUserDto from(AppUser user) {
        return new AuthUserDto(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getName(),
                user.getProfileImageUrl(),
                "KAKAO",
                user.getKakaoSubject(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
