package kr.co.nomadlab.dplog;

import kr.co.nomadlab.dplog.config.DplogProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(DplogProperties.class)
public class DplogBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(DplogBackendApplication.class, args);
    }
}
