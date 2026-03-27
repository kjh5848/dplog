package kr.co.nomadlab.scrap.domain.nstore.mission.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import kr.co.nomadlab.scrap.common.dto.ResDTO;
import kr.co.nomadlab.scrap.common.exception.AuthenticationException;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.domain.nstore.mission.constraint.NstoreMissionProductDibsFilterType;
import kr.co.nomadlab.scrap.domain.nstore.mission.dto.response.ResNstoreMissionGetMallFeedDTOApiV1;
import kr.co.nomadlab.scrap.domain.nstore.mission.dto.response.ResNstoreMissionGetProductDibsDTOApiV1;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankSearchProductEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankSearchProductInfoEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.repository.NstoreRankSearchProductInfoRepository;
import kr.co.nomadlab.scrap.model.db.user.entity.UserEntity;
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
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NstoreMissionServiceApiV1 {

    @Nullable
    @Value("${proxy-server.ip}")
    private final String proxyServerIp;

    @Nullable
    @Value("${scrap-mall-vpn}")
    private final String scrapMallVpn;

    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final NomadproxyWirelessRepository nomadproxyWirelessRepository;
    private final NstoreRankSearchProductInfoRepository nstoreRankSearchProductInfoRepository;

    public HttpEntity<?> getMallFeed(String apiKey, String url) {
        getUserEntityByApiKey(apiKey);
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl(url + "/profile")
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
                || titleText.contains("성인인증이")
                || titleText.contains("존재하지")
                || titleText.contains("중지")
                || titleText.contains("에러")
        ) {
            throw new BadRequestException("url을 확인해주세요.");
        }
        JsonNode jsonNode = null;
        for (Element element : document.select("script")) {
            if (element.data().contains("window.__PRELOADED_STATE__")) {
                String json = element.data().split("window.__PRELOADED_STATE__=")[1];
                try {
                    jsonNode = objectMapper.readTree(json);
                    break;
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            }
        }
        if (jsonNode == null) {
            throw new BadRequestException("json을 가져오지 못했습니다.");
        }
        final ObjectNode objectNode = new ObjectNode(objectMapper.getNodeFactory());
        objectNode.put("mallName", jsonNode.get("smartStoreV2").get("channel").get("channelName").asText());
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreMissionGetMallFeedDTOApiV1.of(objectNode))
                        .build(),
                HttpStatus.OK
        );

    }

    @Transactional
    public HttpEntity<?> getProductDibs(String apiKey, String keyword, String filterValue, NstoreMissionProductDibsFilterType filterType) {
        getUserEntityByApiKey(apiKey);
        if (NstoreMissionProductDibsFilterType.URL.equals(filterType)) {
            final UriComponents uriComponents = UriComponentsBuilder
                    .fromHttpUrl(filterValue)
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
                    final String[] elementStrBySplit = element.data().split(",\"relationProducts\"");
                    final String preData = elementStrBySplit[0];
                    final String lastData = elementStrBySplit[1].split("\"scrollKept\":(false|true)")[1];
                    String json = (preData + lastData).split("window.__PRELOADED_STATE__=")[1];
                    try {
                        final JsonNode jsonNodeForAdd = objectMapper.readTree(json).get("product").get("A");
                        final ObjectNode objectNode = new ObjectNode(objectMapper.getNodeFactory());
                        objectNode.put("mid", jsonNodeForAdd.get("epInfo").get("syncNvMid").asText());
                        objectNode.put("productId", jsonNodeForAdd.get("id").asText());
                        objectNode.put("productName", jsonNodeForAdd.get("name").asText());
                        objectNode.put("productImageUrl", jsonNodeForAdd.get("representImage").get("url").asText());
                        objectNode.put("price", jsonNodeForAdd.get("discountedSalePrice").asText());
                        objectNode.put("mallName", jsonNodeForAdd.get("channel").get("channelName").asText());
                        jsonNode = objectNode;
                        break;
                    } catch (JsonProcessingException e) {
                        e.printStackTrace();
                    }
                }
            }
            if (jsonNode == null) {
                throw new BadRequestException("json을 가져오지 못했습니다.");
            }
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNstoreMissionGetProductDibsDTOApiV1.of(jsonNode))
                            .build(),
                    HttpStatus.OK
            );
        } else {
            String refineKeyword = UtilFunction.refineKeyword(keyword);
            List<JsonNode> jsonNodeList;
            String proxyServerApiKey = null;
            try {
                proxyServerApiKey = UtilVariable.proxyServerApiKeyQueue.take();
                jsonNodeList = saveNstoreRankSearchProductEntityListAndGetJsonNodeList(refineKeyword, proxyServerApiKey);
            } catch (InterruptedException e) {
                throw new BadRequestException("key를 가져오는 도중 중단되었습니다.");
            } finally {
                if (proxyServerApiKey != null) {
                    nomadproxyWirelessRepository.releaseWirelessEntityByApiKey(proxyServerApiKey);
                    UtilVariable.proxyServerApiKeyQueue.add(proxyServerApiKey);
                }
            }
            List<JsonNode> jsonNodeListByFilter = filterJsonNodeListByMid(filterValue, true, false, jsonNodeList);
            if (jsonNodeListByFilter.isEmpty()) {
                throw new BadRequestException("해당 mid의 상품이 존재하지 않습니다.");
            }
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("success")
                            .data(ResNstoreMissionGetProductDibsDTOApiV1.of(jsonNodeListByFilter.get(0).get("trackInfo")))
                            .build(),
                    HttpStatus.OK
            );
        }
    }

    private UserEntity getUserEntityByApiKey(String apiKey) {
        Optional<UserEntity> userEntityOptional = userRepository.findByApiKeyAndDeleteDateIsNull(apiKey);
        if (userEntityOptional.isEmpty()) {
            throw new AuthenticationException("존재하지 않는 apiKey입니다.");
        }
        return userEntityOptional.get();
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
                    .filter(jsonNode -> jsonNode.get("id").asText().contains(mid)) // 랭킹과 다르게 parentId를 필터링 할 필요 없음
                    .toList();
        }
        return jsonNodeListForReturn;
    }

    private List<JsonNode> saveNstoreRankSearchProductEntityListAndGetJsonNodeList(String keyword, String proxyServerApiKey) {
        List<JsonNode> jsonNodeList;
        Optional<NstoreRankSearchProductInfoEntity> scrapInfoEntityOptional = nstoreRankSearchProductInfoRepository.findByKeyword(keyword);
        if (scrapInfoEntityOptional.isPresent()) {
            jsonNodeList = scrapInfoEntityOptional.get().getNstoreRankSearchProductEntityList()
                    .stream()
                    .map(NstoreRankSearchProductEntity::getJson)
                    .toList();
        } else {
            jsonNodeList = getJsonNodeListOfNstoreRankRealtime(keyword, proxyServerApiKey);
            NstoreRankSearchProductInfoEntity nstoreRankSearchProductInfoEntityForSave = NstoreRankSearchProductInfoEntity.builder()
                    .keyword(keyword)
                    .createDate(LocalDateTime.now())
                    .build();
            NstoreRankSearchProductInfoEntity nstoreRankSearchProductInfoEntity = nstoreRankSearchProductInfoRepository.save(nstoreRankSearchProductInfoEntityForSave);
            List<NstoreRankSearchProductEntity> nstoreRankSearchProductEntityListForSave = jsonNodeList
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
        return jsonNodeList;
    }

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

}
