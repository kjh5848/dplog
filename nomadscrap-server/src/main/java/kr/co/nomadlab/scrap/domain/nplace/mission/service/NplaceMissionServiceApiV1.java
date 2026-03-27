package kr.co.nomadlab.scrap.domain.nplace.mission.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import kr.co.nomadlab.scrap.common.dto.ResDTO;
import kr.co.nomadlab.scrap.common.exception.AuthenticationException;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.domain.nplace.mission.dto.response.ResNplaceMissionGetAroundDTOApiV1;
import kr.co.nomadlab.scrap.domain.nplace.mission.dto.response.ResNplaceMissionGetHomeDTOApiV1;
import kr.co.nomadlab.scrap.domain.nplace.mission.dto.response.ResNplaceMissionGetMallDetailDTOApiV1;
import kr.co.nomadlab.scrap.model.db.user.entity.UserEntity;
import kr.co.nomadlab.scrap.model.db.user.repository.UserRepository;
import kr.co.nomadlab.scrap.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NplaceMissionServiceApiV1 {

    @Value("${scrap-mall-vpn}")
    private String scrapMallVpn;

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    public HttpEntity<?> getHome(String apiKey, String url, String filter) {
        getUserEntityByApiKey(apiKey);
        String shopId = UtilFunction.extractNplaceShopIdFromUrl(url);
        if (shopId == null) {
            throw new BadRequestException("잘못된 url 입니다.");
        }
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("https://m.place.naver.com/place/%s/home".formatted(shopId))
                .build();
        Mono<ResponseEntity<String>> responseEntityMono = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888)
                .get()
                .uri(uriComponents.toUriString())
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode() != HttpStatus.OK) {
                        throw new BadRequestException("html을 가져오지 못했습니다.");
                    } else {
                        return clientResponse.toEntity(String.class);
                    }
                });
        final Document document = Jsoup.parse(responseEntityMono.block().getBody());
        String json = document.data()
                .split("window.__APOLLO_STATE__ =")[1]
                .split(";\n")[0];
        JsonNode jsonNode = null;
        try {
            jsonNode = objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        if ("phone".equals(filter)) {
            JsonNode jsonNodeOfShopInfo = jsonNode.get("PlaceDetailBase:%s".formatted(shopId));
            ObjectNode objectNodeOfMissionHome = new ObjectNode(objectMapper.getNodeFactory());
            objectNodeOfMissionHome.put("answer", jsonNodeOfShopInfo.get("phone").asText());
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNplaceMissionGetHomeDTOApiV1.of(objectNodeOfMissionHome))
                            .build()
                    , HttpStatus.OK);
        } else {
            throw new BadRequestException("잘못된 filter 입니다.");
        }

    }

    public HttpEntity<?> getAround(String apiKey, String url, Integer filter, Integer tag, Integer answerIndex) {
        int limitCount = 5;
        getUserEntityByApiKey(apiKey);
        if (answerIndex < 0 || answerIndex > limitCount) {
            throw new BadRequestException("정답 위치는 1 ~ %d 선택가능합니다. 랜덤 선택 시 0을 입력해주세요.".formatted(limitCount));
        }
        String shopId = UtilFunction.extractNplaceShopIdFromUrl(url);
        if (shopId == null) {
            throw new BadRequestException("잘못된 url 입니다.");
        }
        String targetUrl =
                tag != null
                        ? "https://m.place.naver.com/place/%s/around?filter=%d&tag=%d".formatted(shopId, filter, tag)
                        : "https://m.place.naver.com/place/%s/around?filter=%d".formatted(shopId, filter);
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl(targetUrl)
                .build();
        Mono<ResponseEntity<String>> responseEntityMono = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888)
                .get()
                .uri(uriComponents.toUriString())
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode() != HttpStatus.OK) {
                        throw new BadRequestException("html을 가져오지 못했습니다.");
                    } else {
                        return clientResponse.toEntity(String.class);
                    }
                });
        final Document document = Jsoup.parse(responseEntityMono.block().getBody());
        String json = document.data()
                .split("window.__APOLLO_STATE__ =")[1]
                .split(";\n")[0];
        JsonNode jsonNode = null;
        try {
            jsonNode = objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        String tripsFieldName = null;
        for (Iterator<String> it = jsonNode.get("ROOT_QUERY").fieldNames(); it.hasNext(); ) {
            String fieldName = it.next();
            if (fieldName.contains("trips(")) {
                tripsFieldName = fieldName;
                break;
            }
        }
        JsonNode jsonNodeOfTrips = jsonNode.get("ROOT_QUERY").get(tripsFieldName).get("items");
        if (answerIndex != 0) {
            JsonNode jsonNodeOfTrip = jsonNodeOfTrips.get(answerIndex - 1);
            String ref = jsonNodeOfTrip.get("__ref").asText();
            ObjectNode objectNodeOfMissionAround = new ObjectNode(objectMapper.getNodeFactory());
            objectNodeOfMissionAround.put("index", answerIndex - 1);
            objectNodeOfMissionAround.put(
                    "initialConsonants",
                    UtilFunction.extractInitialConsonants(
                            jsonNode.get(ref).get("name").asText()
                                    .replaceAll(" ", "")
                                    .replaceAll("[^a-zA-Z0-9가-힣]", "")
                    )
            );
            objectNodeOfMissionAround.put(
                    "answer",
                    jsonNode.get(ref).get("name").asText()
                            .replaceAll(" ", "")
                            .replaceAll("[^a-zA-Z0-9가-힣]", "")
            );
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNplaceMissionGetAroundDTOApiV1.of(objectNodeOfMissionAround))
                            .build()
                    , HttpStatus.OK);
        } else {
            List<String> refList = new ArrayList<>();
            for (JsonNode jsonNodeOfTrip : jsonNodeOfTrips) {
                String ref = jsonNodeOfTrip.get("__ref").asText();
                if (
                        !jsonNode.get(ref).get("name").asText()
                                .replaceAll(" ", "")
                                .matches(".*[^\\p{IsHangul}].*")
                ) {
                    refList.add(ref);
                }
            }
            int randomLimitCount = limitCount;
            if (refList.size() < randomLimitCount) {
                randomLimitCount = refList.size();
            }
            int randomIndex = new Random().nextInt(randomLimitCount);
            ObjectNode objectNodeOfMissionAround = new ObjectNode(objectMapper.getNodeFactory());
            objectNodeOfMissionAround.put("index", randomIndex);
            objectNodeOfMissionAround.put(
                    "initialConsonants",
                    UtilFunction.extractInitialConsonants(
                            jsonNode.get(refList.get(randomIndex)).get("name").asText()
                                    .replaceAll(" ", "")
                    )
            );
            objectNodeOfMissionAround.put(
                    "answer",
                    jsonNode.get(refList.get(randomIndex)).get("name").asText()
                            .replaceAll(" ", "")
            );
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNplaceMissionGetAroundDTOApiV1.of(objectNodeOfMissionAround))
                            .build()
                    , HttpStatus.OK);
        }
    }

    public HttpEntity<?> getMallDetail(String apiKey, String refineMallId) {
        getUserEntityByApiKey(apiKey);
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("https://m.place.naver.com/place/%s".formatted(refineMallId))
                .build();
        Mono<ResponseEntity<String>> responseEntityMono = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888)
                .get()
                .uri(uriComponents.toUriString())
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode() != HttpStatus.OK) {
                        throw new BadRequestException("html을 가져오지 못했습니다.");
                    } else {
                        return clientResponse.toEntity(String.class);
                    }
                });
        final Document document = Jsoup.parse(responseEntityMono.block().getBody());
        ObjectNode objectNode = new ObjectNode(objectMapper.getNodeFactory());
        if (document.selectFirst("meta[id='og:title']") == null) {
            throw new BadRequestException("존재하지 않는 상품입니다.");
        }
        objectNode.put("mallName", document.selectFirst("meta[id='og:title']").attr("content").split(" : ")[0]);
        objectNode.put("mallUrl", document.selectFirst("meta[id='og:url']").attr("content"));
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceMissionGetMallDetailDTOApiV1.of(objectNode))
                        .build()
                , HttpStatus.OK);
    }

    private UserEntity getUserEntityByApiKey(String apiKey) {
        Optional<UserEntity> userEntityOptional = userRepository.findByApiKeyAndDeleteDateIsNull(apiKey);
        if (userEntityOptional.isEmpty()) {
            throw new AuthenticationException("존재하지 않는 apiKey입니다.");
        }
        return userEntityOptional.get();
    }

}
