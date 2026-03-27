package kr.co.nomadlab.nomadrank.config.security;

import com.auth0.jwt.exceptions.SignatureVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class SecurityFilter extends OncePerRequestFilter {

   final SecurityTokenProvider provider;

   public SecurityFilter(SecurityTokenProvider provide) {
      this.provider = provide;
   }

   @Override
   public void doFilterInternal (
           HttpServletRequest request,
           HttpServletResponse response,
           FilterChain chain
   ) throws IOException, ServletException {
      var jwt = resolveToken(request);
      if (StringUtils.hasText(jwt)) {

         if (!provider.validateToken(jwt)) {
            throw new AuthenticationException("접근이 거부되었습니다.");
         }

         try {
            var authentication = provider.getAuthentication(jwt);
            SecurityContextHolder.getContext().setAuthentication(authentication);
         } catch (TokenExpiredException | SignatureVerificationException exception) {
            exception.printStackTrace();
         }
      }
      chain.doFilter(request, response);
   }

   String resolveToken(HttpServletRequest request) {
      String bearerToken = request.getHeader(SecurityConstants.TOKEN_HEADER);
      if (StringUtils.hasText(bearerToken)) {
//      if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(SecurityConstants.TOKEN_PREFIX)) {
         return bearerToken;
//         return bearerToken.substring(7);
      }
      return null;
   }

}
