package kr.co.nomadlab.scrap.config.rest_template;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

//    @Bean
//    public RestTemplate restTemplate() {
//        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("3.36.52.61", 8888));
//        SimpleClientHttpRequestFactory simpleClientHttpRequestFactory = new SimpleClientHttpRequestFactory();
//        simpleClientHttpRequestFactory.setProxy(proxy);
//        return  new RestTemplate(simpleClientHttpRequestFactory);
//    }

}
