package kr.co.nomadlab.scrap.schedule.nstore.rank.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.model.db.constraint.AmpmType;
import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankSearchProductEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankSearchProductInfoEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.nstore.rank.repository.NstoreRankSearchProductInfoRepository;
import kr.co.nomadlab.scrap.model.db.nstore.rank.repository.NstoreRankTrackInfoRepository;
import kr.co.nomadlab.scrap.model.db.nstore.rank.repository.NstoreRankTrackRepository;
import kr.co.nomadlab.scrap.model.db.user.entity.UserNstoreRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.user.repository.UserNstoreRankTrackInfoRepository;
import kr.co.nomadlab.scrap.model_external.nomadproxy.entity.NomadproxyWirelessEntity;
import kr.co.nomadlab.scrap.model_external.nomadproxy.repository.NomadproxyWirelessRepository;
import kr.co.nomadlab.scrap.util.UtilFunction;
import kr.co.nomadlab.scrap.util.UtilVariable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NstoreRankScheduleService {

    @Nullable
    @Value("${proxy-server.ip}")
    private final String proxyServerIp;

    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    private final NomadproxyWirelessRepository nomadproxyWirelessRepository;
    private final NstoreRankSearchProductInfoRepository nstoreRankSearchProductInfoRepository;
    private final NstoreRankTrackInfoRepository nstoreRankTrackInfoRepository;
    private final NstoreRankTrackRepository nstoreRankTrackRepository;
    private final UserNstoreRankTrackInfoRepository userNstoreRankTrackInfoRepository;

    @Transactional
    public void deleteAllRealtimeData() {
//        nstoreRankSearchProductInfoRepository.deleteAll();
        jdbcTemplate.execute("DELETE FROM NSTORE_RANK_SEARCH_PRODUCT WHERE 1 = 1");
        jdbcTemplate.execute("DELETE FROM NSTORE_RANK_SEARCH_PRODUCT_INFO WHERE 1 = 1");
    }

    @Transactional
    public void updateNstoreRankTrackInfoEntityForTrack() {
        List<UserNstoreRankTrackInfoEntity> userNstoreRankTrackInfoEntityList = userNstoreRankTrackInfoRepository.findAll();
        Set<Long> nstoreRankTrackInfoIdSet = new HashSet<>();
        userNstoreRankTrackInfoEntityList.forEach(userNstoreRankTrackInfoEntity -> {
            nstoreRankTrackInfoIdSet.add(userNstoreRankTrackInfoEntity.getNstoreRankTrackInfoEntity().getId());
        });
        List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList = nstoreRankTrackInfoRepository.findByIdIn(nstoreRankTrackInfoIdSet);
        nstoreRankTrackInfoEntityList.forEach(nstoreRankTrackInfoEntity -> {
            NstoreRankTrackEntity nstoreRankTrackEntityForSave;
            if (nstoreRankTrackInfoEntity.getNstoreRankTrackEntityList().isEmpty()) {
                nstoreRankTrackEntityForSave = NstoreRankTrackEntity.builder()
                        .nstoreRankTrackInfoEntity(nstoreRankTrackInfoEntity)
                        .rank(-1)
                        .prevRank(-1)
                        .rankWithAd(-1)
                        .prevRankWithAd(-1)
                        .price("")
                        .reviewCount("")
                        .scoreInfo("")
                        .ampm(LocalTime.now().isBefore(LocalTime.NOON) ? AmpmType.AM : AmpmType.PM)
                        .isValid(false)
                        .chartDate(LocalDateTime.now())
                        .createDate(LocalDateTime.now())
                        .build();
            } else {
                List<NstoreRankTrackEntity> nstoreRankTrackEntityListForFilter = nstoreRankTrackInfoEntity.getNstoreRankTrackEntityList()
                        .stream()
                        .filter(NstoreRankTrackEntity::getIsValid)
                        .toList();
                NstoreRankTrackEntity nstoreRankTrackEntityByFilterLast = nstoreRankTrackEntityListForFilter.get(nstoreRankTrackEntityListForFilter.size() - 1);
                nstoreRankTrackEntityForSave = NstoreRankTrackEntity.builder()
                        .nstoreRankTrackInfoEntity(nstoreRankTrackInfoEntity)
                        .rank(-1)
                        .prevRank(nstoreRankTrackEntityByFilterLast.getRank())
                        .rankWithAd(-1)
                        .prevRankWithAd(nstoreRankTrackEntityByFilterLast.getRankWithAd())
                        .price(nstoreRankTrackEntityByFilterLast.getPrice())
                        .reviewCount(nstoreRankTrackEntityByFilterLast.getReviewCount())
                        .scoreInfo(nstoreRankTrackEntityByFilterLast.getScoreInfo())
                        .ampm(LocalTime.now().isBefore(LocalTime.NOON) ? AmpmType.AM : AmpmType.PM)
                        .isValid(false)
                        .chartDate(LocalDateTime.now())
                        .createDate(LocalDateTime.now())
                        .build();
            }
            NstoreRankTrackEntity nstoreRankTrackEntity = nstoreRankTrackRepository.save(nstoreRankTrackEntityForSave);
            nstoreRankTrackInfoEntity.setTodayNstoreRankTrackId(nstoreRankTrackEntity.getId());
            nstoreRankTrackInfoEntity.setTrackStatus(TrackStatusType.WAIT);
            nstoreRankTrackInfoEntity.setUpdateDate(LocalDateTime.now());
        });
    }

    public Long countNeedToTrack() {
        return nstoreRankTrackInfoRepository.countByTrackStatus(TrackStatusType.WAIT);
    }

    public Long countNeedToTrackAgain() {
        List<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityList = nstoreRankTrackInfoRepository.findByTrackStatus(TrackStatusType.WAIT_AGAIN);
        return nstoreRankTrackInfoEntityList
                .stream()
                .filter(thisNstoreRankTrackInfoEntity -> LocalDateTime.now().isAfter(thisNstoreRankTrackInfoEntity.getUpdateDate().plusHours(1)))
                .count();
    }

    @Transactional
    public void track(TrackStatusType trackStatusType) {
        Optional<NstoreRankTrackInfoEntity> nstoreRankTrackInfoEntityOptional = nstoreRankTrackInfoRepository.findFirstByTrackStatus(trackStatusType);
        if (nstoreRankTrackInfoEntityOptional.isEmpty()) {
            return;
        }
        NstoreRankTrackInfoEntity nstoreRankTrackInfoEntity = nstoreRankTrackInfoEntityOptional.get();
        if (TrackStatusType.WAIT_AGAIN.equals(trackStatusType)) {
            nstoreRankSearchProductInfoRepository.deleteByKeyword(nstoreRankTrackInfoEntity.getKeyword());
        }
        List<JsonNode> jsonNodeList;
        String proxyServerApiKey = null;
        try {
            proxyServerApiKey = UtilVariable.proxyServerApiKeyQueue.take();
            jsonNodeList = saveNstoreRankSearchProductEntityListAndGetJsonNodeList(nstoreRankTrackInfoEntity.getKeyword(), proxyServerApiKey);
        } catch (InterruptedException e) {
            throw new RuntimeException("key를 가져오는 도중 중단되었습니다.");
        } finally {
            if (proxyServerApiKey != null) {
                nomadproxyWirelessRepository.releaseWirelessEntityByApiKey(proxyServerApiKey);
                UtilVariable.proxyServerApiKeyQueue.add(proxyServerApiKey);
            }
        }
        List<JsonNode> jsonNodeListByFilterMid = jsonNodeList
                .stream()
                .filter(jsonNode -> jsonNode.get("id").asText().contains(nstoreRankTrackInfoEntity.getMid()))
                .toList();
        Optional<NstoreRankTrackEntity> nstoreRankTrackEntityOptional = nstoreRankTrackRepository.findById(nstoreRankTrackInfoEntity.getTodayNstoreRankTrackId());
        if (nstoreRankTrackEntityOptional.isEmpty()) {
            // 없을 수 없음. 텔레그램 등으로 에러 알림 처리 해야함. 또는 백업 처리
            log.error("nstoreRankTrackEntityOptional.isEmpty()");
            return;
        }
        NstoreRankTrackEntity nstoreRankTrackEntity = nstoreRankTrackEntityOptional.get();
        if (jsonNodeListByFilterMid.isEmpty()) {
            nstoreRankTrackEntity.setRank(-1);
            nstoreRankTrackEntity.setRankWithAd(-1);
            if (nstoreRankTrackInfoEntity.getJson() != null && !nstoreRankTrackInfoEntity.getJson().isNull()) {
                if (nstoreRankTrackEntity.getPrevRank() != -1 && TrackStatusType.WAIT_AGAIN.equals(trackStatusType)) {
                    JsonNode json = nstoreRankTrackInfoEntity.getJson().deepCopy();
                    ObjectNode objectNodeOfRankInfo = (ObjectNode) json.get("rankInfo");
                    objectNodeOfRankInfo.put("rank", -1);
                    objectNodeOfRankInfo.put("rankWithAd", -1);
                    nstoreRankTrackInfoEntity.setJson(json);
                } else {
                    // 아무 것도 안함
                }
            } else {
                ObjectNode json = objectMapper.createObjectNode();
                ObjectNode objectNodeOfRankInfo = json.putObject("rankInfo");
                objectNodeOfRankInfo.put("rank", -1);
                objectNodeOfRankInfo.put("rankWithAd", -1);
                nstoreRankTrackInfoEntity.setJson(json);
            }
        } else {
            nstoreRankTrackEntity.setRank(jsonNodeListByFilterMid.get(0).get("rankInfo").get("rank").asInt());
            nstoreRankTrackEntity.setRankWithAd(jsonNodeListByFilterMid.get(0).get("rankInfo").get("rankWithAd").asInt());
            nstoreRankTrackEntity.setPrice(jsonNodeListByFilterMid.get(0).get("price").asText());
            nstoreRankTrackEntity.setReviewCount(jsonNodeListByFilterMid.get(0).get("reviewCount").asText());
            nstoreRankTrackEntity.setScoreInfo(jsonNodeListByFilterMid.get(0).get("scoreInfo").asText());
            nstoreRankTrackInfoEntity.setJson(jsonNodeListByFilterMid.get(0));
        }
        nstoreRankTrackEntity.setIsValid(true);
        nstoreRankTrackEntity.setChartDate(LocalDateTime.now());
        nstoreRankTrackEntity.setUpdateDate(LocalDateTime.now());
        nstoreRankTrackInfoEntity.setTrackStatus(TrackStatusType.COMPLETE);
        nstoreRankTrackInfoEntity.setUpdateDate(LocalDateTime.now());
        if (nstoreRankTrackEntity.getPrevRank() == -1) {
            if (nstoreRankTrackEntity.getRank() == -1) {
                nstoreRankTrackInfoEntity.setRankChange(0);
            } else {
                nstoreRankTrackInfoEntity.setRankChange(nstoreRankTrackEntity.getRank() - 301);
            }
        } else {
            if (nstoreRankTrackEntity.getRank() == -1) {
                if (TrackStatusType.WAIT.equals(trackStatusType)) {
                    nstoreRankTrackEntity.setIsValid(false);
                    nstoreRankTrackInfoEntity.setTrackStatus(TrackStatusType.WAIT_AGAIN);
                } else if (TrackStatusType.WAIT_AGAIN.equals(trackStatusType)) {
                    nstoreRankTrackInfoEntity.setRankChange(301 - nstoreRankTrackEntity.getPrevRank());
                }
            } else {
                nstoreRankTrackInfoEntity.setRankChange(nstoreRankTrackEntity.getRank() - nstoreRankTrackEntity.getPrevRank());
            }
        }
        if (nstoreRankTrackEntity.getPrevRankWithAd() == -1) {
            if (nstoreRankTrackEntity.getRankWithAd() == -1) {
                nstoreRankTrackInfoEntity.setRankWithAdChange(0);
            } else {
                nstoreRankTrackInfoEntity.setRankWithAdChange(nstoreRankTrackEntity.getRankWithAd() - 301);
            }
        } else {
            if (nstoreRankTrackEntity.getRankWithAd() == -1) {
                nstoreRankTrackInfoEntity.setRankWithAdChange(301 - nstoreRankTrackEntity.getPrevRankWithAd());
            } else {
                nstoreRankTrackInfoEntity.setRankWithAdChange(nstoreRankTrackEntity.getRank() - nstoreRankTrackEntity.getPrevRankWithAd());
            }
        }
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
