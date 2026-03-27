package kr.co.nomadlab.scrap;

import kr.co.nomadlab.scrap.model.db.constraint.AmpmType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import reactor.netty.transport.ProxyProvider;

import java.net.InetSocketAddress;
import java.time.Duration;

public class TempMain1 {

    public static void main(String[] args) {
        ExchangeStrategies exchangeStrategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(-1)) // to unlimited memory size
                .build();
        ConnectionProvider provider = ConnectionProvider.builder("newConnection")
                .maxConnections(10)  // 최대 연결 수
                .pendingAcquireMaxCount(-1)  // 대기 큐 무한
                .maxIdleTime(Duration.ZERO)  // 최대 유휴 시간 0
                .maxLifeTime(Duration.ZERO)  // 최대 수명 시간 0
                .build();
        HttpClient httpClient = HttpClient.create(provider)
                .followRedirect(true)
                .proxy(proxy -> proxy
                        .type(ProxyProvider.Proxy.HTTP)
                        .address(new InetSocketAddress("121.144.229.17", 7001))
                );
        WebClient webClient = WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"")
                .build();

        ResponseEntity<String> responseEntity = webClient.get()
                .uri("https://api.ip.pe.kr")
                .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
                .block();
        System.out.println(responseEntity.getBody());


//        String url = "https://map.naver.com/p/search/경주%20테를지/place/1008616984";
//
//        System.out.println(UtilFunction.refineNplaceShopId(url));

//        System.out.println(UtilFunction.extractInitialConsonants("가나다라 마바사아자 차카타파하"));

//        String url = "38712086";
//
//        System.out.println(url.split("/")[0]);


//        Connection connection = Jsoup.newSession();
//        connection.url("https://m.place.naver.com/restaurant/38712086/information");
//        connection.method(Connection.Method.GET);
//        connection.header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36");
//        connection.header("Accept", "text/html");
//        connection.header("Accept-Encoding", "gzip, deflate, br");
//        connection.header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7");
//        connection.header("Connection", "keep-alive");
//        try {
//            Document document = connection.get();
////            System.out.println(document);
//            String string = document.html().split("window.__APOLLO_STATE__ = ")[1].split(";\n")[0];
//            ObjectMapper objectMapper = new ObjectMapper();
//            JsonNode jsonNode = objectMapper.readTree(string);
//            String placeDetailFieldName = null;
//            for (Iterator<String> it = jsonNode.get("ROOT_QUERY").fieldNames(); it.hasNext(); ) {
//                String fieldName = it.next();
//                if (fieldName.contains("placeDetail")) {
//                    placeDetailFieldName = fieldName;
//                    break;
//                }
//            }
//            String descriptionFieldName = null;
//            for (Iterator<String> it = jsonNode.get("ROOT_QUERY").get(placeDetailFieldName).fieldNames(); it.hasNext(); ) {
//                String fieldName = it.next();
//                if (fieldName.contains("description")) {
//                    descriptionFieldName = fieldName;
//                    break;
//                }
//            }
//            System.out.println(jsonNode.get("ROOT_QUERY").get(placeDetailFieldName).get(descriptionFieldName).asText());
//
//            for (Iterator<String> it = jsonNode.fieldNames(); it.hasNext(); ) {
//                String fieldName = it.next();
//                if (fieldName.contains("Menu:" + 38712086)) {
//                    System.out.println(jsonNode.get(fieldName).get("name").asText());
//                    System.out.println(jsonNode.get(fieldName).get("price").asText());
//                }
//            }
//
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }

//        final List<String> keywordList = List.of("청송 사과", "롱패딩", "원피스");
//        keywordList.parallelStream().forEach(keyword -> {
//            WebClient webClient = UtilFunction.getWebClientAutoRedirectWithProxy("121.144.229.17", 7001);
//            final UriComponents uriComponents = UriComponentsBuilder
//                    .fromHttpUrl("https://search.shopping.naver.com/search/all")
//                    .queryParam("query", keyword)
//                    .queryParam("pagingIndex", 1)
//                    .queryParam("pagingSize", 100)
//                    .queryParam("productSet", "total")
//                    .queryParam("sort", "rel")
//                    .queryParam("frm", "NVSHATC")
//                    .queryParam("viewType", "list")
//                    .build();
//            ResponseEntity<String> responseEntity = webClient
//                    .get()
//                    .uri(uriComponents.toUriString())
//                    .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
//                    .block();
//            System.out.println(responseEntity.getStatusCode());
//            System.out.println(responseEntity.getBody());
//        });


//        RestTemplate restTemplate = new RestTemplate();
//        String keyword = "청송 사과";
//        String size = "100";
//        final List<Integer> pageList = List.of(1, 2, 3);
//        pageList.stream().forEach(page -> {
//            WebClient webClient = UtilFunction.getWebClientAutoRedirectWithProxy("121.144.229.17", 7001);
//            final UriComponents uriComponents = UriComponentsBuilder
//                    .fromHttpUrl("https://search.shopping.naver.com/search/all")
//                    .queryParam("query", keyword)
//                    .queryParam("pagingIndex", page)
//                    .queryParam("pagingSize", 100)
//                    .queryParam("productSet", "total")
//                    .queryParam("sort", "rel")
//                    .queryParam("frm", "NVSHATC")
//                    .queryParam("viewType", "list")
//                    .build();
//            ResponseEntity<String> responseEntity = webClient
//                    .get()
//                    .uri(uriComponents.toUriString())
//                    .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
//                    .block();
//            System.out.println(responseEntity.getStatusCode());
//            System.out.println(responseEntity.getBody());
//        });

//        RestTemplate restTemplate = new RestTemplate();
//        String keyword = "청송 사과";
//        String size = "100";
//        final List<Integer> pageList = List.of(1, 2, 3);
//        pageList.parallelStream().forEach(page -> {
//            WebClient webClient = UtilFunction.getWebClientAutoRedirectWithProxy("121.144.229.17", 7001);
//            ResponseEntity<String> responseEntity = webClient
//                    .get()
//                    .uri("https://search.shopping.naver.com/api/search/all?pagingIndex="+page+"&pagingSize=100&productSet=total&query=청송 사과&sort=rel&viewType=list")
//                    .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
//                    .block();
//            System.out.println(responseEntity.getStatusCode());
//            System.out.println(responseEntity.getBody());
//        });
    }
}
