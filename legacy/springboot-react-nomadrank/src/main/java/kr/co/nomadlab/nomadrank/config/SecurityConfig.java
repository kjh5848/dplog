package kr.co.nomadlab.nomadrank.config;

import jakarta.servlet.http.HttpServletResponse;
import kr.co.nomadlab.nomadrank.config.security.SecurityConstants;
import kr.co.nomadlab.nomadrank.config.security.SecurityJwtConfig
import kr.co.nomadlab.nomadrank.config.security.SecurityTokenProvider;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpStatus;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
// @PreAuthorize 활성화
// [예제]
// 1. @PreAuthorize("hasRole('USER')")
// 2. @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
// 3. @Secured("ROLE_TELLER")
public class SecurityConfig {

    final SecurityTokenProvider provider;
    final SessionManager sessionManager;

    public SecurityConfig(SecurityTokenProvider provider, SessionManager sessionManager) {
        this.provider = provider;
        this.sessionManager = sessionManager;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 허용할 origin 추가
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:3001");
        config.addAllowedOrigin("http://127.0.0.1:3000");
        config.addAllowedOrigin("https://dplog-dev.vercel.app");

        // HTTP 메서드 설정
        config.addAllowedMethod("*");
        
        // 허용할 헤더 설정
        config.addAllowedHeader("*");

        // 인증 정보 허용
        config.setAllowCredentials(true);

        // preflight 요청의 캐시 시간 설정
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
//            .exceptionHandling((exceptions) -> exceptions
//                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
//                .accessDeniedHandler(new JwtAccessDeniedHandler())
//            )
            .csrf(AbstractHttpConfigurer::disable)
//            .headers(header -> header.frameOptions(withDefaults()))
            .headers(AbstractHttpConfigurer::disable)
            .httpBasic(withDefaults())
//            .oauth2ResourceServer(OAuth2ResourceServerConfigurer :: jwt)
            .sessionManagement((session) ->
                    session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                            .sessionAuthenticationFailureHandler((request, response, exception) -> {
                                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                                response.setContentType("application/json;charset=UTF-8");
                                response.getWriter().write("{\"code\":-9,\"message\":\"세션이 만료되었습니다.\"}");
                            })
            )
            // .logout(logout -> logout
            //         .logoutUrl("/v1/auth/security-logout")  // 커스텀 로그아웃과 충돌 방지
            //         .deleteCookies("JSESSIONID")
            //         .logoutSuccessHandler((request, response, authentication) -> {
            //             System.out.println("=== Spring Security 로그아웃 핸들러 호출됨 ===");
            //             // SessionManager에서 세션 제거
            //             ResAuthInfoDTOApiV1 resAuthInfo = (ResAuthInfoDTOApiV1) request.getSession().getAttribute("authInfo");
            //             if (resAuthInfo != null) {
            //                 String username = resAuthInfo.getUser().getUsername();
            //                 System.out.println("Spring Security 로그아웃 - 사용자: " + username);
            //                 if (!username.equals("testuser") && !username.equals("richmanager")) {
            //                     sessionManager.removeSession(username);
            //                 }
            //             }
                        
            //             response.setStatus(HttpServletResponse.SC_OK);
            //             response.setContentType("application/json;charset=UTF-8");
            //             response.getWriter().write("{\"code\":0,\"message\":\"로그아웃 되었습니다.\"}");
            //         })
            // )

            .cors(httpSecurityCorsConfigurer -> httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource())) // Bean 기본 이름이 corsConfigurationSource
            // .cors(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests((authorize) ->
                authorize
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(SecurityConstants.WHITELIST).permitAll()
                    .requestMatchers(SecurityConstants.ADMIN).hasAuthority("ADMIN")
                    .requestMatchers(SecurityConstants.DISTRIBUTOR_MANAGER).hasAnyAuthority("ADMIN", "DISTRIBUTOR_MANAGER")
                    .requestMatchers(SecurityConstants.EMPLOYEE).hasAnyAuthority("ADMIN", "DISTRIBUTOR_MANAGER", "EMPLOYEE")
                    .anyRequest().permitAll()

            )
                // RememberMe
//            .rememberMe((remember) -> remember
//                    .rememberMeServices(rememberMeServices)
//            )
            .exceptionHandling(exceptionConfig -> exceptionConfig
                    .authenticationEntryPoint((request, response, authException) -> {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write("{\"code\":-1,\"message\":\"인증에 실패했습니다.\"}");
                    }));
            // .with(new SecurityJwtConfig(provider), Customizer.withDefaults());

        return http.build();
    }

    // @Bean
    // public WebSecurityCustomizer webSecurityCustomizer() {
    // return (web) -> web.ignoring().requestMatchers(SecurityConstants.WHITELIST);
    // }

    // @Bean
    // CorsConfigurationSource corsConfigurationSource() {
    // var configuration = new CorsConfiguration();
    // configuration.addAllowedHeader("*");
    // configuration.addAllowedMethod("*");
    // configuration.setAllowedOrigins(
    // List.of(
    // "http://localhost",
    // "http://localhost:3000/",
    // "http://localhost:8080",
    // "http://3.35.57.10",
    // "https://3.35.57.10"
    //
    // )
    // );
    //
    // configuration.addExposedHeader("Authorization");
    //
    // configuration.setAllowCredentials(true); // 클라이언트에서 쿠키 요청 허용
    // configuration.addExposedHeader(SecurityConstants.TOKEN_HEADER);
    //
    // var source = new UrlBasedCorsConfigurationSource();
    // source.registerCorsConfiguration("/**", configuration);
    // return source;
    // }

    // @Bean
    // RememberMeServices rememberMeServices(UserDetailsService userDetailsService)
    // {
    // TokenBasedRememberMeServices.RememberMeTokenAlgorithm encodingAlgorithm =
    // TokenBasedRememberMeServices.RememberMeTokenAlgorithm.SHA256;
    // TokenBasedRememberMeServices rememberMe = new
    // TokenBasedRememberMeServices(myKey, userDetailsService, encodingAlgorithm);
    // rememberMe.setMatchingAlgorithm(TokenBasedRememberMeServices.RememberMeTokenAlgorithm.MD5);
    // return rememberMe;
    // }

    // 세션 동시성 제어하기 위해 사용
    // @Bean
    // public HttpSessionEventPublisher httpSessionEventPublisher() {
    // return new HttpSessionEventPublisher();
    // }

    // @Bean
    // public JwtAuthenticationConverter jwtAuthenticationConverter() {
    // var grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
    // grantedAuthoritiesConverter.setAuthorityPrefix("");
    //
    // var jwtAuthenticationConverter = new JwtAuthenticationConverter();
    // jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
    // return jwtAuthenticationConverter;
    // }

}
