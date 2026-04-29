package kr.co.nomadlab.dplog.auth;

public record KakaoAuthorizeResponse(String authorizeUrl, String state) {
}
