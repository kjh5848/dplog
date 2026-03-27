package kr.co.nomadlab.scrap.util;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.xml.bind.DatatypeConverter;
import kr.co.nomadlab.scrap.common.constants.Constants;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.common.exception.CmdException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import reactor.netty.transport.ProxyProvider;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;

@Slf4j
public class UtilFunction {

    public static String extractInitialConsonants(String input) {
        String initialConsonants = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
        StringBuilder result = new StringBuilder();

        for (char ch : input.toCharArray()) {
            if (ch >= '\uAC00' && ch <= '\uD7A3') { // Check if ch is a Hangul syllable
                int syllableIndex = ch - '\uAC00';
                int initialIndex = syllableIndex / (21 * 28);
                result.append(initialConsonants.charAt(initialIndex));
            } else if (Character.isLetterOrDigit(ch)) {
                // If it's a Latin letter or digit, append as is
                result.append(ch);
            } else {
                // Append other characters as is (e.g., spaces, punctuation)
                result.append(ch);
            }
        }
        return result.toString();
    }

//    public static String extractInitialConsonantsWithOnlyKorean(String input) {
//        // Mapping from Hangul Jamo to Hangul Compatibility Jamo
//        char[] initialConsonantMap = new char[19];
//        initialConsonantMap[0x00] = '\u3131'; // ᄀ -> ㄱ
//        initialConsonantMap[0x01] = '\u3132'; // ᄁ -> ㄲ
//        initialConsonantMap[0x02] = '\u3134'; // ᄂ -> ㄴ
//        initialConsonantMap[0x03] = '\u3137'; // ᄃ -> ㄷ
//        initialConsonantMap[0x04] = '\u3138'; // ᄄ -> ㄸ
//        initialConsonantMap[0x05] = '\u3139'; // ᄅ -> ㄹ
//        initialConsonantMap[0x06] = '\u3141'; // ᄆ -> ㅁ
//        initialConsonantMap[0x07] = '\u3142'; // ᄇ -> ㅂ
//        initialConsonantMap[0x08] = '\u3143'; // ᄈ -> ㅃ
//        initialConsonantMap[0x09] = '\u3145'; // ᄉ -> ㅅ
//        initialConsonantMap[0x0A] = '\u3146'; // ᄊ -> ㅆ
//        initialConsonantMap[0x0B] = '\u3147'; // ᄋ -> ㅇ
//        initialConsonantMap[0x0C] = '\u3148'; // ᄌ -> ㅈ
//        initialConsonantMap[0x0D] = '\u3149'; // ᄍ -> ㅉ
//        initialConsonantMap[0x0E] = '\u314A'; // ᄎ -> ㅊ
//        initialConsonantMap[0x0F] = '\u314B'; // ᄏ -> ㅋ
//        initialConsonantMap[0x10] = '\u314C'; // ᄐ -> ㅌ
//        initialConsonantMap[0x11] = '\u314D'; // ᄑ -> ㅍ
//        initialConsonantMap[0x12] = '\u314E'; // ᄒ -> ㅎ
//
//        StringBuilder result = new StringBuilder();
//        for (char ch : input.toCharArray()) {
//            if (ch >= '\uAC00' && ch <= '\uD7A3') { // Check if ch is a Hangul syllable
//                String decomposed = Normalizer.normalize(Character.toString(ch), Normalizer.Form.NFD);
//                char initialConsonant = decomposed.charAt(0);
//                int index = initialConsonant - '\u1100';
//                if (index >= 0 && index < initialConsonantMap.length) {
//                    result.append(initialConsonantMap[index]);
//                } else {
//                    // If index is out of bounds, append the character as is
//                    result.append(ch);
//                }
//            } else {
//                // Handle non-Hangul characters if needed
//                // For now, we can choose to ignore them
//            }
//        }
//        return result.toString();
//    }

    public static String decodeUnicode(String unicodeString) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < unicodeString.length()) {
            char currentChar = unicodeString.charAt(i);
            if (currentChar == '\\' && i + 1 < unicodeString.length() && unicodeString.charAt(i + 1) == 'u') {
                // 유니코드 이스케이프 시퀀스인 경우
                String unicodeChar = unicodeString.substring(i + 2, i + 6);
                char decodedChar = (char) Integer.parseInt(unicodeChar, 16);
                sb.append(decodedChar);
                i += 6; // 다음 문자 위치로 이동
            } else {
                // 일반 문자인 경우
                sb.append(currentChar);
                i++;
            }
        }
        return sb.toString();
    }

    public static double[] getLatLongByProvince(String province) {
        double[] latLong = new double[2];
        switch (province) {
            case "서울시":
                latLong[0] = 37.5665;
                latLong[1] = 126.9780;
                break;
            case "부산시":
                latLong[0] = 35.1796;
                latLong[1] = 129.0756;
                break;
            case "대구시":
                latLong[0] = 35.8714;
                latLong[1] = 128.6014;
                break;
            case "인천시":
                latLong[0] = 37.4563;
                latLong[1] = 126.7052;
                break;
            case "광주시":
                latLong[0] = 35.1595;
                latLong[1] = 126.8526;
                break;
            case "대전시":
                latLong[0] = 36.3504;
                latLong[1] = 127.3845;
                break;
            case "울산시":
                latLong[0] = 35.5384;
                latLong[1] = 129.3114;
                break;
            case "세종시":
                latLong[0] = 36.4808;
                latLong[1] = 127.2892;
                break;
            case "경기도":
                latLong[0] = 37.4138;
                latLong[1] = 127.5183;
                break;
            case "강원도":
                latLong[0] = 37.8228;
                latLong[1] = 128.1555;
                break;
            case "충청북도":
                latLong[0] = 36.8000;
                latLong[1] = 127.7000;
                break;
            case "충청남도":
                latLong[0] = 36.5184;
                latLong[1] = 126.8000;
                break;
            case "전라북도":
                latLong[0] = 35.7175;
                latLong[1] = 127.1530;
                break;
            case "전라남도":
                latLong[0] = 34.8679;
                latLong[1] = 126.9910;
                break;
            case "경상북도":
                latLong[0] = 36.4919;
                latLong[1] = 128.8889;
                break;
            case "경상남도":
                latLong[0] = 35.4606;
                latLong[1] = 128.2132;
                break;
            case "제주도":
                latLong[0] = 33.4890;
                latLong[1] = 126.4983;
                break;
            default:
                latLong[0] = 37.5665;
                latLong[1] = 126.9780;
                break;
        }
        return latLong;
    }

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

    public static WebClient getWebClientWithProxy(String proxyHost, int proxyPort) {
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
        return WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"")
                .build();
    }

    public static WebClient getWebClientWithProxy(String proxyHost, int proxyPort, String proxyUsername, String proxyPassword) {
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
                        .address(new InetSocketAddress(proxyHost, proxyPort))
                        .username(proxyUsername)
                        .password(s -> proxyPassword)
                );
        return WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"")
                .build();
    }

//    public static WebClient getWebClientAutoRedirect() {
//        ExchangeStrategies exchangeStrategies = ExchangeStrategies.builder()
//                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(-1)) // to unlimited memory size
//                .build();
//        ConnectionProvider provider = ConnectionProvider.builder("newConnection")
//                .maxConnections(10)  // 최대 연결 수
//                .pendingAcquireMaxCount(-1)  // 대기 큐 무한
//                .maxIdleTime(Duration.ZERO)  // 최대 유휴 시간 0
//                .maxLifeTime(Duration.ZERO)  // 최대 수명 시간 0
//                .build();
//        HttpClient httpClient = HttpClient.create(provider)
//                .followRedirect(true);
//        return WebClient.builder()
//                .exchangeStrategies(exchangeStrategies)
//                .clientConnector(new ReactorClientHttpConnector(httpClient))
//                .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
//                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
//                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
//                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"")
//                .build();
//    }

    public static WebClient getWebClientAutoRedirectWithProxy(String proxyHost, int proxyPort) {
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
        return WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"")
                .build();
    }

    public static WebClient getWebClientAutoRedirectWithProxy(String proxyHost, int proxyPort, String proxyUsername, String proxyPassword) {
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
                        .address(new InetSocketAddress(proxyHost, proxyPort))
                        .username(proxyUsername)
                        .password(s -> proxyPassword)
                );
        return WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"")
                .build();
    }

    public static WebClient getWebClientAutoRedirectWithProxy(String proxyHost, int proxyPort, AtomicReference<String> lastRequestUrlAtomic) {
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
                .doOnRedirect((request, response) -> {
                    if (request.responseHeaders().get("location") != null) {
                        lastRequestUrlAtomic.set(request.responseHeaders().get("location"));
                    } else if (request.responseHeaders().get("Location") != null) {
                        lastRequestUrlAtomic.set(request.responseHeaders().get("Location"));
                    }
                })
                .proxy(proxy -> proxy
                        .type(ProxyProvider.Proxy.HTTP)
                        .host(proxyHost)
                        .port(proxyPort));
        return WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"")
                .build();
    }

    public static WebClient getWebClientAutoRedirectWithProxy(AtomicReference<String> lastRequestUrlAtomic, String proxyHost, int proxyPort, String proxyUsername, String proxyPassword) {
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
                .doOnRedirect((request, response) -> {
                    if (request.responseHeaders().get("location") != null) {
                        lastRequestUrlAtomic.set(request.responseHeaders().get("location"));
                    } else if (request.responseHeaders().get("Location") != null) {
                        lastRequestUrlAtomic.set(request.responseHeaders().get("Location"));
                    }
                })
                .proxy(proxy -> proxy
                        .type(ProxyProvider.Proxy.HTTP)
                        .address(new InetSocketAddress(proxyHost, proxyPort))
                        .username(proxyUsername)
                        .password(s -> proxyPassword)
                );
        return WebClient.builder()
                .exchangeStrategies(exchangeStrategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"")
                .build();
    }


//    public static WebClient getWebClientAutoRedirectWithProxy(WebClient.Builder webClientBuilder, String proxyHost, int proxyPort) {
//        ExchangeStrategies exchangeStrategies = ExchangeStrategies.builder()
//                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(-1)) // to unlimited memory size
//                .build();
//        HttpClient httpClient = HttpClient.create()
//                .followRedirect(true)
//                .proxy(proxy -> proxy
//                        .type(ProxyProvider.Proxy.HTTP)
//                        .host(proxyHost)
//                        .port(proxyPort));
//        return webClientBuilder
//                .exchangeStrategies(exchangeStrategies)
//                .clientConnector(new ReactorClientHttpConnector(httpClient))
//                .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
//                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
//                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
//                .defaultHeader("Sec-Ch-Ua", "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"")
//                .build();
//    }

    public static LocalDateTime getNplaceChartDate(LocalDateTime localDateTime) {
        LocalDateTime chartDate;
        if (localDateTime.getHour() >= 15) {
            // 현재 시간이 오후 3시 이후인 경우, 같은 날의 오후 3시
            chartDate = localDateTime.withHour(15).withMinute(0).withSecond(1);
        } else {
            // 현재 시간이 오후 3시 이전인 경우, 전날의 오후 3시
            chartDate = localDateTime.minusDays(1).withHour(15).withMinute(0).withSecond(1);
        }
        return chartDate;
    }

    public static LocalDateTime getNstoreChartDate(LocalDateTime localDateTime) {
        LocalDateTime chartDate;
        if (localDateTime.getHour() >= 15) {
            // 현재 시간이 오후 3시 이후인 경우, 같은 날의 오후 3시
            chartDate = localDateTime.withHour(15).withMinute(0).withSecond(2);
        } else {
            // 현재 시간이 오후 3시 이전인 경우, 전날의 오후 3시
            chartDate = localDateTime.minusDays(1).withHour(15).withMinute(0).withSecond(2);
        }
        return chartDate;
    }

    public static String refineUrl(String url) {
        if (url == null) {
            return null;
        }
        return url.replaceAll(" ", "");
    }

    public static String extractNplaceShopIdFromUrl(String url) {
        if (url == null) {
            return null;
        }
        final String cutUrl = url.replaceAll(" ", "").split("\\?")[0];
        String shopId;
        if (Pattern.compile(Constants.Regex.NPLACE_ENTRY_SHOP_URL).matcher(cutUrl).matches()) {
            shopId = cutUrl.split("https://map.naver.com/p/entry/place/")[1];
        } else if (Pattern.compile(Constants.Regex.NPLACE_SEARCH_SHOP_URL).matcher(cutUrl).matches()) {
            shopId = cutUrl.split("https://map.naver.com/p/search/[^/]+/place/")[1];
        } else if (Pattern.compile(Constants.Regex.NPLACE_MOBILE_SHOP_URL).matcher(cutUrl).matches()) {
            shopId = cutUrl.split("https://m.place.naver.com/[^/]+/")[1].split("/")[0];
        } else {
            shopId = UtilFunction.refineNplaceShopId(cutUrl);
        }
        return shopId;
    }


    public static String refineNplaceShopId(String shopId) {
        if (shopId == null) {
            return null;
        }
        String numberString = shopId.replaceAll("[^0-9]", "");
        if (numberString.isBlank()) {
            return null;
        }
        return numberString;
    }

    public static String refineNstoreMid(String mid) {
        if (mid == null) {
            return null;
        }
        return mid.replaceAll(" ", "");
    }

    public static String refineMallId(String mallId) {
        if (mallId == null) {
            return null;
        }
        return mallId.replaceAll(" ", "");
    }

    public static String refineProductId(String productId) {
        if (productId == null) {
            return null;
        }
        return productId.replaceAll(" ", "");
    }

    public static String refineFilterValue(String filterValue) {
        if (filterValue == null) {
            return null;
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
        if (Arrays.stream(keyword.split(" ")).filter(word -> word.length() < 2).count() == keywordCountBySplitSpace) {
            throw new BadRequestException("한 글자들로만 조합된 키워드는 검색할 수 없습니다.");
        }
        return keyword.trim().replaceAll("\\s+", " ");
    }

    public static String refineBusinessSector(String businessSector) {
        if (businessSector == null || businessSector.isBlank()) {
            throw new BadRequestException("businessSector를 입력해주세요.");
        }
        return businessSector.replaceAll(" ", "");
    }

    public static String refineProvince(String province) {
        if (province == null) {
            throw new BadRequestException("지역명을 입력해주세요.");
        }
        if (!UtilVariable.provinceList.contains(province)) {
            throw new BadRequestException("존재하지 않는 지역입니다.");
        }
        return province;
    }

//    public static void checkProvinceValid(String province) {
//        if (province == null) {
//            throw new BadRequestException("지역명을 입력해주세요.");
//        }
//        if (!UtilVariable.provinceList.contains(province)) {
//            throw new BadRequestException("존재하지 않는 지역입니다.");
//        }
//    }

//    public static void checkKeywordValid(String keyword) {
//        if (keyword == null) {
//            throw new BadRequestException("키워드를 입력해주세요.");
//        }
//        if (keyword.replaceAll(" ", "").length() < 2) {
//            throw new BadRequestException("키워드는 2글자 이상이어야 합니다.");
//        }
//        int keywordCountBySplitSpace = refineKeyword(keyword).split(" ").length;
//        if (Arrays.stream(refineKeyword(keyword).split(" ")).filter(word -> word.length() < 2).count() == keywordCountBySplitSpace) {
//            throw new BadRequestException("한 글자들로만 조합된 키워드는 검색할 수 없습니다.");
//        }
//    }

    private static String encrypt(String input, String key, String iv) throws Exception {
        IvParameterSpec ivSpec = new IvParameterSpec(iv.getBytes(StandardCharsets.UTF_8));
        SecretKeySpec sKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "AES");

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, sKeySpec, ivSpec);

        byte[] encrypted = cipher.doFinal(input.getBytes());
        return DatatypeConverter.printHexBinary(encrypted).toLowerCase();
    }

    public static String getSbth() {
        String key = "12501986019234170293715203984170";
        String iv = "6269036102394823";

        SimpleDateFormat dateFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z");
        dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        String dateString = dateFormat.format(new Date());

        String toEncrypt = "sb" + dateString + "th";

        try {
            return encrypt(toEncrypt, key, iv);
        } catch (Exception e) {
            e.printStackTrace();
            throw new BadRequestException("Sbth를 생성하지 못했습니다.");
        }
    }

    public static String getNplaceToken(String keyword) {
        ObjectNode objectNode = new ObjectNode(JsonNodeFactory.instance);
        objectNode.put("arg", keyword);
        objectNode.put("type", "place");
        objectNode.put("source", "place");
        return Base64.getEncoder().encodeToString(objectNode.toString().getBytes(StandardCharsets.UTF_8)).replaceAll("=", "");
    }

    public static String getUserAgent() {
        List<String> userAgentList = List.of("Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
                "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36",
                "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/99.0.1150.36",
                "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
                "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0",
                "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
                "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/69.0.3497.105 Mobile/15E148 Safari/605.1",
                "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/13.2b11866 Mobile/16A366 Safari/605.1.15",
                "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
                "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
                "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A5370a Safari/604.1",
                "Mozilla/5.0 (iPhone9,3; U; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A403 Safari/602.1",
                "Mozilla/5.0 (iPhone9,4; U; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A403 Safari/602.1",
                "Mozilla/5.0 (Apple-iPhone7C2/1202.466; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1A543 Safari/419.3",
                "Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/60.0.3112.107 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 7.0; SM-G930VC Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.3029.83 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 6.0.1; SM-G935S Build/MMB29K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.91 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 5.1.1; SM-G928X Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.83 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 6P Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.83 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 7.1.1; G8231 Build/41.2.A.0.219; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/59.0.3071.125 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 6.0.1; E6653 Build/32.2.A.0.253) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 6.0; HTC One X10 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.98 Mobile Safari/537.36",
                "Mozilla/5.0 (Linux; Android 6.0; HTC One M9 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.3",
                "Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; RM-1152) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Mobile Safari/537.36 Edge/15.15254",
                "Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; RM-1127_16056) AppleWebKit/537.36(KHTML, like Gecko) Chrome/42.0.2311.135 Mobile Safari/537.36 Edge/12.10536",
                "Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/13.1058",
                "Mozilla/5.0 (Linux; Android 7.0; Pixel C Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.98 Safari/537.36",
                "Mozilla/5.0 (Linux; Android 6.0.1; SGP771 Build/32.2.A.0.253; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.98 Safari/537.36",
                "Mozilla/5.0 (Linux; Android 6.0.1; SHIELD Tablet K1 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.91 Safari/537.36",
                "Mozilla/5.0 (Linux; Android 7.0; SM-T827R4 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Safari/537.36",
                "Mozilla/5.0 (Linux; Android 5.0.2; SAMSUNG SM-T550 Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/3.3 Chrome/38.0.2125.102 Safari/537.36",
                "Mozilla/5.0 (Linux; Android 4.4.3; KFTHWI Build/KTU84M) AppleWebKit/537.36 (KHTML, like Gecko) Silk/47.1.79 like Chrome/47.0.2526.80 Safari/537.36"
        );
        return userAgentList.get(new Random().nextInt(userAgentList.size()));
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
                bufferedReader.lines().forEach(line -> {
                    if ("".equals(line)) return;
                    log.info(line);
                    if (!sb.isEmpty()) {
                        sb.append("\n");
                    }
                    sb.append(line);
                });
                bufferedReader.close();
                inputStreamReader.close();
                inputStream.close();
            } else {
                InputStream inputStream = Runtime.getRuntime().exec(script).getInputStream();
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
                bufferedReader.lines().forEach(line -> {
                    if ("".equals(line)) return;
                    log.info(line);
                    if (!sb.isEmpty()) {
                        sb.append("\n");
                    }
                    sb.append(line);
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
}
