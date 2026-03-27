package kr.co.nomadlab.nomadrank;

import kr.co.nomadlab.nomadrank.config.PaymentSchedulerProperties;
import kr.co.nomadlab.nomadrank.config.PortOneV2Config;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({PortOneV2Config.class, PaymentSchedulerProperties.class})
public class NomadrankApplication {

    public static void main(String[] args) {
        SpringApplication.run(NomadrankApplication.class, args);
    }

}
