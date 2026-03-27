package kr.co.nomadlab.dplog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * D-PLOG 백엔드 메인 애플리케이션
 * - Spring Boot 4.0 + Spring Framework 7 기반
 * - Virtual Threads 기본 활성화
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class DplogApplication {

	public static void main(String[] args) {
		SpringApplication.run(DplogApplication.class, args);
	}

}
