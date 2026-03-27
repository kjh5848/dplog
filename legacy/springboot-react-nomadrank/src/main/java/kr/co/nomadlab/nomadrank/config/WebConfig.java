package kr.co.nomadlab.nomadrank.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * WebClient Bean 설정
     * 외부 API 호출을 위한 WebClient 인스턴스 생성
     */
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024)) // 1MB
                .build();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(new HandlerInterceptor() {

            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                System.out.println("request.getRequestURI() : " + request.getRequestURI());
                final String requestUri = request.getRequestURI();
                // 백엔드 콜백 엔드포인트는 인터셉터 우회
                if ("/kakao/callback".equals(requestUri)) {
                    return true;
                }
                if (!requestUri.matches("\\/v[0-9]*\\/.+") && !requestUri.contains(".")) {
                    request.getRequestDispatcher("/index.html").forward(request, response);
                    return false;
                }
                return true;
            }

        });

    }

}
