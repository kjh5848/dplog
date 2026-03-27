package kr.co.nomadlab.dplog.auth.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import kr.co.nomadlab.dplog.auth.domain.Member;
import kr.co.nomadlab.dplog.auth.dto.TokenPair;
import kr.co.nomadlab.dplog.common.properties.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.Date;
import java.util.UUID;

/**
 * JWT 토큰 생성/검증 제공자
 * - HMAC-SHA256 기반 서명
 * - nimbus-jose-jwt 라이브러리 사용
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final byte[] secretKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtTokenProvider(AppProperties appProperties) {
        // Secret Key는 최소 32바이트(256비트) 이상이어야 함
        String secret = appProperties.jwt().secret();
        // 짧은 키를 패딩하여 256비트로 맞추기
        if (secret.length() < 32) {
            secret = String.format("%-32s", secret).replace(' ', '0');
        }
        this.secretKey = secret.getBytes();
        this.accessExpirationMs = appProperties.jwt().expirationMs();
        this.refreshExpirationMs = appProperties.jwt().refreshExpirationMs();
    }

    /**
     * 회원 정보로 액세스 토큰 + 리프레시 토큰 쌍 생성
     */
    public TokenPair generateTokenPair(Member member) {
        String accessToken = generateAccessToken(member);
        String refreshToken = generateRefreshToken(member);
        return new TokenPair(accessToken, refreshToken);
    }

    /**
     * 액세스 토큰 생성
     * - 클레임: sub(memberId), email, nickname
     * - 만료: 1시간 (설정 가능)
     */
    public String generateAccessToken(Member member) {
        try {
            Date now = new Date();
            Date expiration = new Date(now.getTime() + accessExpirationMs);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(member.getId().toString())
                    .claim("email", member.getEmail())
                    .claim("nickname", member.getNickname())
                    .issuer("dplog")
                    .issueTime(now)
                    .expirationTime(expiration)
                    .jwtID(UUID.randomUUID().toString())
                    .build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claimsSet
            );
            signedJWT.sign(new MACSigner(secretKey));

            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("액세스 토큰 생성 실패", e);
        }
    }

    /**
     * 리프레시 토큰 생성
     * - 클레임: sub(memberId)
     * - 만료: 7일 (설정 가능)
     */
    public String generateRefreshToken(Member member) {
        try {
            Date now = new Date();
            Date expiration = new Date(now.getTime() + refreshExpirationMs);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(member.getId().toString())
                    .claim("type", "refresh")
                    .issuer("dplog")
                    .issueTime(now)
                    .expirationTime(expiration)
                    .jwtID(UUID.randomUUID().toString())
                    .build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claimsSet
            );
            signedJWT.sign(new MACSigner(secretKey));

            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("리프레시 토큰 생성 실패", e);
        }
    }

    /**
     * 토큰 검증 → memberId(subject) 반환
     *
     * @return memberId (Long)
     * @throws RuntimeException 검증 실패 시
     */
    public Long validateTokenAndGetMemberId(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secretKey);

            if (!signedJWT.verify(verifier)) {
                throw new RuntimeException("유효하지 않은 토큰 서명");
            }

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            // 만료 시간 확인
            if (claims.getExpirationTime().before(new Date())) {
                throw new RuntimeException("만료된 토큰");
            }

            return Long.parseLong(claims.getSubject());
        } catch (ParseException | JOSEException e) {
            throw new RuntimeException("토큰 파싱/검증 실패", e);
        }
    }

    /**
     * 토큰에서 subject(memberId) 추출 (검증 없이)
     */
    public Long getMemberIdFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return Long.parseLong(signedJWT.getJWTClaimsSet().getSubject());
        } catch (ParseException e) {
            throw new RuntimeException("토큰 파싱 실패", e);
        }
    }

    /**
     * 리프레시 토큰의 만료 시간(ms) 조회
     */
    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }
}
