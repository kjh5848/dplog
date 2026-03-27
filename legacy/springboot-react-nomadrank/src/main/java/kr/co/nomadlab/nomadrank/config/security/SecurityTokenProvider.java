package kr.co.nomadlab.nomadrank.config.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class SecurityTokenProvider {
   private final Algorithm algorithm = Algorithm.HMAC256(SecurityConstants.SECRET_KEY);
   private final SecurityService userDetailsService;

//   JwtEncoder encoder;
//   JwtDecoder decoder;

   @Autowired
   public SecurityTokenProvider(SecurityService userDetailsService
//                                ,JwtEncoder encoder, JwtDecoder decoder
   ) {
      this.userDetailsService = userDetailsService;
//      this.encoder = encoder;
//      this.decoder = decoder;
   }

   public String createToken (Authentication authentication, SecurityTokenType tokenType) {
//      var now = Instant.now();
//      var expiry = 36000L;
      var scope = authentication.getAuthorities().stream()
                                       .map(GrantedAuthority::getAuthority)
                                       .collect(Collectors.joining(","));
//      var claims = JwtClaimsSet.builder()
//              .issuer("nomadlab")
//              .issuedAt(now)
//              .expiresAt(now.plusSeconds(expiry))
//              .subject(authentication.getName())
//              .claim(SecurityConstants.RULE_KEY, scope)
//              .build();
//      return this.encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

      String token = "";
      try {
         token = JWT.create()
                    .withIssuer("nomadlab")
                    .withExpiresAt(createExpiresDate(tokenType))
                    .withSubject(authentication.getName())
                    .withClaim(SecurityConstants.RULE_KEY, scope)
                    .withClaim(SecurityConstants.TOKEN_TYPE, tokenType.name())
                    .sign(algorithm);
      } catch (JWTCreationException exception){
         // Invalid Signing configuration / Couldn't convert Claims.
      }
      return token;
   }

   public String createToken (String username, List<String> rules, SecurityTokenType tokenType) {
//      var now = Instant.now();
//      var expiry = 36000L;
//      var claims = JwtClaimsSet.builder()
//              .issuer("self")
//              .issuedAt(now)
//              .expiresAt(now.plusSeconds(expiry))
//              .subject(id)
//              .claim(SecurityConstants.RULE_KEY, rules)
//              .build();
//      return this.encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

      String token = "";
      try {
         token = JWT.create()
                 .withIssuer("nomadlab")
                 .withExpiresAt(createExpiresDate(tokenType))
                 .withSubject(username)
                 .withClaim(SecurityConstants.RULE_KEY, rules)
                 .withClaim(SecurityConstants.TOKEN_TYPE, tokenType.name())
                 .sign(algorithm);
      } catch (JWTCreationException exception){
         // Invalid Signing configuration / Couldn't convert Claims.
      }
      return token;
   }

   public Authentication getAuthentication(String token) {
//      var jwt = decoder.decode(token);
//      var claims = jwt.getClaims();

//      Collection<? extends GrantedAuthority> authorities =
//              Arrays.stream(claims.get(SecurityConstants.RULE_KEY).toString().split(","))
//                      .map(SimpleGrantedAuthority::new)
//                      .collect(Collectors.toList());
//
//      var principal = new User(jwt.getSubject(), "", authorities);

//      return new UsernamePasswordAuthenticationToken(principal, token, authorities);
      if(token==null){
         throw new AuthenticationException("토큰이 만료되었습니다.");
      }
      var decodedJWT = JWT.require(algorithm).build().verify(token);
      var username = decodedJWT.getSubject();
      var userDetails = userDetailsService.loadUserByUsername(username);
      return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
   }

   public DecodedJWT getTokenInformation(String token){
      return JWT.require(algorithm).build().verify(token);
   }


   public boolean validateToken(String jwt) {
      try {
         var verify = JWT.require(algorithm).build().verify(jwt);

         if (new Date().after(verify.getExpiresAt()) ) {
            throw new AuthenticationException("세션이 만료되었습니다.");
         }

         if (!verify.getClaim(SecurityConstants.TOKEN_TYPE).asString().equals(SecurityTokenType.ACCESS_TOKEN.name())) {
            throw new AuthenticationException("올바르지 않은 토큰입니다.");
         }

      } catch (JWTVerificationException e) {
         return false;
      }
      return true;
   }

   private Instant createExpiresDate(SecurityTokenType tokenType) {
      Instant expiresDate;
      if(tokenType == SecurityTokenType.ACCESS_TOKEN) {
         expiresDate = ZonedDateTime.now().plusHours(SecurityConstants.accessTokenDurationHour).toInstant();
      } else if(tokenType == SecurityTokenType.REFRESH_TOKEN) {
         expiresDate = ZonedDateTime.now().plusDays(SecurityConstants.refreshTokenDurationDay).toInstant();
      } else {
         expiresDate = ZonedDateTime.now().toInstant();
      }
      return expiresDate;
   }

}
