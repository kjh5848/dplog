package kr.co.nomadlab.dplog.common.config;

import jakarta.servlet.Servlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * H2 콘솔 수동 등록 (개발 환경 전용)
 * - Spring Boot 4.0에서 H2 콘솔 auto-configuration이 동작하지 않아 수동 등록
 * - H2 라이브러리가 runtimeOnly이므로 리플렉션으로 서블릿 생성
 */
@Configuration
@Profile("dev")
public class H2ConsoleConfig {

    @Bean
    @SuppressWarnings("unchecked")
    public ServletRegistrationBean<Servlet> h2ConsoleServlet() {
        try {
            // H2 2.x JakartaWebServlet 로드 시도
            Class<? extends Servlet> servletClass =
                    (Class<? extends Servlet>) Class.forName("org.h2.server.web.JakartaWebServlet");
            Servlet servlet = servletClass.getDeclaredConstructor().newInstance();

            var registration = new ServletRegistrationBean<>(servlet, "/h2-console/*");
            registration.setName("H2Console");
            registration.setLoadOnStartup(1);
            return registration;
        } catch (Exception e) {
            throw new RuntimeException("H2 콘솔 서블릿을 등록할 수 없습니다. H2 라이브러리를 확인하세요.", e);
        }
    }
}
