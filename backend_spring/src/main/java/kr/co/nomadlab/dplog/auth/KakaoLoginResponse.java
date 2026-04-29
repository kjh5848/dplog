package kr.co.nomadlab.dplog.auth;

public record KakaoLoginResponse(AuthUserDto user, ChannelRelationDto channel) {
}
