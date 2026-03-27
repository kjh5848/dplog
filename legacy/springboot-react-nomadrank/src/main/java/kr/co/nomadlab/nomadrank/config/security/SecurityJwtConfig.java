package kr.co.nomadlab.nomadrank.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@RequiredArgsConstructor
public class SecurityJwtConfig extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    private final SecurityTokenProvider tokenProvider;

    @Override
    public void configure(HttpSecurity http){
        SecurityFilter securityFilter = new SecurityFilter(tokenProvider);
        http.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);
    }

}
