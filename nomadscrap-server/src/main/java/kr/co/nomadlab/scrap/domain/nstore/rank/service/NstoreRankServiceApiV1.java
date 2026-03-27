package kr.co.nomadlab.scrap.domain.nstore.rank.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import kr.co.nomadlab.scrap.common.constants.Constants;
import kr.co.nomadlab.scrap.common.dto.ResDTO;
import kr.co.nomadlab.scrap.common.exception.AuthenticationException;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.domain.nstore.rank.constraint.NstoreRankRealtimeFilterType;
import kr.co.nomadlab.scrap.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackChartDTOApiV1;
import kr.co.nomadlab.scrap.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackInfoDTOApiV1;
import kr.co.nomadlab.scrap.domain.nstore.rank.dto.response.*;
import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankSearchProductEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankSearchProductInfoEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.repository.NstoreRankSearchProductInfoRepository;
import kr.co.nomadlab.scrap.model.db.nstore.rank.repository.NstoreRankSearchProductRepository;
import kr.co.nomadlab.scrap.model.db.nstore.rank.repository.NstoreRankTrackInfoRepository;
import kr.co.nomadlab.scrap.model.db.nstore.rank.repository.NstoreRankTrackRepository;
import kr.co.nomadlab.scrap.model.db.user.entity.UserEntity;
import kr.co.nomadlab.scrap.model.db.user.entity.UserNstoreRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.user.repository.UserNstoreRankTrackInfoRepository;
import kr.co.nomadlab.scrap.model.db.user.repository.UserRepository;
import kr.co.nomadlab.scrap.model_external.nomadproxy.entity.NomadproxyWirelessEntity;
import kr.co.nomadlab.scrap.model_external.nomadproxy.repository.NomadproxyWirelessRepository;
import kr.co.nomadlab.scrap.util.UtilFunction;
import kr.co.nomadlab.scrap.util.UtilVariable;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NstoreRankServiceApiV1 {

    @Nullable
    @Value("${proxy-server.ip}")
    private final String proxyServerIp;

    @Nullable
    @Value("${scrap-mall-vpn}")
    private String scrapMallVpn;

    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final NomadproxyWirelessRepository nomadproxyWirelessRepository;
    private final NstoreRankSearchProductInfoRepository nstoreRankSearchProductInfoRepository;
    private final NstoreRankSearchProductRepository nstoreRankSearchProductRepository;
    private final NstoreRankTrackInfoRepository nstoreRankTrackInfoRepository;
    private final NstoreRankTrackRepository nstoreRankTrackRepository;
    private final UserNstoreRankTrackInfoRepository userNstoreRankTrackInfoRepository;

    public HttpEntity<?> postTrackChart(String apiKey, ReqNstoreRankPostTrackChartDTOApiV1 reqDto) {
        getUserEntityByApiKey(apiKey);
//        UserEntity userEntity = getUserEntityByApiKey(apiKey);
//        List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList = new ArrayList<>();
//        reqDto.getNstoreRankTrackInfoList().forEach(nstoreTrackInfo -> {
//            Optional<UserNstoreRankTrackInfoEntity> userNstoreRankTrackInfoEntityOptional = userNstoreRankTrackInfoRepository.findByUserEntityAndNstoreRankTrackInfoEntity_Id(userEntity, nstoreTrackInfo.getId());
//            if (userNstoreRankTrackInfoEntityOptional.isEmpty()) {
//                throw new BadRequestException("존재하지 않는 추적 차트 입니다. (%d)".formatted(nstoreTrackInfo.getId()));
//            }
//            NstoreRankTrackInfoEntity nstoreRankTrackInfoEntity = userNstoreRankTrackInfoEntityOptional.get().getNstoreRankTrackInfoEntity();
//            nstoreRankTrackInfoEntity.setTrackStartDate(nstoreTrackInfo.getTrackStartDate());
//            nstoreRankTrackInfoEntityList.add(nstoreRankTrackInfoEntity);
//        });
        List<Long> nstoreRankTrackInfoIdList = new ArrayList<>();
        reqDto.getNstoreRankTrackInfoList().forEach(thisNstoreRankTrackInfo ->
                nstoreRankTrackInfoIdList.add(thisNstoreRankTrackInfo.getId())
        );
        List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList = nstoreRankTrackInfoRepository.findByIdIn(nstoreRankTrackInfoIdList);
        nstoreRankTrackInfoEntityList.forEach(thisNstoreRankTrackInfoEntity -> {
            thisNstoreRankTrackInfoEntity.setTrackStartDate(
                    reqDto.getNstoreRankTrackInfoList()
                            .stream()
                            .filter(thisNstoreTrackInfo -> thisNstoreTrackInfo.getId().equals(thisNstoreRankTrackInfoEntity.getId()))
                            .findFirst()
                            .get()
                            .getTrackStartDate()
            );
        });
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreRankPostTrackChartDTOApiV1.of(nstoreRankTrackInfoEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getTrackInfo(String apiKey) {
        UserEntity userEntity = getUserEntityByApiKey(apiKey);
        List<UserNstoreRankTrackInfoEntity> userNstoreRankTrackInfoEntityList = userNstoreRankTrackInfoRepository.findByUserEntity(userEntity);
        List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList = userNstoreRankTrackInfoEntityList
                .stream()
                .map(UserNstoreRankTrackInfoEntity::getNstoreRankTrackInfoEntity)
                .toList();
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreRankPostTrackInfoDTOApiV1.of(nstoreRankTrackInfoEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> postTrackInfo(String apiKey, ReqNstoreRankPostTrackInfoDTOApiV1 reqDto) {
        getUserEntityByApiKey(apiKey);
//        UserEntity userEntity = getUserEntityByApiKey(apiKey);
//        List<UserNstoreRankTrackInfoEntity> userNstoreRankTrackInfoEntityList = userNstoreRankTrackInfoRepository.findByUserEntityAndNstoreRankTrackInfoEntity_IdIn(
//                userEntity,
//                reqDto.getNstoreRankTrackInfoIdList()
//        );
//        if (userNstoreRankTrackInfoEntityList.size() != reqDto.getNstoreRankTrackInfoIdList().size()) {
//            throw new BadRequestException("요청 추적 수와 결과 추적 수가 일치하지 않습니다.");
//        }
//        List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList = userNstoreRankTrackInfoEntityList
//                .stream()
//                .map(UserNstoreRankTrackInfoEntity::getNstoreRankTrackInfoEntity)
//                .toList();
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreRankPostTrackInfoDTOApiV1.of(nstoreRankTrackInfoRepository.findByIdIn(reqDto.getNstoreRankTrackInfoIdList())))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> deleteTrack(String apiKey, Long nstoreRankTrackInfoId) {
        UserEntity userEntity = getUserEntityByApiKey(apiKey);
        Optional<UserNstoreRankTrackInfoEntity> userNstoreRankSearchProductTrackInfoEntityOptional =
                userNstoreRankTrackInfoRepository
                        .findByUserEntityAndNstoreRankTrackInfoEntity_Id(userEntity, nstoreRankTrackInfoId);
        if (userNstoreRankSearchProductTrackInfoEntityOptional.isEmpty()) {
            throw new BadRequestException("존재하지 않는 추적 정보입니다.");
        }
        userNstoreRankTrackInfoRepository.delete(userNstoreRankSearchProductTrackInfoEntityOptional.get());
        if (userNstoreRankTrackInfoRepository.countByNstoreRankTrackInfoEntity_Id(nstoreRankTrackInfoId) == 0) {
            nstoreRankTrackInfoRepository.findById(nstoreRankTrackInfoId).ifPresent(thisNstoreRankTrackInfoEntity -> thisNstoreRankTrackInfoEntity.setJson(null));
        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

//    public HttpEntity<?> getTrackableProductDetail(String apiKey, String productId) {
//        getUserEntityByApiKey(apiKey);
//        final UriComponents uriComponents = UriComponentsBuilder
//                .fromHttpUrl("https://smartstore.naver.com/main/products/%s".formatted(productId))
//                .build();
//        ResponseEntity<String> responseEntity = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888)
//                .get()
//                .uri(uriComponents.toUriString())
//                .header("Accept-Language", "ko-KR,ko;q=0.9")
//                .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
//                .block();
//        if (responseEntity.getStatusCode() != HttpStatus.OK) {
//            throw new BadRequestException(
//                    "html을 가져오지 못했습니다. "
//                            + responseEntity.getBody()
//                            .replaceAll("\n", "")
//                            .replaceAll("\t", "")
//                            .replaceAll(" ", "")
//            );
//        }
//        final Document document = Jsoup.parse(responseEntity.getBody());
//        final String titleText = document.getElementsByTag("title").first().text();
//        if (titleText.contains("운영되고 있지 않")
//                || titleText.contains("판매자의 사정에")
//                || titleText.contains("페이지를 찾을 수가")
//                || titleText.contains("상품이 존재하지")
//                || titleText.contains("성인인증이")
//                || titleText.contains("존재하지")
//                || titleText.contains("판매중지")
//                || titleText.contains("중지")
//                || titleText.contains("에러")
//        ) {
//            throw new BadRequestException("url을 확인해주세요.");
//        }
//        JsonNode jsonNode = null;
//        for (Element element : document.select("script")) {
//            if (element.data().contains("window.__PRELOADED_STATE__")) {
//                String[] elementStrBySplit = element.data().split(",\"relationProducts\"");
//                final String preData = elementStrBySplit[0];
//                final String lastData = elementStrBySplit[1].split("\"scrollKept\":(false|true)")[1];
//                String json = (preData + lastData).split("window.__PRELOADED_STATE__=")[1];
//                try {
//                    JsonNode jsonNodeForAdd = objectMapper.readTree(json).get("product").get("A");
//                    ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNodeForAdd).putObject("trackInfo");
//                    objectNodeOfTrackInfo.put("mid", jsonNodeForAdd.get("epInfo").get("syncNvMid").asText());
//                    objectNodeOfTrackInfo.put("productId", jsonNodeForAdd.get("id").asText());
//                    objectNodeOfTrackInfo.put("productName", jsonNodeForAdd.get("name").asText());
//                    objectNodeOfTrackInfo.put("productImageUrl", jsonNodeForAdd.get("representImage").get("url").asText());
//                    objectNodeOfTrackInfo.put("price", jsonNodeForAdd.get("discountedSalePrice").asText());
//                    objectNodeOfTrackInfo.put("mallName", jsonNodeForAdd.get("channel").get("channelName").asText());
//                    objectNodeOfTrackInfo.put("reviewCount", jsonNodeForAdd.get("reviewAmount").get("totalReviewCount").asText());
//                    objectNodeOfTrackInfo.put("scoreInfo", jsonNodeForAdd.get("reviewAmount").get("averageReviewScore").asText());
//                    jsonNode = jsonNodeForAdd;
//                    break;
//                } catch (JsonProcessingException e) {
//                    e.printStackTrace();
//                }
//            }
//        }
//        if (jsonNode == null) {
//            throw new BadRequestException("json을 가져오지 못했습니다.");
//        }
//        return new ResponseEntity<>(
//                ResDTO.builder()
//                        .code(0)
//                        .message("success")
//                        .data(ResNstoreRankGetTrackableDetailDTOApiV1.of(jsonNode))
//                        .build(),
//                HttpStatus.OK
//        );
//    }

    public HttpEntity<?> getTrackable(String apiKey, String url) {
        getUserEntityByApiKey(apiKey);
        if (Pattern.compile(Constants.Regex.NSTORE_CATALOG_URL).matcher(url).matches()) {
            List<JsonNode> jsonNodeList;
            String proxyServerApiKey = null;
            try {
                proxyServerApiKey = UtilVariable.proxyServerApiKeyQueue.take();
                jsonNodeList = getJsonNodeListOfNstoreRankTrackableByCatalogUrl(url, proxyServerApiKey);
            } catch (InterruptedException e) {
                throw new RuntimeException("key를 가져오는 도중 중단되었습니다.");
            } finally {
                if (proxyServerApiKey != null) {
                    nomadproxyWirelessRepository.releaseWirelessEntityByApiKey(proxyServerApiKey);
                    UtilVariable.proxyServerApiKeyQueue.add(proxyServerApiKey);
                }
            }
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNstoreRankGetTrackableCatalogProductDTOApiV1
                                    .of(jsonNodeList))
                            .build(),
                    HttpStatus.OK
            );
        } else if (Pattern.compile(Constants.Regex.NSTORE_PRODUCT_URL).matcher(url).matches()) {
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNstoreRankGetTrackableProductDTOApiV1
                                    .of(getJsonNodeOfNstoreRankTrackableByProductUrl(url)))
                            .build(),
                    HttpStatus.OK
            );
        } else if (Pattern.compile(Constants.Regex.NSTORE_PRODUCT_ID).matcher(url).matches()) {
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNstoreRankGetTrackableProductDTOApiV1
                                    .of(getJsonNodeOfNstoreRankTrackableByProductUrl("https://smartstore.naver.com/main/products/%s".formatted(url))))
                            .build(),
                    HttpStatus.OK
            );
        } else if (Pattern.compile(Constants.Regex.NSTORE_MALL_URL).matcher(url).matches()) {
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNstoreRankGetTrackableMallProductDTOApiV1
                                    .of(getJsonNodeListOfNstoreRankTrackableByMallId(url.split("https://smartstore.naver.com/")[1])))
                            .build(),
                    HttpStatus.OK
            );
        } else if (Pattern.compile(Constants.Regex.NSTORE_MALL_ID).matcher(url).matches()) {
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNstoreRankGetTrackableMallProductDTOApiV1
                                    .of(getJsonNodeListOfNstoreRankTrackableByMallId(url)))
                            .build(),
                    HttpStatus.OK
            );
        } else {
            throw new BadRequestException("url을 확인해주세요.");
        }
    }

    private JsonNode getJsonNodeOfNstoreRankTrackableByProductUrl(String productUrl) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl(productUrl)
                .build();
        ResponseEntity<String> responseEntity = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888)
                .get()
                .uri(uriComponents.toUriString())
                .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
                .block();
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new BadRequestException(
                    "html을 가져오지 못했습니다. "
                            + responseEntity.getBody()
                            .replaceAll("\n", "")
                            .replaceAll("\t", "")
                            .replaceAll(" ", "")
            );
        }
        final Document document = Jsoup.parse(responseEntity.getBody());
        final String titleText = document.getElementsByTag("title").first().text();
        if (titleText.contains("운영되고 있지 않")
                || titleText.contains("판매자의 사정에")
                || titleText.contains("페이지를 찾을 수")
                || titleText.contains("상품이 존재하지")
                || titleText.contains("성인인증이")
                || titleText.contains("존재하지")
                || titleText.contains("판매중지")
                || titleText.contains("중지")
                || titleText.contains("에러")
        ) {
            throw new BadRequestException("url을 확인해주세요.");
        }
        JsonNode jsonNode = null;
        for (Element element : document.select("script")) {
            if (element.data().contains("window.__PRELOADED_STATE__")) {
                String[] elementStrBySplit = element.data().split(",\"relationProducts\"");
                final String preData = elementStrBySplit[0];
                final String lastData = elementStrBySplit[1].split("\"scrollKept\":(false|true)")[1];
                String json = (preData + lastData).split("window.__PRELOADED_STATE__=")[1];
                try {
                    JsonNode jsonNodeForAdd = objectMapper.readTree(json).get("product").get("A");
                    ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNodeForAdd).putObject("trackInfo");
                    objectNodeOfTrackInfo.put("mid", jsonNodeForAdd.get("epInfo").get("syncNvMid").asText());
                    objectNodeOfTrackInfo.put("productId", jsonNodeForAdd.get("id").asText());
                    objectNodeOfTrackInfo.put("productName", jsonNodeForAdd.get("name").asText());
                    objectNodeOfTrackInfo.put("productImageUrl", jsonNodeForAdd.get("representImage").get("url").asText());
                    objectNodeOfTrackInfo.put("category", jsonNodeForAdd.get("category").get("wholeCategoryName").asText());
                    objectNodeOfTrackInfo.put("price", jsonNodeForAdd.get("discountedSalePrice").asText());
                    objectNodeOfTrackInfo.put("mallName", jsonNodeForAdd.get("channel").get("channelName").asText());
                    objectNodeOfTrackInfo.put("reviewCount", jsonNodeForAdd.get("reviewAmount").get("totalReviewCount").asText());
                    objectNodeOfTrackInfo.put("scoreInfo", jsonNodeForAdd.get("reviewAmount").get("totalReviewCount").asText());
                    jsonNode = jsonNodeForAdd.get("trackInfo");
                    break;
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            }
        }
        if (jsonNode == null) {
            throw new BadRequestException("json을 가져오지 못했습니다.");
        }
        return jsonNode;
    }

    private List<JsonNode> getJsonNodeListOfNstoreRankTrackableByCatalogUrl(String catalogUrl, String proxyServerApiKey) {
        try {
            List<JsonNode> jsonNodeListForReturn = new ArrayList<>();
            NomadproxyWirelessEntity nomadproxyWirelessEntity = nomadproxyWirelessRepository.getWirelessEntityByApiKey(proxyServerApiKey);
            final String mid = catalogUrl.split("https://search.shopping.naver.com/catalog/")[1];
            final UriComponents uriComponents = UriComponentsBuilder
                    .fromHttpUrl("https://search.shopping.naver.com/api/catalog/{mid}/products")
                    .queryParam("arrivalGuarantee", false)
                    .queryParam("cardPrice", false)
                    .queryParam("deliveryToday", false)
                    .queryParam("fastDelivery", false)
                    .queryParam("isNPayPlus", false)
                    .queryParam("lowestPrice", "")
                    .queryParam("nvMid", mid)
                    .queryParam("page", 1)
                    .queryParam("pageSize", 20)
                    .queryParam("pr", "PC")
                    .queryParam("sort", "LOW_PRICE")
                    .queryParam("withFee", true)
                    .queryParam("catalogProviderTypeCode", "")
                    .queryParam("catalogType", "DEFAULT")
                    .queryParam("exposeAreaName", "SELLER_BY_PRICE")
                    .queryParam("inflow", "slc")
                    .queryParam("isManual", true)
                    .queryParam("query", "")
                    .buildAndExpand(mid);
            ResponseEntity<String> responseEntity = UtilFunction.getWebClientAutoRedirectWithProxy(proxyServerIp, nomadproxyWirelessEntity.getData().getPort())
                    .get()
                    .uri(uriComponents.toUriString())
                    .header("Accept", "application/json, text/plain, */*")
                    .header("Sbth", UtilFunction.getSbth())
                    .header("Referer", catalogUrl)
                    .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
                    .block();
            if (responseEntity.getStatusCode() != HttpStatus.OK) {
                throw new BadRequestException(
                        "json을 가져오지 못했습니다. "
                                + responseEntity.getBody()
                                .replaceAll("\n", "")
                                .replaceAll("\t", "")
                                .replaceAll(" ", "")
                );
            }
            JsonNode jsonNodeOfResponse = objectMapper.readTree(responseEntity.getBody());
            final boolean hasProduct = !jsonNodeOfResponse.get("result").get("products").isEmpty();
            ObjectNode objectNodeForAdd = new ObjectNode(JsonNodeFactory.instance);
            ObjectNode objectNodeOfTrackInfo = objectNodeForAdd.putObject("trackInfo");
            objectNodeOfTrackInfo.put("mid", mid);
            objectNodeOfTrackInfo.putNull("productId");
            objectNodeOfTrackInfo.put("productName", hasProduct ? jsonNodeOfResponse.get("result").get("products").get(0).get("productName").asText() : "(상품명)");
            objectNodeOfTrackInfo.putNull("productImageUrl");
            objectNodeOfTrackInfo.put("category", "");
            objectNodeOfTrackInfo.put("price", hasProduct ? jsonNodeOfResponse.get("result").get("products").get(0).get("priceWithFee").asText() : "(가격)");
            objectNodeOfTrackInfo.put("mallName", "카탈로그 상품");
            objectNodeOfTrackInfo.put("reviewCount", "-");
            objectNodeOfTrackInfo.put("scoreInfo", "-");
            jsonNodeListForReturn.add(objectNodeForAdd.get("trackInfo"));
            return jsonNodeListForReturn;
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

//    private List<JsonNode> getJsonNodeListOfNstoreRankTrackableByCatalogUrl(String catalogUrl, String proxyServerApiKey) {
//        try {
//            List<JsonNode> jsonNodeListForReturn = new ArrayList<>();
////            synchronized (UtilVariable.lock) {
//            NomadproxyWirelessEntity nomadproxyWirelessEntity = nomadproxyWirelessRepository.getWirelessEntityByApiKey(proxyServerApiKey);
//            final UriComponents uriComponentsForProductInfo = UriComponentsBuilder.fromHttpUrl(catalogUrl).build();
//            ResponseEntity<String> responseEntityForProductInfo = UtilFunction.getWebClientAutoRedirectWithProxy(proxyServerIp, nomadproxyWirelessEntity.getData().getPort())
//                    .get()
//                    .uri(uriComponentsForProductInfo.toUriString())
//                    .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
//                    .block();
//            if (responseEntityForProductInfo.getStatusCode() != HttpStatus.OK) {
//                if (responseEntityForProductInfo.getBody() != null) {
//                    if (responseEntityForProductInfo.getBody().contains("운영되고 있지 않")
//                            || responseEntityForProductInfo.getBody().contains("판매자의 사정에")
//                            || responseEntityForProductInfo.getBody().contains("페이지를 찾을 수")
//                            || responseEntityForProductInfo.getBody().contains("상품이 존재하지")
//                            || responseEntityForProductInfo.getBody().contains("성인인증이")
//                            || responseEntityForProductInfo.getBody().contains("존재하지")
//                            || responseEntityForProductInfo.getBody().contains("판매중지")
//                            || responseEntityForProductInfo.getBody().contains("중지")
//                            || responseEntityForProductInfo.getBody().contains("에러")
//                    ) {
//                        throw new BadRequestException("url을 확인해주세요.");
//                    }
//                }
//                throw new BadRequestException(
//                        "html을 가져오지 못했습니다. "
//                                + responseEntityForProductInfo.getBody()
//                                .replaceAll("\n", "")
//                                .replaceAll("\t", "")
//                                .replaceAll(" ", "")
//                );
//            }
//            final Document document = Jsoup.parse(responseEntityForProductInfo.getBody());
//            final String nextData = document.getElementById("__NEXT_DATA__").data();
//            JsonNode pageJsonNode = objectMapper.readTree(nextData);
//            ObjectNode objectNodeForAdd = new ObjectNode(JsonNodeFactory.instance);
//            ObjectNode objectNodeOfTrackInfo = objectNodeForAdd.putObject("trackInfo");
//            objectNodeOfTrackInfo.put("mid", pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("nvMid").asText());
//            objectNodeOfTrackInfo.putNull("productId");
//            objectNodeOfTrackInfo.put("productName", pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("productName").asText());
//            objectNodeOfTrackInfo.put("productImageUrl", pageJsonNode.get("props").get("pageProps").get("ogTag").get("image").asText());
//            objectNodeOfTrackInfo.put("category", UtilFunction.decodeUnicode(pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("category").get("fullCatNm").asText()));
//            objectNodeOfTrackInfo.put("price", pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("lowestPriceWithFee").asText());
//            objectNodeOfTrackInfo.putNull("mallName");
//            objectNodeOfTrackInfo.put("mallName", "카탈로그 상품");
//            objectNodeOfTrackInfo.put("reviewCount", pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("reviewCount").asText());
//            if (pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("reviewScore").isNull()) {
//                objectNodeOfTrackInfo.put("scoreInfo", "0");
//            } else {
//                objectNodeOfTrackInfo.put("scoreInfo", pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("reviewScore").asText());
//            }
//            jsonNodeListForReturn.add(objectNodeForAdd.get("trackInfo"));
//            // 추후 카탈로그 하위 상품에 대한 추적을 할 경우 사용하기 위해 주석처리 20240524
////            final String mid = catalogUrl.split("https://search.shopping.naver.com/catalog/")[1];
////            // 첫페이지만 검색하도록 세팅 20240524
////            for (int i = 0; i < 1; i++) {
////                final UriComponents uriComponents = UriComponentsBuilder
////                        .fromHttpUrl("https://search.shopping.naver.com/api/catalog/{mid}/products")
////                        .queryParam("arrivalGuarantee", false)
////                        .queryParam("cardPrice", false)
////                        .queryParam("deliveryToday", false)
////                        .queryParam("fastDelivery", false)
////                        .queryParam("isNPayPlus", false)
////                        .queryParam("lowestPrice", "")
////                        .queryParam("nvMid", mid)
////                        .queryParam("page", i + 1)
////                        .queryParam("pageSize", 20)
////                        .queryParam("pr", "PC")
////                        .queryParam("sort", "LOW_PRICE")
////                        .queryParam("withFee", true)
////                        .queryParam("catalogProviderTypeCode", "")
////                        .queryParam("catalogType", "DEFAULT")
////                        .queryParam("exposeAreaName", "SELLER_BY_PRICE")
////                        .queryParam("inflow", "slc")
////                        .queryParam("isManual", true)
////                        .queryParam("query", 80)
////                        .buildAndExpand(mid);
////                ResponseEntity<String> responseEntity = UtilFunction.getWebClientAutoRedirectWithProxy(proxyServerIp, nomadproxyWirelessEntity.getData().getPort())
////                        .get()
////                        .uri(uriComponents.toUriString())
////                        .header("Accept", "application/json, text/plain, */*")
////                        .header("Sbth", UtilFunction.getSbth())
////                        .header("Referer", "https://www.google.com")
////                        .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
////                        .block();
////                if (responseEntity.getStatusCode() != HttpStatus.OK) {
////                    throw new BadRequestException(
////                            "html을 가져오지 못했습니다. "
////                                    + responseEntity.getBody()
////                                    .replaceAll("\n", "")
////                                    .replaceAll("\t", "")
////                                    .replaceAll(" ", "")
////                    );
////                }
////                JsonNode jsonNode = objectMapper.readTree(Objects.requireNonNull(responseEntity).getBody());
////                jsonNode.get("result").get("products").forEach(jsonNodeForAdd -> {
////                    ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNodeForAdd).putObject("trackInfo");
////                    objectNodeOfTrackInfo.put("mid", jsonNodeForAdd.get("matchNvMid").asText());
//////                    objectNodeOfTrackInfo.put("productId", jsonNodeForAdd.get("mallPid").asText());
////                    objectNodeOfTrackInfo.putNull("productId");
//////                    objectNodeOfTrackInfo.put("productName", pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("productName").asText());
////                    objectNodeOfTrackInfo.put("productName", jsonNodeForAdd.get("productName").asText());
////                    objectNodeOfTrackInfo.put("productImageUrl", pageJsonNode.get("props").get("pageProps").get("ogTag").get("image").asText());
////                    objectNodeOfTrackInfo.put("category", UtilFunction.decodeUnicode(pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("category").get("fullCatNm").asText()));
////                    objectNodeOfTrackInfo.put("price", jsonNodeForAdd.get("pcPrice").asText());
////                    objectNodeOfTrackInfo.put("mallName", jsonNodeForAdd.get("mallName").asText());
//////                    objectNodeOfTrackInfo.put("reviewCount", jsonNodeForAdd.get("mobileReviewCount").asText());
////                    objectNodeOfTrackInfo.put("reviewCount", pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("reviewCount").asText());
////                    if (pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("reviewScore").isNull()) {
////                        objectNodeOfTrackInfo.put("scoreInfo", "0");
////                    } else {
////                        objectNodeOfTrackInfo.put("scoreInfo", pageJsonNode.get("props").get("pageProps").get("initialState").get("catalog").get("info").get("reviewScore").asText());
////                    }
////                    jsonNodeListForReturn.add(jsonNodeForAdd.get("trackInfo"));
////                });
////                if (jsonNode.get("result").get("products").size() < 20) {
////                    break;
////                }
////            }
//            return jsonNodeListForReturn;
//        } catch (Exception e) {
//            throw new BadRequestException(e.getMessage());
//        }
//    }

    private List<JsonNode> getJsonNodeListOfNstoreRankTrackableByMallId(String mallId) {
        final UriComponents uriComponentsForProductHref = UriComponentsBuilder
                .fromHttpUrl("https://smartstore.naver.com/{mallId}")
                .buildAndExpand(mallId);
        ResponseEntity<String> responseEntityMonoForCategoryKey = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888)
                .get()
                .uri(uriComponentsForProductHref.toUriString())
                .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
                .block();
        if (responseEntityMonoForCategoryKey.getStatusCode() != HttpStatus.OK) {
            throw new BadRequestException(
                    "html을 가져오지 못했습니다. "
                            + responseEntityMonoForCategoryKey.getBody()
                            .replaceAll("\n", "")
                            .replaceAll("\t", "")
                            .replaceAll(" ", "")
            );
        }
        final Document document = Jsoup.parse(responseEntityMonoForCategoryKey.getBody());
        final String titleText = document.getElementsByTag("title").first().text();
        if (titleText.contains("운영되고 있지 않")
                || titleText.contains("판매자의 사정에")
                || titleText.contains("페이지를 찾을 수")
                || titleText.contains("성인인증이")
                || titleText.contains("존재하지")
                || titleText.contains("중지")
                || titleText.contains("에러")
        ) {
            throw new BadRequestException("url을 확인해주세요.");
        }
        JsonNode jsonNodeForCategoryKey = null;
        for (Element element : document.select("script")) {
            if (element.data().contains("window.__PRELOADED_STATE__")) {
                String json = element.data().split("window.__PRELOADED_STATE__=")[1];
                try {
                    jsonNodeForCategoryKey = objectMapper.readTree(json);
                    break;
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new BadRequestException("json을 가져오지 못했습니다.");
                }
            }
        }
        if (jsonNodeForCategoryKey == null) {
            throw new BadRequestException("json을 가져오지 못했습니다.");
        }
        if (document.select("li[class*='N=a:lca.all']").isEmpty()) {
            return List.of();
        }
        String categoryIdOfAll = document.select("li[class*='N=a:lca.all']").first().attr("data-category-menu-key");
        String channelUid = jsonNodeForCategoryKey.get("smartStoreV2").get("channel").get("channelUid").asText();
        List<JsonNode> jsonNodeList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            final UriComponents uriComponents = UriComponentsBuilder
                    .fromHttpUrl("https://smartstore.naver.com/i/v2/channels/{channelUid}/categories/ALL/products")
                    .queryParam("categorySearchType", "DISPCATG")
                    .queryParam("sortType", "POPULAR")
                    .queryParam("page", i + 1)
                    .queryParam("pageSize", 80)
                    .buildAndExpand(channelUid);
            ResponseEntity<String> responseEntity = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888)
                    .get()
                    .uri(uriComponents.toUriString())
                    .header("Accept", "application/json, text/plain, */*")
                    .header("Referer", "https://smartstore.naver.com/%s/category/%s".formatted(mallId, categoryIdOfAll))
                    .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
                    .block();
            if (responseEntity.getStatusCode() != HttpStatus.OK) {
                if (responseEntity.getBody() != null) {
                    if (responseEntity.getBody().contains("운영되고 있지 않")
                            || responseEntity.getBody().contains("판매자의 사정에")
                            || responseEntity.getBody().contains("페이지를 찾을 수")
                            || responseEntity.getBody().contains("상품이 존재하지")
                            || responseEntity.getBody().contains("성인인증이")
                            || responseEntity.getBody().contains("존재하지")
                            || responseEntity.getBody().contains("판매중지")
                            || responseEntity.getBody().contains("중지")
                            || responseEntity.getBody().contains("에러")
                    ) {
                        throw new BadRequestException("url을 확인해주세요.");
                    }
                }
                throw new BadRequestException(
                        "html을 가져오지 못했습니다. "
                                + responseEntity.getBody()
                                .replaceAll("\n", "")
                                .replaceAll("\t", "")
                                .replaceAll(" ", "")
                );
            }
            try {
                JsonNode jsonNode = objectMapper.readTree(Objects.requireNonNull(responseEntity).getBody());
                jsonNode.get("simpleProducts").forEach(jsonNodeForAdd -> {
                    ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNodeForAdd).putObject("trackInfo");
                    objectNodeOfTrackInfo.putNull("mid");
                    objectNodeOfTrackInfo.put("productId", jsonNodeForAdd.get("id").asText());
                    objectNodeOfTrackInfo.put("productName", jsonNodeForAdd.get("name").asText());
                    objectNodeOfTrackInfo.put("productImageUrl", jsonNodeForAdd.get("representativeImageUrl").asText());
                    objectNodeOfTrackInfo.put("category", jsonNodeForAdd.get("category").get("wholeCategoryName").asText());
                    objectNodeOfTrackInfo.put("price", jsonNodeForAdd.get("salePrice").asText());
                    objectNodeOfTrackInfo.put("mallName", jsonNodeForAdd.get("channel").get("channelName").asText());
                    objectNodeOfTrackInfo.put("reviewCount", jsonNodeForAdd.get("reviewAmount").get("totalReviewCount").asText());
                    objectNodeOfTrackInfo.put("scoreInfo", jsonNodeForAdd.get("reviewAmount").get("averageReviewScore").asText());
                    jsonNodeList.add(jsonNodeForAdd.get("trackInfo"));
                });
                if (jsonNode.get("simpleProducts").size() < 80) {
                    break;
                }
            } catch (JsonProcessingException e) {
                e.printStackTrace();
                throw new BadRequestException(e.getMessage());
            }
        }
        return jsonNodeList;
    }

    @Transactional
    public HttpEntity<?> postTrack(String apiKey, String keyword, String mid, String productId) {
        UserEntity userEntity = getUserEntityByApiKey(apiKey);
        if ((mid == null || mid.isEmpty()) && (productId == null || productId.isEmpty())) {
            throw new BadRequestException("mid 또는 productId를 입력해주세요.");
        }
        NstoreRankTrackInfoEntity nstoreRankTrackInfoEntity = getNstoreRankTrackInfoEntity(keyword, mid, productId, userEntity);
        if (nstoreRankTrackInfoEntity.getServiceStatus() != null
                && nstoreRankTrackInfoEntity.getServiceStatus() == -1
        ) {
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(Constants.ResCode.ENTITY_ALREADY_EXIST_EXCEPTION)
                            .message("이미 추적 중인 상품입니다.")
                            .data(ResNstoreRankPostTrackDTOApiV1.of(nstoreRankTrackInfoEntity))
                            .build(),
                    HttpStatus.BAD_REQUEST
            );
        }
//        if (nstoreRankSearchProductTrackInfoEntity.getServiceStatus() == -2) {
//            return new ResponseEntity<>(
//                    ResDTO.builder()
//                            .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
//                            .message("검색된 상품 정보가 없습니다.")
//                            .data(null)
//                            .build(),
//                    HttpStatus.BAD_REQUEST
//            );
//        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreRankPostTrackDTOApiV1.of(nstoreRankTrackInfoEntity))
                        .build(),
                HttpStatus.OK
        );
    }

    private NstoreRankTrackInfoEntity getNstoreRankTrackInfoEntity(String keyword, String mid, String productId, UserEntity userEntity) {
        JsonNode jsonNodeOfNstoreRankProduct = null;
        String notNullMid;
        if (mid == null || mid.isEmpty()) {
            jsonNodeOfNstoreRankProduct = getJsonNodeOfNstoreRankTrackableByProductUrl("https://smartstore.naver.com/main/products/%s".formatted(productId));
            notNullMid = jsonNodeOfNstoreRankProduct.get("mid").asText();
        } else {
            notNullMid = mid;
        }
        Optional<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityOptional = nstoreRankTrackInfoRepository.findByKeywordAndMid(keyword, notNullMid);
        NstoreRankTrackInfoEntity nstoreRankTrackInfoEntity;
        if (nstoreRankTrackInfoEntityOptional.isEmpty()) {
            NstoreRankTrackInfoEntity nstoreRankTrackInfoEntityForSave = NstoreRankTrackInfoEntity.builder()
                    .keyword(keyword)
                    .mid(notNullMid)
                    .productId(productId)
                    .rankChange(0)
                    .rankWithAdChange(0)
                    .json(null)
                    .trackStatus(TrackStatusType.COMPLETE)
                    .createDate(LocalDateTime.now())
                    .nstoreRankTrackEntityList(new ArrayList<>())
                    .build();
            nstoreRankTrackInfoEntity = nstoreRankTrackInfoRepository.save(nstoreRankTrackInfoEntityForSave);
        } else {
            nstoreRankTrackInfoEntity = nstoreRankTrackInfoEntityOptional.get();
        }
        Optional<UserNstoreRankTrackInfoEntity> userNstoreRankTrackInfoEntityOptional = userNstoreRankTrackInfoRepository.findByUserEntityAndNstoreRankTrackInfoEntity(userEntity, nstoreRankTrackInfoEntity);
        if (userNstoreRankTrackInfoEntityOptional.isPresent()) {
            userNstoreRankTrackInfoEntityOptional.get().getNstoreRankTrackInfoEntity().setServiceStatus(-1);
            return userNstoreRankTrackInfoEntityOptional.get().getNstoreRankTrackInfoEntity();
        }
        userNstoreRankTrackInfoRepository.save(UserNstoreRankTrackInfoEntity.builder()
                .userEntity(userEntity)
                .nstoreRankTrackInfoEntity(nstoreRankTrackInfoEntity)
                .createDate(LocalDateTime.now())
                .build());
//        List<NstoreRankTrackEntity> nstoreRankTrackEntityList = nstoreRankTrackInfoEntity.getNstoreRankTrackEntityList();
//        if (nstoreRankTrackEntityList.isEmpty()) {
//            List<JsonNode> jsonNodeList;
//            String proxyServerApiKey = null;
//            try {
//                proxyServerApiKey = UtilVariable.proxyServerApiKeyQueue.take();
//                jsonNodeList = saveNstoreRankSearchProductEntityListAndGetJsonNodeList(keyword, proxyServerApiKey);
//            } catch (InterruptedException e) {
//                throw new RuntimeException("key를 가져오는 도중 중단되었습니다.");
//            } finally {
//                if (proxyServerApiKey != null) {
//                    nomadproxyWirelessRepository.releaseWirelessEntityByApiKey(proxyServerApiKey);
//                    UtilVariable.proxyServerApiKeyQueue.add(proxyServerApiKey);
//                }
//            }
//            List<JsonNode> jsonNodeListByFilterMid = jsonNodeList
//                    .stream()
//                    .filter(jsonNode -> jsonNode.get("id").asText().contains(notNullMid))
//                    .toList();
//            NstoreRankTrackEntity nstoreRankTrackEntityForSave;
//            if (jsonNodeListByFilterMid.isEmpty()) {
//                if (jsonNodeOfNstoreRankProduct == null && productId != null && !productId.isEmpty()) {
//                    jsonNodeOfNstoreRankProduct = getJsonNodeOfNstoreRankTrackableByProductUrl("https://smartstore.naver.com/main/products/%s".formatted(productId));
//                }
//                nstoreRankTrackEntityForSave = NstoreRankTrackEntity.builder()
//                        .nstoreRankTrackInfoEntity(nstoreRankTrackInfoEntity)
//                        .rank(-1)
//                        .prevRank(-1)
//                        .rankWithAd(-1)
//                        .prevRankWithAd(-1)
//                        .price(jsonNodeOfNstoreRankProduct == null ? "0" : jsonNodeOfNstoreRankProduct.get("price").asText())
//                        .reviewCount(jsonNodeOfNstoreRankProduct == null ? "0" : jsonNodeOfNstoreRankProduct.get("reviewCount").asText())
//                        .scoreInfo(jsonNodeOfNstoreRankProduct == null ? "0" : jsonNodeOfNstoreRankProduct.get("scoreInfo").asText())
//                        .isValid(true)
//                        .ampm(LocalTime.now().isBefore(LocalTime.NOON) ? AmpmType.AM : AmpmType.PM)
////                        .chartDate(UtilFunction.getNstoreChartDate(LocalDateTime.now()))
//                        .chartDate(LocalDateTime.now())
//                        .createDate(LocalDateTime.now())
//                        .build();
//                nstoreRankTrackInfoEntity.setProductId(jsonNodeOfNstoreRankProduct == null ? null : jsonNodeOfNstoreRankProduct.get("productId").asText());
//                ObjectNode json = new ObjectNode(JsonNodeFactory.instance);
//                ObjectNode rankInfo = json.putObject("rankInfo");
//                rankInfo.put("rank", -1);
//                rankInfo.put("totalCount", -1);
//                json.putIfAbsent("trackInfo", jsonNodeOfNstoreRankProduct);
//                nstoreRankTrackInfoEntity.setJson(json);
//            } else {
//                nstoreRankTrackEntityForSave = NstoreRankTrackEntity.builder()
//                        .nstoreRankTrackInfoEntity(nstoreRankTrackInfoEntity)
//                        .rank(jsonNodeListByFilterMid.get(0).get("rankInfo").get("rank").asInt())
//                        .prevRank(-1)
//                        .rankWithAd(jsonNodeListByFilterMid.get(0).get("rankInfo").get("rankWithAd").asInt())
//                        .prevRankWithAd(-1)
//                        .price(jsonNodeListByFilterMid.get(0).get("trackInfo").get("price").asText())
//                        .reviewCount(jsonNodeListByFilterMid.get(0).get("trackInfo").get("reviewCount").asText())
//                        .scoreInfo(jsonNodeListByFilterMid.get(0).get("trackInfo").get("scoreInfo").asText())
//                        .isValid(true)
//                        .ampm(LocalTime.now().isBefore(LocalTime.NOON) ? AmpmType.AM : AmpmType.PM)
////                        .chartDate(UtilFunction.getNstoreChartDate(LocalDateTime.now()))
//                        .chartDate(LocalDateTime.now())
//                        .createDate(LocalDateTime.now())
//                        .build();
//                nstoreRankTrackInfoEntity.setProductId(jsonNodeListByFilterMid.get(0).get("trackInfo").get("productId").asText());
//                nstoreRankTrackInfoEntity.setJson(jsonNodeListByFilterMid.get(0));
//            }
//            NstoreRankTrackEntity nstoreRankTrackEntity = nstoreRankTrackRepository.save(nstoreRankTrackEntityForSave);
//            nstoreRankTrackInfoEntity.setTodayNstoreRankTrackId(nstoreRankTrackEntity.getId());
//            nstoreRankTrackInfoEntity.setUpdateDate(LocalDateTime.now());
//            nstoreRankTrackInfoEntity.getNstoreRankTrackEntityList().add(nstoreRankTrackEntity);
//            nstoreRankTrackInfoEntity.setServiceStatus(0);
//        }
        return nstoreRankTrackInfoEntity;
    }

    @Transactional
    public HttpEntity<?> getRealtime(String apiKey, String keyword, String
            filterValue, NstoreRankRealtimeFilterType filterType, boolean compare, boolean ad) {
        getUserEntityByApiKey(apiKey);
        List<JsonNode> jsonNodeList;
        String proxyServerApiKey = null;
        try {
            proxyServerApiKey = UtilVariable.proxyServerApiKeyQueue.take();
            jsonNodeList = saveNstoreRankSearchProductEntityListAndGetJsonNodeList(keyword, proxyServerApiKey);
        } catch (InterruptedException e) {
            throw new RuntimeException("key를 가져오는 도중 중단되었습니다.");
        } finally {
            if (proxyServerApiKey != null) {
                nomadproxyWirelessRepository.releaseWirelessEntityByApiKey(proxyServerApiKey);
                UtilVariable.proxyServerApiKeyQueue.add(proxyServerApiKey);
            }
        }
        List<JsonNode> jsonNodeListForReturn;
        if (NstoreRankRealtimeFilterType.COMPANY_NAME.equals(filterType)) {
            jsonNodeListForReturn = filterJsonNodeListByCompanyName(filterValue, compare, ad, jsonNodeList);
        } else if (NstoreRankRealtimeFilterType.MID.equals(filterType)) {
            jsonNodeListForReturn = filterJsonNodeListByMid(filterValue, compare, ad, jsonNodeList);
        } else {
            throw new BadRequestException("잘못된 filterType입니다.");
        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreRankGetRealtimeDTOApiV1.of(jsonNodeListForReturn))
                        .build(),
                HttpStatus.OK
        );
    }

    private static List<JsonNode> filterJsonNodeListByCompanyName(String companyName, boolean compare, boolean ad, List<JsonNode> jsonNodeList) {
        List<JsonNode> jsonNodeListForReturn = new ArrayList<>(jsonNodeList);
        if (!compare) {
            jsonNodeListForReturn = jsonNodeListForReturn
                    .stream()
                    .filter(jsonNode -> !jsonNode.get("lowMallList").isArray())
                    .toList();
        }
        if (!ad) {
            jsonNodeListForReturn = jsonNodeListForReturn
                    .stream()
                    .filter(jsonNode -> jsonNode.get("adId") == null)
                    .toList();
        }
        if (!companyName.isBlank()) {
            jsonNodeListForReturn = jsonNodeListForReturn
                    .stream()
                    .filter(jsonNode -> {
                        final List<JsonNode> jsonNodeListOfLowMall = new ArrayList<>();
                        if (jsonNode.get("lowMallList") != null) {
                            jsonNode.get("lowMallList").forEach(jsonNodeListOfLowMall::add);
                        }
                        final List<JsonNode> jsonNodeListOfLowMallByFilter = jsonNodeListOfLowMall
                                .stream()
                                .filter(jsonNodeOfLowMall ->
                                        UtilFunction.refineFilterValue(jsonNodeOfLowMall.get("name").asText())
                                                .contains(companyName))
                                .toList();
                        return UtilFunction.refineFilterValue(jsonNode.get("mallName").asText()).contains(companyName)
                                || !jsonNodeListOfLowMallByFilter.isEmpty();
                    })
                    .toList();
        }
        return jsonNodeListForReturn;
    }

    private static List<JsonNode> filterJsonNodeListByMid(String mid, boolean compare, boolean ad, List<JsonNode> jsonNodeList) {
        List<JsonNode> jsonNodeListForReturn = new ArrayList<>(jsonNodeList);
        if (!compare) {
            jsonNodeListForReturn = jsonNodeListForReturn
                    .stream()
                    .filter(jsonNode -> !jsonNode.get("lowMallList").isArray())
                    .toList();
        }
        if (!ad) {
            jsonNodeListForReturn = jsonNodeListForReturn
                    .stream()
                    .filter(jsonNode -> jsonNode.get("adId") == null)
                    .toList();
        }
        if (!mid.isBlank()) {
            jsonNodeListForReturn = jsonNodeListForReturn
                    .stream()
                    .filter(jsonNode -> jsonNode.get("id").asText().contains(mid) || jsonNode.get("parentId").asText().contains(mid))
                    .toList();
        }
        return jsonNodeListForReturn;
    }

    private List<JsonNode> saveNstoreRankSearchProductEntityListAndGetJsonNodeList(String keyword, String proxyServerApiKey) {
        List<JsonNode> jsonNodeListForReturn;
        Optional<NstoreRankSearchProductInfoEntity> nstoreRankSearchProductInfoEntityOptional = nstoreRankSearchProductInfoRepository.findByKeyword(keyword);
        if (nstoreRankSearchProductInfoEntityOptional.isPresent()) {
            jsonNodeListForReturn = nstoreRankSearchProductInfoEntityOptional.get().getNstoreRankSearchProductEntityList()
                    .stream()
                    .map(NstoreRankSearchProductEntity::getJson)
                    .toList();
        } else {
            jsonNodeListForReturn = getJsonNodeListOfNstoreRankRealtime(keyword, proxyServerApiKey);
            NstoreRankSearchProductInfoEntity nstoreRankSearchProductInfoEntityForSave = NstoreRankSearchProductInfoEntity.builder()
                    .keyword(keyword)
                    .createDate(LocalDateTime.now())
                    .build();
            NstoreRankSearchProductInfoEntity nstoreRankSearchProductInfoEntity = nstoreRankSearchProductInfoRepository.save(nstoreRankSearchProductInfoEntityForSave);
            List<NstoreRankSearchProductEntity> nstoreRankSearchProductEntityListForSave = jsonNodeListForReturn
                    .stream()
                    .map(jsonNode -> {
                        try {
                            return NstoreRankSearchProductEntity.builder()
                                    .nstoreRankSearchProductInfoEntity(nstoreRankSearchProductInfoEntity)
                                    .json(jsonNode)
                                    .createDate(LocalDateTime.now())
                                    .build();
                        } catch (Exception e) {
                            e.printStackTrace();
                            throw new BadRequestException("데이터 파싱 도중 문제가 발생했습니다.");
                        }
                    })
                    .toList();
//            nstoreTableProductRepository.saveAll(nstoreTableProductEntityListForSave);
            final String sql = "INSERT INTO NSTORE_RANK_SEARCH_PRODUCT (nstore_rank_search_product_info_id, json, create_date) VALUES (?, ?, ?)";
            jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    ps.setLong(1, nstoreRankSearchProductEntityListForSave.get(i).getNstoreRankSearchProductInfoEntity().getId());
                    try {
                        ps.setString(2, objectMapper.writeValueAsString(nstoreRankSearchProductEntityListForSave.get(i).getJson()));
                    } catch (JsonProcessingException e) {
                        e.printStackTrace();
                        throw new BadRequestException("데이터 파싱 도중 문제가 발생했습니다.");
                    }
                    ps.setTimestamp(3, Timestamp.valueOf(nstoreRankSearchProductEntityListForSave.get(i).getCreateDate()));
                }

                @Override
                public int getBatchSize() {
                    return nstoreRankSearchProductEntityListForSave.size();
                }
            });
        }
        return jsonNodeListForReturn;
    }

//    private List<JsonNode> getJsonNodeListOfNstoreRankRealtime(String keyword, String proxyServerApiKey) {
//        try {
//            return new ForkJoinPool(10).submit(() -> {
//                final List<Integer> pageList = List.of(1, 2, 3);
//                final ConcurrentHashMap<Integer, List<JsonNode>> concurrentHashMap = new ConcurrentHashMap<>();
//                final AtomicInteger totalCountAtomic = new AtomicInteger(0);
//                final int size = 100;
////                synchronized (UtilVariable.lock) {
//                NomadproxyWirelessEntity nomadproxyWirelessEntity = nomadproxyWirelessRepository.getWirelessEntityByApiKey(proxyServerApiKey);
//                WebClient webClient = UtilFunction.getWebClientAutoRedirectWithProxy(proxyServerIp, nomadproxyWirelessEntity.getData().getPort());
//                pageList.parallelStream().forEach(page -> {
////                    for (Integer page : pageList) {
//                    final UriComponents uriComponents = UriComponentsBuilder
//                            .fromHttpUrl("https://search.shopping.naver.com/search/all")
//                            .queryParam("query", keyword)
//                            .queryParam("adQuery", keyword)
//                            .queryParam("origQuery", keyword)
//                            .queryParam("pagingIndex", page)
//                            .queryParam("pagingSize", size)
//                            .queryParam("productSet", "total")
//                            .queryParam("sort", "rel")
//                            .queryParam("frm", "NVSHATC")
//                            .queryParam("viewType", "list")
//                            .build();
//                    ResponseEntity<String> responseEntity = webClient
//                            .get()
//                            .uri(uriComponents.toUriString())
//                            .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
//                            .block();
//                    if (responseEntity.getStatusCode() != HttpStatus.OK) {
//                        throw new BadRequestException(
//                                "html을 가져오지 못했습니다. "
//                                        + responseEntity.getBody()
//                                        .replaceAll("\n", "")
//                                        .replaceAll("\t", "")
//                                        .replaceAll(" ", "")
//                        );
//                    }
//                    final Document document = Jsoup.parse(responseEntity.getBody());
//                    final String nextData = Objects.requireNonNull(document.getElementById("__NEXT_DATA__")).data();
//                    final List<JsonNode> jsonNodeListForProducts = new ArrayList<>();
//                    final JsonNode jsonNodeOfProducts;
//                    try {
//                        jsonNodeOfProducts = objectMapper.readTree(nextData)
//                                .get("props")
//                                .get("pageProps")
//                                .get("initialState")
//                                .get("products");
//                    } catch (JsonProcessingException e) {
//                        throw new RuntimeException(e);
//                    }
//                    if (page == 1) {
//                        totalCountAtomic.set(jsonNodeOfProducts.get("total").asInt());
//                    }
//                    jsonNodeOfProducts.get("list").forEach(jsonNode -> {
//                        ((ObjectNode) jsonNode.get("item")).putObject("rankInfo").put("pageUrl", uriComponents.toUriString());
//                        ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNode.get("item")).putObject("trackInfo");
//                        objectNodeOfTrackInfo.put("mid", jsonNode.get("item").get("id").asText());
//                        if (jsonNode.get("item").get("mallProductId") == null || jsonNode.get("item").get("mallProductId").isNull()) {
//                            objectNodeOfTrackInfo.putNull("productId");
//                        } else {
//                            objectNodeOfTrackInfo.put("productId", jsonNode.get("item").get("mallProductId").asText());
//                        }
//                        objectNodeOfTrackInfo.put("productName", jsonNode.get("item").get("productTitle").asText());
//                        objectNodeOfTrackInfo.put("productImageUrl", jsonNode.get("item").get("imageUrl").asText());
//                        StringBuilder category = new StringBuilder();
//                        for (int i = 1; i < 5; i++) {
//                            JsonNode categoryNameNode = jsonNode.get("item").get("category" + (i) + "Name");
//                            if (categoryNameNode == null || categoryNameNode.isNull()) {
//                                break;
//                            }
//                            category.append(categoryNameNode.asText());
//                            JsonNode nextCategoryNameNode = jsonNode.get("item").get("category" + (i + 1) + "Name");
//                            if (nextCategoryNameNode != null && !nextCategoryNameNode.isNull() && !nextCategoryNameNode.asText().isBlank()) {
//                                category.append(">");
//                            }
//                        }
//                        objectNodeOfTrackInfo.put("category", category.toString());
//                        objectNodeOfTrackInfo.put("price", jsonNode.get("item").get("price").asText());
//                        if (jsonNode.get("item").get("mallName") == null || jsonNode.get("item").get("mallName").isNull()) {
//                            objectNodeOfTrackInfo.putNull("mallName");
//                        } else {
//                            objectNodeOfTrackInfo.put("mallName", jsonNode.get("item").get("mallName").asText());
//                        }
//                        objectNodeOfTrackInfo.put("reviewCount", jsonNode.get("item").get("reviewCount").asText());
//                        if (jsonNode.get("item").get("scoreInfo") == null || jsonNode.get("item").get("scoreInfo").isNull()) {
//                            objectNodeOfTrackInfo.put("scoreInfo", "0");
//                        } else {
//                            objectNodeOfTrackInfo.put("scoreInfo", jsonNode.get("item").get("scoreInfo").asText());
//                        }
//                        jsonNodeListForProducts.add(jsonNode.get("item"));
//                    });
////                        if (jsonNodeListForProducts.isEmpty()) {
////                            break;
////                        }
//                    concurrentHashMap.put(page, jsonNodeListForProducts);
//                });
////                }
//                final List<JsonNode> jsonNodeListForReturn = new ArrayList<>();
//                AtomicInteger previousProductCountWithAd = new AtomicInteger(0);
//                pageList.forEach(page -> {
//                    final int indexOfPage = pageList.indexOf(page);
//                    List<JsonNode> jsonNodeList = concurrentHashMap.get(page);
//                    if (jsonNodeList == null) {
//                        return;
//                    }
//                    jsonNodeList.forEach(jsonNode -> {
//                        final boolean isAd = jsonNode.get("adId") != null;
//                        final int indexOfJsonNode = jsonNodeList.indexOf(jsonNode);
//                        final int pageRankWithAd = indexOfJsonNode + 1;
//                        final int rankWithAd = pageRankWithAd + previousProductCountWithAd.get();
//                        final ObjectNode objectNodeOfRankInfo = (ObjectNode) jsonNode.get("rankInfo");
//                        objectNodeOfRankInfo.put("pageIndex", page);
//                        objectNodeOfRankInfo.put("pageRank", -1);
//                        objectNodeOfRankInfo.put("pageRankWithAd", pageRankWithAd);
//                        objectNodeOfRankInfo.put("rank", -1);
//                        objectNodeOfRankInfo.put("rankWithAd", rankWithAd);
//                        objectNodeOfRankInfo.put("totalCount", totalCountAtomic.get());
//                        objectNodeOfRankInfo.put("isAd", isAd);
//                    });
//                    List<JsonNode> jsonNodeListByFilterNoAd = jsonNodeList.stream().filter(jsonNode -> jsonNode.get("adId") == null).toList();
//                    jsonNodeListByFilterNoAd.forEach(jsonNode -> {
//                        final int indexOfJsonNode = jsonNodeListByFilterNoAd.indexOf(jsonNode);
//                        final int pageRank = indexOfJsonNode + 1;
//                        final int rank = pageRank + (indexOfPage * size);
//                        final ObjectNode objectNodeOfRankInfo = (ObjectNode) jsonNode.get("rankInfo");
//                        objectNodeOfRankInfo.put("rank", rank);
//                        objectNodeOfRankInfo.put("pageRank", pageRank);
//                    });
//                    previousProductCountWithAd.set(previousProductCountWithAd.get() + jsonNodeList.size());
//                    jsonNodeListForReturn.addAll(jsonNodeList);
//                });
//                return jsonNodeListForReturn;
//            }).get();
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
//    }

    private List<JsonNode> getJsonNodeListOfNstoreRankRealtime(String keyword, String proxyServerApiKey) {
        try {
            return new ForkJoinPool(10).submit(() -> {
                final List<Integer> pageList = List.of(1, 2, 3);
                final ConcurrentHashMap<Integer, List<JsonNode>> concurrentHashMap = new ConcurrentHashMap<>();
                final AtomicInteger totalCountAtomic = new AtomicInteger(0);
                final int size = 100;
                NomadproxyWirelessEntity nomadproxyWirelessEntity = nomadproxyWirelessRepository.getWirelessEntityByApiKey(proxyServerApiKey);
                WebClient webClient = UtilFunction.getWebClientAutoRedirectWithProxy(proxyServerIp, nomadproxyWirelessEntity.getData().getPort());
                pageList.parallelStream().forEach(page -> {
                    final UriComponents uriComponents = UriComponentsBuilder
                            .fromHttpUrl("https://search.shopping.naver.com/api/search/all")
                            .queryParam("query", keyword)
                            .queryParam("pagingIndex", page)
                            .queryParam("pagingSize", size)
                            .queryParam("productSet", "total")
                            .queryParam("sort", "rel")
                            .queryParam("viewType", "list")
                            .build();
                    ResponseEntity<String> responseEntity = webClient
                            .get()
                            .uri(uriComponents.toUriString())
                            .header("Content-Type", "application/json")
                            .header("Accept", "application/json, text/plain, */*")
                            .header("Referer", "https://search.shopping.naver.com/search/all")
                            .header("Sbth", UtilFunction.getSbth())
                            .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
                            .block();
                    if (responseEntity.getStatusCode() != HttpStatus.OK) {
                        throw new BadRequestException(
                                "json을 가져오지 못했습니다. "
                                        + String.valueOf(responseEntity.getBody())
                                        .replaceAll("\n", "")
                                        .replaceAll("\t", "")
                                        .replaceAll(" ", "")
                        );
                    }
//                    final Document document = Jsoup.parse(responseEntity.getBody());
//                    final String nextData = Objects.requireNonNull(document.getElementById("__NEXT_DATA__")).data();
                    final List<JsonNode> jsonNodeListForProducts = new ArrayList<>();
                    final JsonNode jsonNodeOfResponse;
                    try {
                        jsonNodeOfResponse = objectMapper.readTree(responseEntity.getBody());
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                    if (page == 1) {
                        totalCountAtomic.set(jsonNodeOfResponse.get("shoppingResult").get("total").asInt());
                    }
                    final JsonNode jsonNodeOfProducts = jsonNodeOfResponse.get("shoppingResult").get("products");
                    jsonNodeOfProducts.forEach(jsonNode -> {
                        ((ObjectNode) jsonNode).putObject("rankInfo").put("pageUrl", uriComponents.toUriString());
                        ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNode).putObject("trackInfo");
                        objectNodeOfTrackInfo.put("mid", jsonNode.get("id").asText());
                        if (jsonNode.get("mallProductId") == null || jsonNode.get("mallProductId").isNull()) {
                            objectNodeOfTrackInfo.putNull("productId");
                        } else {
                            objectNodeOfTrackInfo.put("productId", jsonNode.get("mallProductId").asText());
                        }
                        objectNodeOfTrackInfo.put("productName", jsonNode.get("productTitle").asText());
                        objectNodeOfTrackInfo.put("productImageUrl", jsonNode.get("imageUrl").asText());
                        StringBuilder category = new StringBuilder();
                        for (int i = 1; i < 5; i++) {
                            JsonNode categoryNameNode = jsonNode.get("category" + (i) + "Name");
                            if (categoryNameNode == null || categoryNameNode.isNull()) {
                                break;
                            }
                            category.append(categoryNameNode.asText());
                            JsonNode nextCategoryNameNode = jsonNode.get("category" + (i + 1) + "Name");
                            if (nextCategoryNameNode != null && !nextCategoryNameNode.isNull() && !nextCategoryNameNode.asText().isBlank()) {
                                category.append(">");
                            }
                        }
                        objectNodeOfTrackInfo.put("category", category.toString());
                        objectNodeOfTrackInfo.put("price", jsonNode.get("price").asText());
                        if (jsonNode.get("mallName") == null || jsonNode.get("mallName").isNull()) {
                            objectNodeOfTrackInfo.putNull("mallName");
                        } else {
                            objectNodeOfTrackInfo.put("mallName", jsonNode.get("mallName").asText());
                        }
                        objectNodeOfTrackInfo.put("reviewCount", jsonNode.get("reviewCount").asText());
                        if (jsonNode.get("scoreInfo") == null || jsonNode.get("scoreInfo").isNull()) {
                            objectNodeOfTrackInfo.put("scoreInfo", "-");
                        } else {
                            objectNodeOfTrackInfo.put("scoreInfo", jsonNode.get("scoreInfo").asText());
                        }
                        jsonNodeListForProducts.add(jsonNode);
                    });
                    concurrentHashMap.put(page, jsonNodeListForProducts);
                });
                final List<JsonNode> jsonNodeListForReturn = new ArrayList<>();
//                AtomicInteger previousProductCountWithAd = new AtomicInteger(0);
                pageList.forEach(page -> {
                    final int indexOfPage = pageList.indexOf(page);
                    List<JsonNode> jsonNodeList = concurrentHashMap.get(page);
                    if (jsonNodeList == null) {
                        return;
                    }
                    jsonNodeList.forEach(jsonNode -> {
                        final boolean isAd = jsonNode.get("adId") != null;
//                        final int indexOfJsonNode = jsonNodeList.indexOf(jsonNode);
//                        final int pageRankWithAd = indexOfJsonNode + 1;
//                        final int rankWithAd = pageRankWithAd + previousProductCountWithAd.get();
                        final ObjectNode objectNodeOfRankInfo = (ObjectNode) jsonNode.get("rankInfo");
                        objectNodeOfRankInfo.put("pageIndex", page);
                        objectNodeOfRankInfo.put("pageRank", -1);
                        objectNodeOfRankInfo.put("pageRankWithAd", -1);
                        objectNodeOfRankInfo.put("rank", -1);
                        objectNodeOfRankInfo.put("rankWithAd", -1);
                        objectNodeOfRankInfo.put("totalCount", totalCountAtomic.get());
                        objectNodeOfRankInfo.put("isAd", isAd);
                    });
                    List<JsonNode> jsonNodeListByFilterNoAd = jsonNodeList.stream().filter(jsonNode -> jsonNode.get("adId") == null).toList();
                    jsonNodeListByFilterNoAd.forEach(jsonNode -> {
                        final int indexOfJsonNode = jsonNodeListByFilterNoAd.indexOf(jsonNode);
                        final int pageRank = indexOfJsonNode + 1;
                        final int rank = pageRank + (indexOfPage * size);
                        final ObjectNode objectNodeOfRankInfo = (ObjectNode) jsonNode.get("rankInfo");
                        objectNodeOfRankInfo.put("rank", rank);
                        objectNodeOfRankInfo.put("pageRank", pageRank);
                    });
//                    previousProductCountWithAd.set(previousProductCountWithAd.get() + jsonNodeList.size());
                    jsonNodeListForReturn.addAll(jsonNodeList);
                });
                return jsonNodeListForReturn;
            }).get();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private UserEntity getUserEntityByApiKey(String apiKey) {
        Optional<UserEntity> userEntityOptional = userRepository.findByApiKeyAndDeleteDateIsNull(apiKey);
        if (userEntityOptional.isEmpty()) {
            throw new AuthenticationException("존재하지 않는 apiKey입니다.");
        }
        return userEntityOptional.get();
    }

}
