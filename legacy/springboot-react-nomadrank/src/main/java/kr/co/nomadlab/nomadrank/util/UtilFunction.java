package kr.co.nomadlab.nomadrank.util;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.common.exception.CmdException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import reactor.netty.transport.ProxyProvider;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
public class UtilFunction {

    public static Mono<String> getRedirectUrl(WebClient webClient, String url) {
        return webClient.get().uri(url)
                .exchangeToMono(response -> {
                    String location = response.headers().asHttpHeaders().getFirst("Location");
                    if (location != null) {
                        return getRedirectUrl(webClient, location); // 리디렉션 주소로 다시 확인
                    } else {
                        return Mono.just(url); // 최종 URL 반환
                    }
                });
    }

    public static Map<String, String> parseQueryString(String url) {
        Map<String, String> queryPairs = new HashMap<>();
        try {
            URL urlObj = new URL(url);
            String query = urlObj.getQuery();
            String[] pairs = query != null ? query.split("&") : new String[0];
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                queryPairs.put(URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8), URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return queryPairs;
    }

    public static WebClient getWebClientWithProxy(String proxyHost, int proxyPort, String acceptType) {
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
                .proxy(proxy -> proxy
                        .type(ProxyProvider.Proxy.HTTP)
                        .host(proxyHost)
                        .port(proxyPort));
        WebClient.Builder weblClientBuilder = WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient));
        if ("json".equals(acceptType)) {
            weblClientBuilder.defaultHeader(HttpHeaders.ACCEPT, "application/json");
        } else {
            weblClientBuilder.defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        }
        weblClientBuilder.defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"");
        return weblClientBuilder.build();
    }

    public static WebClient getWebClientAutoRedirect(String acceptType) {
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
                .followRedirect(true);
        WebClient.Builder weblClientBuilder = WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient));
        if ("json".equals(acceptType)) {
            weblClientBuilder.defaultHeader(HttpHeaders.ACCEPT, "application/json");
        } else {
            weblClientBuilder.defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        }
        weblClientBuilder.defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"");
        return weblClientBuilder.build();
    }

    public static WebClient getWebClientAutoRedirectWithProxy(String proxyHost, int proxyPort, String acceptType) {
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
                        .host(proxyHost)
                        .port(proxyPort));
        WebClient.Builder weblClientBuilder = WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient));
        if ("json".equals(acceptType)) {
            weblClientBuilder.defaultHeader(HttpHeaders.ACCEPT, "application/json");
        } else {
            weblClientBuilder.defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        }
        weblClientBuilder.defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"");
        return weblClientBuilder.build();
    }

    public static String refineUrl(String url) {
        if (url == null) {
            throw new BadRequestException("url을 입력해주세요.");
        }
        return url.split("\\?")[0].replaceAll(" ", "");
    }


    public static String refineNplaceShopId(String shopId) {
        if (shopId == null) {
            throw new BadRequestException("MID를 입력해주세요.");
        }
        String numberString = shopId.replaceAll("[^0-9]", "");
        if (numberString.isBlank()) {
            return null;
        }
        return numberString;
    }

    public static String refineNstoreMid(String mid) {
        if (mid == null) {
            throw new BadRequestException("MID를 입력해주세요.");
        }
        return mid.replaceAll(" ", "");
    }

    public static String refineMallId(String mallId) {
        if (mallId == null) {
            throw new BadRequestException("스토어몰ID를 입력해주세요.");
        }
        return mallId.replaceAll(" ", "");
    }

    public static String refineProductId(String productId) {
        if (productId == null) {
            throw new BadRequestException("상품Id를 입력해주세요.");
        }
        return productId.replaceAll(" ", "");
    }

    public static String refineFilterValue(String filterValue) {
        if (filterValue == null) {
            throw new BadRequestException("필터값을 입력해주세요.");
        }
        return filterValue.replaceAll(" ", "").toLowerCase();
    }

    public static String refineKeyword(String keyword) {
        if (keyword == null) {
            throw new BadRequestException("키워드를 입력해주세요.");
        }
        if (keyword.replaceAll(" ", "").length() < 2) {
            throw new BadRequestException("키워드는 2글자 이상이어야 합니다.");
        }
        int keywordCountBySplitSpace = keyword.split(" ").length;
        if (Arrays.stream(keyword.split(" ")).filter(thisWord -> thisWord.length() < 2).count() == keywordCountBySplitSpace) {
            throw new BadRequestException("한 글자들로만 조합된 키워드는 검색할 수 없습니다.");
        }
        return keyword.trim().replaceAll("\\s+", " ");
    }

    public static boolean isWindows() {
        String OS = System.getProperty("os.name").toLowerCase();
        return OS.toLowerCase().contains("win");
    }

    public static boolean isMac() {
        String OS = System.getProperty("os.name").toLowerCase();
        return OS.toLowerCase().contains("mac");
    }

    public static boolean isUnix() {
        String OS = System.getProperty("os.name").toLowerCase();
        return OS.contains("nix") || OS.contains("nux") || OS.contains("aix");
    }

    public static String executeCmd(String script) {
        StringBuilder sb = new StringBuilder();
        try {
            if (isWindows()) {
                InputStream inputStream = Runtime.getRuntime().exec("cmd /c " + script).getInputStream();
//                InputStreamReader inputStreamReader = new InputStreamReader(inputStream, "MS949");
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
                bufferedReader.lines().forEach(thisLine -> {
                    if ("".equals(thisLine)) return;
                    log.info(thisLine);
                    if (!sb.isEmpty()) {
                        sb.append("\n");
                    }
                    sb.append(thisLine);
                });
                bufferedReader.close();
                inputStreamReader.close();
                inputStream.close();
            } else {
                InputStream inputStream = Runtime.getRuntime().exec(script).getInputStream();
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
                bufferedReader.lines().forEach(thisLine -> {
                    if ("".equals(thisLine)) return;
                    log.info(thisLine);
                    if (!sb.isEmpty()) {
                        sb.append("\n");
                    }
                    sb.append(thisLine);
                });
                bufferedReader.close();
                inputStreamReader.close();
                inputStream.close();
            }
        } catch (Exception e) {
            throw new CmdException("Cmd 실행 중 에러가 발생했습니다.");
        }
        return sb.toString();
    }

    public static String formatLocalDateTimeToDateString(LocalDateTime dateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return dateTime.format(formatter);
    }

    public static String getMissionContent(
            String frontType,
            String missionType,
            String mallName,
            String answer,
            String indexString,
            Map<String, Object> tagMap,
            String initialConsonants
    ) {
        if ("App" .equals(frontType)) {
            if ("명소" .equals(missionType)) {
                return """
                        미션 수행하고,
                        OK캐쉬백 포인트 즉시 적립 받으세요!
                        
                        1. 하단 [검색어 복사하기] 버튼을 클릭하여, 키워드를 복사해주세요.
                        2. 힌트보러가기 버튼 클릭 후 네이버 앱에 접속해주세요.
                        3. 복사된 키워드를 검색 창에 붙여 넣고 검색해주세요.
                        
                        4. [%s] 플레이스를 방문 하고 [주변] 탭을 클릭
                        5. [주변] 탭 바로 아래에 [명소] 탭을 클릭해주세요.
                        6. [명소] 탭 %s 장소 이름을 아래 정답란에 띄어쓰기와 특수문자를 제외하고 입력 후 제출해주세요.
                        (%d글자)
                        ★네이버앱으로 참여해 주세요★""".formatted(mallName, indexString, answer.length());
            } else {
                return "";
            }
        } else {
            if ("명소" .equals(missionType)) {
                if (tagMap == null) {
                    return """
                            미션 수행하고,
                            OK캐쉬백 포인트 즉시 적립 받으세요!
                            
                            1. 하단 [검색어 복사하기] 버튼을 클릭하여, 키워드를 복사해주세요.
                            2. 힌트보러가기 버튼 클릭 후 네이버에 로그인 해주세요.
                            3. 복사된 키워드를 검색 창에 붙여 넣고 검색해주세요.
                            
                            4. [%s] 플레이스를 방문 하고 [주변] 탭을 클릭
                            5. [주변] 탭 바로 아래에 [명소] 탭을 클릭해주세요.
                            6. [명소] 탭 %s 장소 이름을 아래 정답란에 띄어쓰기와 특수문자를 제외하고 입력 후 제출해주세요.
                            (%d글자)""".formatted(mallName, indexString, answer.length());
                } else {
                    return """
                            "미션 수행하고,
                            OK캐쉬백 포인트 즉시 적립 받으세요!
                            
                            1. 하단 [검색어 복사하기] 버튼을 클릭 하고, 키워드를 복사해주세요.
                            2. 힌트보러가기 버튼 클릭 후 네이버에 로그인 해주세요.
                            3. 복사된 키워드를 검색 창에 붙여넣고 검색해주세요.
                            
                            4. [%s] 플레이스를 방문 하고 [주변] 탭을 클릭해주세요.
                            5. [명소] 탭을 클릭후 바로 아래 [%s] 탭을 클릭해주세요.
                            6. 초성 힌트 [ %s ](%d글자)를 보고 정답을 찾아주세요.
                            7. 정답란에 띄어쓰기 없이 입력 후 제출해주세요.""".formatted(mallName, tagMap.get("tagName"), initialConsonants, initialConsonants.length());
                }
            } else {
                return "";
            }
        }
    }

    public static String getKoreaIndexString(int index) {
        return switch (index) {
            case 0 -> "첫번째";
            case 1 -> "두번째";
            case 2 -> "세번째";
            case 3 -> "네번째";
            case 4 -> "다섯번째";
            default -> null;
        };
    }

    public static String getSheetIdFromUrl(String url) {
        // 정규 표현식 패턴: /d/와 그 뒤에 오는 문자열을 추출, /edit는 있을 수도, 없을 수도 있음
        String regex = "/d/([a-zA-Z0-9-_]+)(?:/edit.*)?";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(url);

        // 매칭된 부분이 있으면 해당 그룹(Spreadsheet ID)을 반환
        if (matcher.find()) {
            return matcher.group(1);
        }
        // 매칭되지 않으면 null 반환
        return null;
    }

}
