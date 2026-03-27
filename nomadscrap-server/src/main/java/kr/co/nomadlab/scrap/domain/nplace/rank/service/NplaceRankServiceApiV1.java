package kr.co.nomadlab.scrap.domain.nplace.rank.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.nomadlab.scrap.common.constants.Constants;
import kr.co.nomadlab.scrap.common.dto.ResDTO;
import kr.co.nomadlab.scrap.common.exception.AuthenticationException;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.domain.nplace.rank.constraint.NplaceRankRealtimeFilterType;
import kr.co.nomadlab.scrap.domain.nplace.rank.dto.request.ReqNplaceRankPostTrackChartDTOApiV1;
import kr.co.nomadlab.scrap.domain.nplace.rank.dto.request.ReqNplaceRankPostTrackInfoDTOApiV1;
import kr.co.nomadlab.scrap.domain.nplace.rank.dto.response.*;
import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.nplace.rank.repository.NplaceRankSearchShopInfoRepository;
import kr.co.nomadlab.scrap.model.db.nplace.rank.repository.NplaceRankTrackInfoRepository;
import kr.co.nomadlab.scrap.model.db.user.entity.UserEntity;
import kr.co.nomadlab.scrap.model.db.user.entity.UserNplaceRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.user.repository.UserNplaceRankTrackInfoRepository;
import kr.co.nomadlab.scrap.model.db.user.repository.UserRepository;
import kr.co.nomadlab.scrap.model_external.nomadproxy.repository.NomadproxyWirelessRepository;
import kr.co.nomadlab.scrap.util.ServiceHelper;
import kr.co.nomadlab.scrap.util.UtilFunction;
import kr.co.nomadlab.scrap.util.UtilVariable;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NplaceRankServiceApiV1 {

    @Nullable
    @Value("${proxy-server.ip}")
    private final String proxyServerIp;

    @Nullable
    @Value("${scrap-mall-vpn}")
    private String scrapMallVpn;

    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final NomadproxyWirelessRepository nomadproxyWirelessRepository;
    private final NplaceRankSearchShopInfoRepository nplaceRankSearchShopInfoRepository;
    private final NplaceRankTrackInfoRepository nplaceRankTrackInfoRepository;
    private final UserNplaceRankTrackInfoRepository userNplaceRankTrackInfoRepository;
    private final ServiceHelper serviceHelper;

    @Transactional
    public HttpEntity<?> getRealtime(String apiKey, String keyword, String province, String filterValue, NplaceRankRealtimeFilterType filterType) {
        getUserEntityByApiKey(apiKey);
        List<JsonNode> jsonNodeList;
        JsonNode jsonNodeOfNplaceRankShop = null;
        if (NplaceRankRealtimeFilterType.SHOP_ID.equals(filterType)
                && filterValue != null
                && !filterValue.isBlank()
        ) {
            jsonNodeOfNplaceRankShop = serviceHelper.getJsonNodeOfNplaceRankTrackableByShopId(UtilFunction.refineNplaceShopId(filterValue));
        }
        String proxyServerApiKey = null;
        try {
            proxyServerApiKey = UtilVariable.proxyServerApiKeyQueue.take();
            jsonNodeList = serviceHelper.saveNplaceRankSearchShopEntityListAndGetJsonNodeList(
                    keyword,
                    province,
                    NplaceRankRealtimeFilterType.SHOP_ID.equals(filterType)
                            ? jsonNodeOfNplaceRankShop.get("businessSector").asText()
                            : null,
                    proxyServerApiKey
            );
        } catch (InterruptedException e) {
            throw new BadRequestException("key를 가져오는 도중 중단되었습니다.");
        } finally {
            if (proxyServerApiKey != null) {
                nomadproxyWirelessRepository.releaseWirelessEntityByApiKey(proxyServerApiKey);
                UtilVariable.proxyServerApiKeyQueue.add(proxyServerApiKey);
            }
        }
        List<JsonNode> jsonNodeListForReturn;
        if (filterValue == null || filterValue.isBlank()) {
            jsonNodeListForReturn = jsonNodeList;
        } else if (NplaceRankRealtimeFilterType.COMPANY_NAME.equals(filterType)) {
            jsonNodeListForReturn = filterJsonNodeListByCompanyName(filterValue, jsonNodeList);
        } else if (NplaceRankRealtimeFilterType.SHOP_ID.equals(filterType)) {
            jsonNodeListForReturn = filterJsonNodeListByShopId(filterValue, jsonNodeList);
        } else {
            throw new BadRequestException("잘못된 filterType입니다.");
        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRankGetRealtimeDTOApiV1.of(jsonNodeListForReturn))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getTrackable(String apiKey, String url) {
        getUserEntityByApiKey(apiKey);
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
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRankGetTrackableDTOApiV1.of(serviceHelper.getJsonNodeOfNplaceRankTrackableByShopId(shopId)))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> postTrack(String apiKey, String keyword, String province, String businessSector, String shopId) {
        UserEntity userEntity = getUserEntityByApiKey(apiKey);
        NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity = saveAndGetNplaceRankTrackInfoEntity(keyword, province, businessSector, shopId, userEntity);
        if (nplaceRankTrackInfoEntity.getServiceStatus() != null
                && nplaceRankTrackInfoEntity.getServiceStatus() == -1
        ) {
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(Constants.ResCode.ENTITY_ALREADY_EXIST_EXCEPTION)
                            .message("이미 추적 중인 샵입니다.")
                            .data(ResNplaceRankPostTrackDTOApiV1.of(nplaceRankTrackInfoEntity))
                            .build(),
                    HttpStatus.BAD_REQUEST
            );
        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRankPostTrackDTOApiV1.of(nplaceRankTrackInfoEntity))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getTrackState(String apiKey) {
        UserEntity userEntity = getUserEntityByApiKey(apiKey);
        List<UserNplaceRankTrackInfoEntity> userNplaceRankTrackInfoEntityList = userNplaceRankTrackInfoRepository.findByUserEntity(userEntity);
        List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList = userNplaceRankTrackInfoEntityList
                .stream()
                .map(thisUserNplaceRankTrackInfoEntity -> thisUserNplaceRankTrackInfoEntity.getNplaceRankTrackInfoEntity())
                .toList();
//        long countOfNotCompletedTrack = nplaceRankTrackInfoEntityList.stream()
//                .filter(thisNplaceRankTrackInfoEntity -> !thisNplaceRankTrackInfoEntity.getTrackStatus().equals(TrackStatusType.COMPLETE))
//                .count();
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRankGetTrackStateDTOApiV1.of(nplaceRankTrackInfoEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getTrackInfo(String apiKey) {
        UserEntity userEntity = getUserEntityByApiKey(apiKey);
        List<UserNplaceRankTrackInfoEntity> userNplaceRankTrackInfoEntityList = userNplaceRankTrackInfoRepository.findByUserEntity(userEntity);
        List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList = userNplaceRankTrackInfoEntityList
                .stream()
                .map(UserNplaceRankTrackInfoEntity::getNplaceRankTrackInfoEntity)
                .toList();
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRankGetTrackInfoDTOApiV1.of(nplaceRankTrackInfoEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> postTrackInfo(String apiKey, ReqNplaceRankPostTrackInfoDTOApiV1 reqDto) {
        getUserEntityByApiKey(apiKey);
//        UserEntity userEntity = getUserEntityByApiKey(apiKey);
//        List<UserNplaceRankTrackInfoEntity> userNplaceRankTrackInfoEntityList = userNplaceRankTrackInfoRepository.findByUserEntityAndNplaceRankTrackInfoEntity_IdIn(userEntity, reqDto.getNplaceRankTrackInfoIdList());
//        if (userNplaceRankTrackInfoEntityList.size() != reqDto.getNplaceRankTrackInfoIdList().size()) {
//            throw new BadRequestException("요청 추적 수와 결과 추적 수가 일치하지 않습니다.");
//        }
//        List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList = userNplaceRankTrackInfoEntityList
//                .stream()
//                .map(UserNplaceRankTrackInfoEntity::getNplaceRankTrackInfoEntity)
//                .toList();
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRankPostTrackInfoDTOApiV1.of(nplaceRankTrackInfoRepository.findByIdIn(reqDto.getNplaceRankTrackInfoIdList())))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> postTrackChart(String apiKey, ReqNplaceRankPostTrackChartDTOApiV1 reqDto) {
        getUserEntityByApiKey(apiKey);
//        UserEntity userEntity = getUserEntityByApiKey(apiKey);
//        List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList = new ArrayList<>();
//        reqDto.getNplaceRankTrackInfoList().forEach(nplaceTrackInfo -> {
//            Optional<UserNplaceRankTrackInfoEntity> userNplaceRankTrackInfoEntityOptional = userNplaceRankTrackInfoRepository.findByUserEntityAndNplaceRankTrackInfoEntity_Id(userEntity, nplaceTrackInfo.getId());
//            if (userNplaceRankTrackInfoEntityOptional.isEmpty()) {
//                throw new BadRequestException("존재하지 않는 추적 차트입니다. (%d)".formatted(nplaceTrackInfo.getId()));
//            }
//            NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity = userNplaceRankTrackInfoEntityOptional.get().getNplaceRankTrackInfoEntity();
//            nplaceRankTrackInfoEntity.setTrackStartDate(nplaceTrackInfo.getTrackStartDate());
//            nplaceRankTrackInfoEntityList.add(nplaceRankTrackInfoEntity);
//        });
        List<Long> nplaceRankTrackInfoIdList = new ArrayList<>();
        reqDto.getNplaceRankTrackInfoList().forEach(thisNplaceTrackInfo ->
                nplaceRankTrackInfoIdList.add(thisNplaceTrackInfo.getId())
        );
        List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList = nplaceRankTrackInfoRepository.findByIdIn(nplaceRankTrackInfoIdList);
        nplaceRankTrackInfoEntityList.forEach(thisNplaceRankTrackInfoEntity -> {
            thisNplaceRankTrackInfoEntity.setTrackStartDate(
                    reqDto.getNplaceRankTrackInfoList()
                            .stream()
                            .filter(thisNplaceTrackInfo -> thisNplaceTrackInfo.getId().equals(thisNplaceRankTrackInfoEntity.getId()))
                            .findFirst()
                            .get()
                            .getTrackStartDate()
            );
        });
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRankPostTrackChartDTOApiV1.of(nplaceRankTrackInfoEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> deleteTrack(String apiKey, Long nplaceRankTrackInfoId) {
        UserEntity userEntity = getUserEntityByApiKey(apiKey);
        Optional<UserNplaceRankTrackInfoEntity> userNplaceRankTrackInfoEntityOptional = userNplaceRankTrackInfoRepository.findByUserEntityAndNplaceRankTrackInfoEntity_Id(userEntity, nplaceRankTrackInfoId);
        if (userNplaceRankTrackInfoEntityOptional.isEmpty()) {
            throw new BadRequestException("존재하지 않는 추적 정보입니다.");
        }
        userNplaceRankTrackInfoRepository.delete(userNplaceRankTrackInfoEntityOptional.get());
        if (userNplaceRankTrackInfoRepository.countByNplaceRankTrackInfoEntity_Id(nplaceRankTrackInfoId) == 0) {
            nplaceRankTrackInfoRepository.findById(nplaceRankTrackInfoId).ifPresent(thisNplaceRankTrackInfoEntity -> thisNplaceRankTrackInfoEntity.setJson(null));
        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    private NplaceRankTrackInfoEntity saveAndGetNplaceRankTrackInfoEntity(
            String keyword,
            String province,
            String businessSector,
            String shopId,
            UserEntity userEntity) {
        Optional<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityOptional = nplaceRankTrackInfoRepository.findByKeywordAndProvinceAndShopId(keyword, province, shopId);
        NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity;
        if (nplaceRankTrackInfoEntityOptional.isEmpty()) {
            NplaceRankTrackInfoEntity nplaceRankTrackInfoEntityForSave = NplaceRankTrackInfoEntity.builder()
                    .keyword(keyword)
                    .province(province)
                    .businessSector(businessSector)
                    .shopId(shopId)
                    .rankChange(0)
                    .json(null)
                    .trackStatus(TrackStatusType.COMPLETE)
                    .createDate(LocalDateTime.now())
                    .nplaceRankTrackEntityList(new ArrayList<>())
                    .build();
            nplaceRankTrackInfoEntity = nplaceRankTrackInfoRepository.save(nplaceRankTrackInfoEntityForSave);
        } else {
            nplaceRankTrackInfoEntity = nplaceRankTrackInfoEntityOptional.get();
        }
        Optional<UserNplaceRankTrackInfoEntity> userNplaceRankTrackInfoEntityOptional = userNplaceRankTrackInfoRepository.findByUserEntityAndNplaceRankTrackInfoEntity(userEntity, nplaceRankTrackInfoEntity);
        if (userNplaceRankTrackInfoEntityOptional.isPresent()) {
            userNplaceRankTrackInfoEntityOptional.get().getNplaceRankTrackInfoEntity().setServiceStatus(-1);
            return userNplaceRankTrackInfoEntityOptional.get().getNplaceRankTrackInfoEntity();
        }
        userNplaceRankTrackInfoRepository.save(UserNplaceRankTrackInfoEntity.builder()
                .userEntity(userEntity)
                .nplaceRankTrackInfoEntity(nplaceRankTrackInfoEntity)
                .createDate(LocalDateTime.now())
                .build());
//        List<NplaceRankTrackEntity> nplaceRankTrackEntityList = nplaceRankTrackInfoEntity.getNplaceRankTrackEntityList();
//        if (nplaceRankTrackEntityList.isEmpty()) {
//            List<JsonNode> jsonNodeList;
//            String proxyServerApiKey = null;
//            try {
//                proxyServerApiKey = UtilVariable.proxyServerApiKeyQueue.take();
//                jsonNodeList = saveNplaceRankSearchShopEntityListAndGetJsonNodeList(keyword, province, proxyServerApiKey);
//            } catch (InterruptedException e) {
//                throw new RuntimeException("key를 가져오는 도중 중단되었습니다.");
//            } finally {
//                if (proxyServerApiKey != null) {
//                    nomadproxyWirelessRepository.releaseWirelessEntityByApiKey(proxyServerApiKey);
//                    UtilVariable.proxyServerApiKeyQueue.add(proxyServerApiKey);
//                }
//            }
//            List<JsonNode> jsonNodeListByFilterShopId = jsonNodeList
//                    .stream()
//                    .filter(jsonNode -> jsonNode.get("id").asText().contains(shopId))
//                    .toList();
//            NplaceRankTrackEntity nplaceRankTrackEntityForSave;
//            if (jsonNodeListByFilterShopId.isEmpty()) {
//                JsonNode jsonNodeOfNplaceRankShop = getJsonNodeOfNplaceRankTrackableByShopId(shopId);
//                nplaceRankTrackEntityForSave = NplaceRankTrackEntity.builder()
//                        .nplaceRankTrackInfoEntity(nplaceRankTrackInfoEntity)
//                        .rank(-1)
//                        .prevRank(-1)
//                        .visitorReviewCount(jsonNodeOfNplaceRankShop.get("visitorReviewCount").asText())
//                        .blogReviewCount(jsonNodeOfNplaceRankShop.get("blogReviewCount").asText())
//                        .scoreInfo(jsonNodeOfNplaceRankShop.get("scoreInfo").asText())
//                        .isValid(true)
//                        .ampm(LocalTime.now().isBefore(LocalTime.NOON) ? AmpmType.AM : AmpmType.PM)
////                        .chartDate(UtilFunction.getNplaceChartDate(LocalDateTime.now()))
//                        .chartDate(LocalDateTime.now())
//                        .createDate(LocalDateTime.now())
//                        .build();
//                ObjectNode json = new ObjectNode(JsonNodeFactory.instance);
//                ObjectNode rankInfo = json.putObject("rankInfo");
//                rankInfo.put("rank", -1);
//                rankInfo.put("totalCount", -1);
//                json.putIfAbsent("trackInfo", jsonNodeOfNplaceRankShop);
//                nplaceRankTrackInfoEntity.setJson(json);
////                return RankNstoreSearchProductTrackInfoEntity.builder().serviceStatus(-2).build();
////                throw new BadRequestException("검색된 상품 정보가 없습니다.");
//            } else {
//                nplaceRankTrackEntityForSave = NplaceRankTrackEntity.builder()
//                        .nplaceRankTrackInfoEntity(nplaceRankTrackInfoEntity)
//                        .rank(jsonNodeListByFilterShopId.get(0).get("rankInfo").get("rank").asInt())
//                        .prevRank(-1)
//                        .visitorReviewCount(jsonNodeListByFilterShopId.get(0).get("trackInfo").get("visitorReviewCount").asText())
//                        .blogReviewCount(jsonNodeListByFilterShopId.get(0).get("trackInfo").get("blogReviewCount").asText())
//                        .scoreInfo(jsonNodeListByFilterShopId.get(0).get("trackInfo").get("scoreInfo").asText())
//                        .isValid(true)
//                        .ampm(LocalTime.now().isBefore(LocalTime.NOON) ? AmpmType.AM : AmpmType.PM)
////                        .chartDate(UtilFunction.getNplaceChartDate(LocalDateTime.now()))
//                        .chartDate(LocalDateTime.now())
//                        .createDate(LocalDateTime.now())
//                        .build();
//                nplaceRankTrackInfoEntity.setJson(jsonNodeListByFilterShopId.get(0));
//            }
//            NplaceRankTrackEntity nplaceRankTrackEntity = nplaceRankTrackRepository.save(nplaceRankTrackEntityForSave);
//            nplaceRankTrackInfoEntity.setTodayNplaceRankTrackId(nplaceRankTrackEntity.getId());
//            nplaceRankTrackInfoEntity.setUpdateDate(LocalDateTime.now());
//            nplaceRankTrackInfoEntity.getNplaceRankTrackEntityList().add(nplaceRankTrackEntity);
//            nplaceRankTrackInfoEntity.setServiceStatus(0);
//        }
        return nplaceRankTrackInfoEntity;
    }

//    private JsonNode getJsonNodeOfNplaceRankTrackableByShopId(String shopId) {
//        final UriComponents uriComponents = UriComponentsBuilder
//                .fromHttpUrl("https://m.place.naver.com/place/%s".formatted(shopId))
//                .build();
//        AtomicReference<String> lastRequestUrlAtomic = new AtomicReference<>("https://m.place.naver.com/place/");
//        ResponseEntity<String> responseEntity = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888, lastRequestUrlAtomic)
//                .get()
//                .uri(uriComponents.toUriString())
//                .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
//                .block();
//        if (responseEntity.getStatusCode() != HttpStatus.OK) {
//            if (responseEntity.getBody() != null) {
//                if (responseEntity.getBody().contains("운영되고 있지 않")
//                        || responseEntity.getBody().contains("판매자의 사정에")
//                        || responseEntity.getBody().contains("페이지를 찾을 수")
//                        || responseEntity.getBody().contains("상품이 존재하지")
//                        || responseEntity.getBody().contains("성인인증이")
//                        || responseEntity.getBody().contains("존재하지")
//                        || responseEntity.getBody().contains("판매중지")
//                        || responseEntity.getBody().contains("중지")
//                        || responseEntity.getBody().contains("에러")
//                ) {
//                    throw new BadRequestException("url을 확인해주세요.");
//                }
//            }
//            throw new BadRequestException(
//                    "html을 가져오지 못했습니다. "
//                            + responseEntity.getBody()
//                            .replaceAll("\n", "")
//                            .replaceAll("\t", "")
//                            .replaceAll(" ", "")
//            );
//        }
//        final String businessSector = lastRequestUrlAtomic.get().split("https://m.place.naver.com/")[1].split("/")[0];
//        final Document document = Jsoup.parse(responseEntity.getBody());
//        long errorCount = document.select("div")
//                .stream()
//                .filter(element -> element.text().contains("요청하신 페이지를 찾을 수 없습니다"))
//                .count();
//        if (errorCount > 0) {
//            throw new BadRequestException("존재하지 않는 shopId입니다.");
//        }
//        String shopImageUrl;
//        Map<String, String> metaImageContent = UtilFunction.parseQueryString(document.selectFirst("meta[id='og:image']").attr("content"));
//        if (metaImageContent.isEmpty() || metaImageContent.get("src") == null) {
//            shopImageUrl = "https://blog.kakaocdn.net/dn/9f2bW/btqFqMBK1Z0/IwomidqUtEOLksTIuXH6IK/img.png";
//        } else {
//            shopImageUrl = URLDecoder.decode(metaImageContent.get("src"), StandardCharsets.UTF_8);
//        }
//        String blogReviewCount = "0";
//        String[] reviewDescArray = document.selectFirst("meta[id='og:description']").attr("content").split("블로그리뷰 ");
//        if (reviewDescArray.length > 1) {
//            blogReviewCount = reviewDescArray[1];
//        }
//        JsonNode jsonNode = null;
//        for (Element element : document.select("script")) {
//            if (element.data().contains("window.__APOLLO_STATE__ =")) {
//                String[] elementStrBySplit = element.data().split("window.__PLACE_STATE__ =");
//                String json = elementStrBySplit[0].split("window.__APOLLO_STATE__ =")[1];
//                try {
//                    JsonNode jsonOfApollo = objectMapper.readTree(json);
//                    JsonNode jsonNodeForAdd = jsonOfApollo.get("PlaceDetailBase:%s".formatted(shopId));
//                    ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNodeForAdd).putObject("trackInfo");
//                    objectNodeOfTrackInfo.put("shopId", jsonNodeForAdd.get("id").asText());
//                    objectNodeOfTrackInfo.put("shopName", jsonNodeForAdd.get("name").asText());
//                    objectNodeOfTrackInfo.put("shopImageUrl", shopImageUrl);
//                    objectNodeOfTrackInfo.put("category", jsonNodeForAdd.get("category").asText());
//                    objectNodeOfTrackInfo.put("address", jsonNodeForAdd.get("address").asText());
//                    objectNodeOfTrackInfo.put("roadAddress", jsonNodeForAdd.get("roadAddress").asText());
//                    objectNodeOfTrackInfo.put("visitorReviewCount", jsonNodeForAdd.get("visitorReviewsTotal").asText());
//                    objectNodeOfTrackInfo.put("blogReviewCount", blogReviewCount);
//                    if (jsonNodeForAdd.get("visitorReviewsScore") == null || jsonNodeForAdd.get("visitorReviewsScore").isNull()) {
//                        objectNodeOfTrackInfo.put("scoreInfo", "-");
//                    } else {
//                        objectNodeOfTrackInfo.put("scoreInfo", jsonNodeForAdd.get("visitorReviewsScore").asText());
//                    }
//                    objectNodeOfTrackInfo.put("businessSector", businessSector);
//                    String placeDetailFieldName = null;
//                    String informationTabFieldName = null;
//                    for (Iterator<String> it = jsonOfApollo.get("ROOT_QUERY").fieldNames(); it.hasNext(); ) {
//                        String fieldName = it.next();
//                        if (fieldName.contains("placeDetail")) {
//                            placeDetailFieldName = fieldName;
//                            break;
//                        }
//                    }
//                    for (Iterator<String> it = jsonOfApollo.get("ROOT_QUERY").get(placeDetailFieldName).fieldNames(); it.hasNext(); ) {
//                        String fieldName = it.next();
//                        if (fieldName.contains("informationTab")) {
//                            informationTabFieldName = fieldName;
//                            break;
//                        }
//                    }
//                    if (placeDetailFieldName != null || informationTabFieldName != null) {
//                        objectNodeOfTrackInfo.putPOJO(
//                                "keywordList",
//                                jsonOfApollo
//                                        .get("ROOT_QUERY")
//                                        .get(placeDetailFieldName)
//                                        .get(informationTabFieldName)
//                                        .get("keywordList")
//                        );
//                    } else {
//                        objectNodeOfTrackInfo.putArray("keywordList");
//                    }
//                    jsonNode = jsonNodeForAdd.get("trackInfo");
//                    break;
//                } catch (JsonProcessingException e) {
//                    e.printStackTrace();
//                }
//            }
//        }
//        return jsonNode;
//    }

    private static List<JsonNode> filterJsonNodeListByCompanyName(String companyName, List<JsonNode> jsonNodeList) {
        List<JsonNode> jsonNodeListForReturn = new ArrayList<>(jsonNodeList);
        if (!companyName.isBlank()) {
            jsonNodeListForReturn = jsonNodeListForReturn
                    .stream()
                    .filter(jsonNode -> UtilFunction.refineFilterValue(jsonNode.get("trackInfo").get("shopName").asText()).contains(companyName))
                    .toList();
        }
        return jsonNodeListForReturn;
    }

    private static List<JsonNode> filterJsonNodeListByShopId(String shopId, List<JsonNode> jsonNodeList) {
        List<JsonNode> jsonNodeListForReturn = new ArrayList<>(jsonNodeList);
        if (!shopId.isBlank()) {
            jsonNodeListForReturn = jsonNodeListForReturn
                    .stream()
                    .filter(jsonNode -> jsonNode.get("trackInfo").get("shopId").asText().contains(shopId))
                    .toList();
        }
        return jsonNodeListForReturn;
    }

//    private List<JsonNode> saveNplaceRankSearchShopEntityListAndGetJsonNodeList(
//            String keyword,
//            String province,
//            String proxyServerApiKey
//    ) {
//        List<JsonNode> jsonNodeListForReturn;
//        Optional<NplaceRankSearchShopInfoEntity> nplaceRankSearchShopInfoEntityOptional = nplaceRankSearchShopInfoRepository.findByKeywordAndProvince(keyword, province);
//        if (nplaceRankSearchShopInfoEntityOptional.isPresent()) {
//            jsonNodeListForReturn = nplaceRankSearchShopInfoEntityOptional.get().getNplaceRankSearchShopEntityList()
//                    .stream()
//                    .map(NplaceRankSearchShopEntity::getJson)
//                    .toList();
//        } else {
//            jsonNodeListForReturn = ServiceHelper.getJsonNodeListOfNplaceRankRealtime(
//                    nomadproxyWirelessRepository,
//                    proxyServerIp,
//                    objectMapper,
//                    keyword,
//                    province,
//                    proxyServerApiKey
//            );
//            NplaceRankSearchShopInfoEntity nplaceRankSearchShopInfoEntityForSave = NplaceRankSearchShopInfoEntity.builder()
//                    .province(province)
//                    .keyword(keyword)
//                    .createDate(LocalDateTime.now())
//                    .build();
//            NplaceRankSearchShopInfoEntity nplaceRankSearchShopInfoEntity = nplaceRankSearchShopInfoRepository.save(nplaceRankSearchShopInfoEntityForSave);
//            List<NplaceRankSearchShopEntity> nplaceRankSearchShopEntityListForSave = jsonNodeListForReturn
//                    .stream()
//                    .map(jsonNode -> {
//                        try {
//                            return NplaceRankSearchShopEntity.builder()
//                                    .nplaceRankSearchShopInfoEntity(nplaceRankSearchShopInfoEntity)
//                                    .json(jsonNode)
//                                    .createDate(LocalDateTime.now())
//                                    .build();
//                        } catch (Exception e) {
//                            e.printStackTrace();
//                            throw new BadRequestException("데이터 파싱 도중 문제가 발생했습니다.");
//                        }
//                    })
//                    .toList();
//            final String sql = "INSERT INTO NPLACE_RANK_SEARCH_SHOP (nplace_rank_search_shop_info_id, json, create_date) VALUES (?, ?, ?)";
//            jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
//                @Override
//                public void setValues(PreparedStatement ps, int i) throws SQLException {
//                    ps.setLong(1, nplaceRankSearchShopEntityListForSave.get(i).getNplaceRankSearchShopInfoEntity().getId());
//                    try {
//                        ps.setString(2, objectMapper.writeValueAsString(nplaceRankSearchShopEntityListForSave.get(i).getJson()));
//                    } catch (JsonProcessingException e) {
//                        e.printStackTrace();
//                        throw new BadRequestException("데이터 파싱 도중 문제가 발생했습니다.");
//                    }
//                    ps.setTimestamp(3, Timestamp.valueOf(nplaceRankSearchShopEntityListForSave.get(i).getCreateDate()));
//                }
//
//                @Override
//                public int getBatchSize() {
//                    return nplaceRankSearchShopEntityListForSave.size();
//                }
//            });
//        }
//        return jsonNodeListForReturn;
//    }

//    private List<JsonNode> getJsonNodeListOfNplaceRankRealtime(
//            String keyword,
//            String province,
//            String proxyServerApiKey
//    ) {
//        double[] latLong = UtilFunction.getLatLongByProvince(province);
//        try {
//            return new ForkJoinPool(10).submit(() -> {
//                final List<Integer> pageList = List.of(1, 2, 3);
//                final ConcurrentHashMap<Integer, List<JsonNode>> concurrentHashMap = new ConcurrentHashMap<>();
//                final AtomicInteger totalCountAtomic = new AtomicInteger(0);
//                final int size = 100;
//                final String nplaceToken = UtilFunction.getNplaceToken(keyword);
//                NomadproxyWirelessEntity nomadproxyWirelessEntity = nomadproxyWirelessRepository.getWirelessEntityByApiKey(proxyServerApiKey);
//                WebClient webClient = UtilFunction.getWebClientAutoRedirectWithProxy(proxyServerIp, nomadproxyWirelessEntity.getData().getPort());
//                pageList.parallelStream().forEach(page -> {
//                    int start = ((page - 1) * size) + 1;
//                    final UriComponents uriComponents = UriComponentsBuilder
//                            .fromHttpUrl("https://pcmap-api.place.naver.com/graphql")
//                            .build();
//                    final Map<String, Object> jsonMap = new HashMap<>();
////                    jsonMap.put("operationName", "getPlacesList");
//                    jsonMap.put("operationName", "getRestaurants");
////                    jsonMap.put("query", "query getPlacesList($input: PlacesInput, $isNmap: Boolean!, $isBounds: Boolean!, $reverseGeocodingInput: ReverseGeocodingInput, $useReverseGeocode: Boolean = false) {\n  businesses: places(input: $input) {\n    total\n    items {\n      id\n      name\n      normalizedName\n      category\n      detailCid {\n        c0\n        c1\n        c2\n        c3\n        __typename\n      }\n      categoryCodeList\n      dbType\n      distance\n      roadAddress\n      address\n      fullAddress\n      commonAddress\n      bookingUrl\n      phone\n      virtualPhone\n      businessHours\n      daysOff\n      imageUrl\n      imageCount\n      x\n      y\n      poiInfo {\n        polyline {\n          shapeKey {\n            id\n            name\n            version\n            __typename\n          }\n          boundary {\n            minX\n            minY\n            maxX\n            maxY\n            __typename\n          }\n          details {\n            totalDistance\n            arrivalAddress\n            departureAddress\n            __typename\n          }\n          __typename\n        }\n        polygon {\n          shapeKey {\n            id\n            name\n            version\n            __typename\n          }\n          boundary {\n            minX\n            minY\n            maxX\n            maxY\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      subwayId\n      markerId @include(if: $isNmap)\n      markerLabel @include(if: $isNmap) {\n        text\n        style\n        stylePreset\n        __typename\n      }\n      imageMarker @include(if: $isNmap) {\n        marker\n        markerSelected\n        __typename\n      }\n      oilPrice @include(if: $isNmap) {\n        gasoline\n        diesel\n        lpg\n        __typename\n      }\n      isPublicGas\n      isDelivery\n      isTableOrder\n      isPreOrder\n      isTakeOut\n      isCvsDelivery\n      hasBooking\n      naverBookingCategory\n      bookingDisplayName\n      bookingBusinessId\n      bookingVisitId\n      bookingPickupId\n      baemin {\n        businessHours {\n          deliveryTime {\n            start\n            end\n            __typename\n          }\n          closeDate {\n            start\n            end\n            __typename\n          }\n          temporaryCloseDate {\n            start\n            end\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      yogiyo {\n        businessHours {\n          actualDeliveryTime {\n            start\n            end\n            __typename\n          }\n          bizHours {\n            start\n            end\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      isPollingStation\n      hasNPay\n      talktalkUrl\n      visitorReviewCount\n      visitorReviewScore\n      blogCafeReviewCount\n      bookingReviewCount\n      streetPanorama {\n        id\n        pan\n        tilt\n        lat\n        lon\n        __typename\n      }\n      naverBookingHubId\n      bookingHubUrl\n      bookingHubButtonName\n      newOpening\n      newBusinessHours {\n        status\n        description\n        dayOff\n        dayOffDescription\n        __typename\n      }\n      coupon {\n        total\n        promotions {\n          promotionSeq\n          couponSeq\n          conditionType\n          image {\n            url\n            __typename\n          }\n          title\n          description\n          type\n          couponUseType\n          __typename\n        }\n        __typename\n      }\n      mid\n      __typename\n    }\n    optionsForMap @include(if: $isBounds) {\n      ...OptionsForMap\n      displayCorrectAnswer\n      correctAnswerPlaceId\n      __typename\n    }\n    searchGuide {\n      queryResults {\n        regions {\n          displayTitle\n          query\n          region {\n            rcode\n            __typename\n          }\n          __typename\n        }\n        isBusinessName\n        __typename\n      }\n      queryIndex\n      types\n      __typename\n    }\n    queryString\n    siteSort\n    __typename\n  }\n  reverseGeocodingAddr(input: $reverseGeocodingInput) @include(if: $useReverseGeocode) {\n    ...ReverseGeocodingAddr\n    __typename\n  }\n}\n\nfragment OptionsForMap on OptionsForMap {\n  maxZoom\n  minZoom\n  includeMyLocation\n  maxIncludePoiCount\n  center\n  spotId\n  keepMapBounds\n  __typename\n}\n\nfragment ReverseGeocodingAddr on ReverseGeocodingResult {\n  rcode\n  region\n  __typename\n}");
//                    jsonMap.put("query", "query getRestaurants($restaurantListInput: RestaurantListInput, $restaurantListFilterInput: RestaurantListFilterInput, $reverseGeocodingInput: ReverseGeocodingInput, $useReverseGeocode: Boolean = false, $isNmap: Boolean = false) {\n  restaurants: restaurantList(input: $restaurantListInput) {\n    items {\n      apolloCacheId\n      coupon {\n        ...CouponItems\n        __typename\n      }\n      ...CommonBusinessItems\n      ...RestaurantBusinessItems\n      __typename\n    }\n    ...RestaurantCommonFields\n    optionsForMap {\n      ...OptionsForMap\n      __typename\n    }\n    nlu {\n      ...NluFields\n      __typename\n    }\n    searchGuide {\n      ...SearchGuide\n      __typename\n    }\n    __typename\n  }\n  filters: restaurantListFilter(input: $restaurantListFilterInput) {\n    ...RestaurantFilter\n    __typename\n  }\n  reverseGeocodingAddr(input: $reverseGeocodingInput) @include(if: $useReverseGeocode) {\n    ...ReverseGeocodingAddr\n    __typename\n  }\n}\n\nfragment OptionsForMap on OptionsForMap {\n  maxZoom\n  minZoom\n  includeMyLocation\n  maxIncludePoiCount\n  center\n  spotId\n  keepMapBounds\n  __typename\n}\n\nfragment NluFields on Nlu {\n  queryType\n  user {\n    gender\n    __typename\n  }\n  queryResult {\n    ptn0\n    ptn1\n    region\n    spot\n    tradeName\n    service\n    selectedRegion {\n      name\n      index\n      x\n      y\n      __typename\n    }\n    selectedRegionIndex\n    otherRegions {\n      name\n      index\n      __typename\n    }\n    property\n    keyword\n    queryType\n    nluQuery\n    businessType\n    cid\n    branch\n    forYou\n    franchise\n    titleKeyword\n    location {\n      x\n      y\n      default\n      longitude\n      latitude\n      dong\n      si\n      __typename\n    }\n    noRegionQuery\n    priority\n    showLocationBarFlag\n    themeId\n    filterBooking\n    repRegion\n    repSpot\n    dbQuery {\n      isDefault\n      name\n      type\n      getType\n      useFilter\n      hasComponents\n      __typename\n    }\n    type\n    category\n    menu\n    context\n    __typename\n  }\n  __typename\n}\n\nfragment SearchGuide on SearchGuide {\n  queryResults {\n    regions {\n      displayTitle\n      query\n      region {\n        rcode\n        __typename\n      }\n      __typename\n    }\n    isBusinessName\n    __typename\n  }\n  queryIndex\n  types\n  __typename\n}\n\nfragment ReverseGeocodingAddr on ReverseGeocodingResult {\n  rcode\n  region\n  __typename\n}\n\nfragment CouponItems on Coupon {\n  total\n  promotions {\n    promotionSeq\n    couponSeq\n    conditionType\n    image {\n      url\n      __typename\n    }\n    title\n    description\n    type\n    couponUseType\n    __typename\n  }\n  __typename\n}\n\nfragment CommonBusinessItems on BusinessSummary {\n  id\n  dbType\n  name\n  businessCategory\n  category\n  description\n  hasBooking\n  hasNPay\n  x\n  y\n  distance\n  imageUrl\n  imageCount\n  phone\n  virtualPhone\n  routeUrl\n  streetPanorama {\n    id\n    pan\n    tilt\n    lat\n    lon\n    __typename\n  }\n  roadAddress\n  address\n  commonAddress\n  blogCafeReviewCount\n  bookingReviewCount\n  totalReviewCount\n  bookingUrl\n  bookingBusinessId\n  talktalkUrl\n  detailCid {\n    c0\n    c1\n    c2\n    c3\n    __typename\n  }\n  options\n  promotionTitle\n  agencyId\n  businessHours\n  newOpening\n  markerId @include(if: $isNmap)\n  markerLabel @include(if: $isNmap) {\n    text\n    style\n    __typename\n  }\n  imageMarker @include(if: $isNmap) {\n    marker\n    markerSelected\n    __typename\n  }\n  __typename\n}\n\nfragment RestaurantFilter on RestaurantListFilterResult {\n  filters {\n    index\n    name\n    displayName\n    value\n    multiSelectable\n    defaultParams {\n      age\n      gender\n      day\n      time\n      __typename\n    }\n    items {\n      index\n      name\n      value\n      selected\n      representative\n      displayName\n      clickCode\n      laimCode\n      type\n      icon\n      __typename\n    }\n    __typename\n  }\n  votingKeywordList {\n    items {\n      name\n      displayName\n      value\n      icon\n      clickCode\n      __typename\n    }\n    menuItems {\n      name\n      value\n      icon\n      clickCode\n      __typename\n    }\n    total\n    __typename\n  }\n  optionKeywordList {\n    items {\n      name\n      displayName\n      value\n      icon\n      clickCode\n      __typename\n    }\n    total\n    __typename\n  }\n  __typename\n}\n\nfragment RestaurantCommonFields on RestaurantListResult {\n  restaurantCategory\n  queryString\n  siteSort\n  selectedFilter {\n    order\n    rank\n    tvProgram\n    region\n    brand\n    menu\n    food\n    mood\n    purpose\n    sortingOrder\n    takeout\n    orderBenefit\n    cafeFood\n    day\n    time\n    age\n    gender\n    myPreference\n    hasMyPreference\n    cafeMenu\n    cafeTheme\n    theme\n    voting\n    filterOpening\n    keywordFilter\n    property\n    realTimeBooking\n    hours\n    __typename\n  }\n  rcodes\n  location {\n    sasX\n    sasY\n    __typename\n  }\n  total\n  __typename\n}\n\nfragment RestaurantBusinessItems on RestaurantListSummary {\n  categoryCodeList\n  visitorReviewCount\n  visitorReviewScore\n  imageUrls\n  bookingHubUrl\n  bookingHubButtonName\n  visitorImages {\n    id\n    reviewId\n    imageUrl\n    profileImageUrl\n    nickname\n    __typename\n  }\n  visitorReviews {\n    id\n    review\n    reviewId\n    __typename\n  }\n  foryouLabel\n  foryouTasteType\n  microReview\n  priceCategory\n  broadcastInfo {\n    program\n    date\n    menu\n    __typename\n  }\n  michelinGuide {\n    year\n    star\n    comment\n    url\n    hasGrade\n    isBib\n    alternateText\n    hasExtraNew\n    region\n    __typename\n  }\n  broadcasts {\n    program\n    menu\n    episode\n    broadcast_date\n    __typename\n  }\n  tvcastId\n  naverBookingCategory\n  saveCount\n  uniqueBroadcasts\n  isDelivery\n  deliveryArea\n  isCvsDelivery\n  isTableOrder\n  isPreOrder\n  isTakeOut\n  bookingDisplayName\n  bookingVisitId\n  bookingPickupId\n  popularMenuImages {\n    name\n    price\n    bookingCount\n    menuUrl\n    menuListUrl\n    imageUrl\n    isPopular\n    usePanoramaImage\n    __typename\n  }\n  newBusinessHours {\n    status\n    description\n    __typename\n  }\n  baemin {\n    businessHours {\n      deliveryTime {\n        start\n        end\n        __typename\n      }\n      closeDate {\n        start\n        end\n        __typename\n      }\n      temporaryCloseDate {\n        start\n        end\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  yogiyo {\n    businessHours {\n      actualDeliveryTime {\n        start\n        end\n        __typename\n      }\n      bizHours {\n        start\n        end\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  realTimeBookingInfo {\n    description\n    hasMultipleBookingItems\n    bookingBusinessId\n    bookingUrl\n    itemId\n    itemName\n    timeSlots {\n      date\n      time\n      timeRaw\n      available\n      __typename\n    }\n    __typename\n  }\n  __typename\n}");
//                    jsonMap.put("variables", Map.of(
//                            "useReverseGeocode", true,
//                            "isNmap", false,
//                            "isBounds", false,
////                            "input", Map.of(
////                                    "query", keyword,
////                                    "start", start,
////                                    "display", size,
////                                    "x", String.valueOf(latLong[1]),
////                                    "y", String.valueOf(latLong[0]),
//////                                    "bounds", "129.1111525169227;35.16712921740793;129.11462865980633;35.17881076448309",
////                                    "queryRank", "",
////                                    "spq", false,
////                                    "adult", false,
////                                    "deviceType", "pcmap"
////                            ),
//                            "restaurantListInput", Map.of(
//                                    "query", keyword,
//                                    "start", start,
//                                    "display", size,
//                                    "x", String.valueOf(latLong[1]),
//                                    "y", String.valueOf(latLong[0]),
////                                    "bounds", "129.1111525169227;35.16712921740793;129.11462865980633;35.17881076448309",
//                                    "deviceType", "pcmap",
//                                    "isPcmap", true
//                            ),
//                            "restaurantListFilterInput", Map.of(
//                                    "query", keyword,
//                                    "start", start,
//                                    "display", size,
//                                    "x", String.valueOf(latLong[1]),
//                                    "y", String.valueOf(latLong[0]),
////                                    "bounds", "129.1111525169227;35.16712921740793;129.11462865980633;35.17881076448309",
//                                    "deviceType", "pcmap"
//                            ),
//                            "reverseGeocodingInput", Map.of(
//                                    "x", String.valueOf(latLong[1]),
//                                    "y", String.valueOf(latLong[0])
//                            )
//                    ));
//                    final List<Map<String, Object>> jsonMapList = new ArrayList<>();
//                    jsonMapList.add(jsonMap);
//                    ResponseEntity<String> responseEntity = webClient
//                            .post()
//                            .uri(uriComponents.toUriString())
//                            .header("Origin", "https://pcmap.place.naver.com")
//                            .header("Content-Type", "application/json")
//                            .header("Accept", "application/json, text/plain, */*")
//                            .header("X-Wtm-Graphql", nplaceToken)
//                            .bodyValue(jsonMapList)
//                            .exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))
//                            .block();
//                    if (responseEntity.getStatusCode() != HttpStatus.OK) {
//                        if (responseEntity.getBody() != null) {
//                            if (responseEntity.getBody().contains("운영되고 있지 않")
//                                    || responseEntity.getBody().contains("판매자의 사정에")
//                                    || responseEntity.getBody().contains("페이지를 찾을 수")
//                                    || responseEntity.getBody().contains("상품이 존재하지")
//                                    || responseEntity.getBody().contains("성인인증이")
//                                    || responseEntity.getBody().contains("존재하지")
//                                    || responseEntity.getBody().contains("판매중지")
//                                    || responseEntity.getBody().contains("중지")
//                                    || responseEntity.getBody().contains("에러")
//                            ) {
//                                throw new BadRequestException("url을 확인해주세요.");
//                            }
//                        }
//                        throw new BadRequestException(
//                                "html을 가져오지 못했습니다. "
//                                        + responseEntity.getBody()
//                                        .replaceAll("\n", "")
//                                        .replaceAll("\t", "")
//                                        .replaceAll(" ", "")
//                        );
//                    }
//                    final List<JsonNode> jsonNodeListForItems = new ArrayList<>();
//                    final JsonNode jsonNodeOfItems;
//                    try {
//                        jsonNodeOfItems = objectMapper.readTree(responseEntity.getBody())
//                                .get(0)
//                                .get("data")
////                                .get("businesses");
//                                .get("restaurants");
//                    } catch (JsonProcessingException e) {
//                        throw new RuntimeException(e);
//                    }
//                    if (page == 1) {
//                        totalCountAtomic.set(jsonNodeOfItems.get("total").asInt());
//                    }
//                    jsonNodeOfItems.get("items").forEach(jsonNode -> {
//                        ((ObjectNode) jsonNode).putObject("rankInfo");
//                        ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNode).putObject("trackInfo");
//                        String imageUrl;
//                        if (jsonNode.get("imageUrl") == null || jsonNode.get("imageUrl").isNull() || jsonNode.get("imageUrl").asText().isBlank()) {
//                            imageUrl = "https://blog.kakaocdn.net/dn/9f2bW/btqFqMBK1Z0/IwomidqUtEOLksTIuXH6IK/img.png";
//                        } else {
//                            imageUrl = jsonNode.get("imageUrl").asText();
//                        }
//                        objectNodeOfTrackInfo.put("shopId", jsonNode.get("id").asText());
//                        objectNodeOfTrackInfo.put("shopName", jsonNode.get("name").asText());
//                        objectNodeOfTrackInfo.put("shopImageUrl", imageUrl);
//                        objectNodeOfTrackInfo.put("category", jsonNode.get("category").asText());
//                        objectNodeOfTrackInfo.put("address", jsonNode.get("address").asText());
//                        objectNodeOfTrackInfo.put("roadAddress", jsonNode.get("roadAddress").asText());
//                        objectNodeOfTrackInfo.put("visitorReviewCount", jsonNode.get("visitorReviewCount").asText());
//                        objectNodeOfTrackInfo.put("blogReviewCount", jsonNode.get("blogCafeReviewCount").asText());
//                        if (jsonNode.get("visitorReviewScore") == null || jsonNode.get("visitorReviewScore").isNull()) {
//                            objectNodeOfTrackInfo.put("scoreInfo", "-");
//                        } else {
//                            objectNodeOfTrackInfo.put("scoreInfo", jsonNode.get("visitorReviewScore").asText());
//                        }
//                        if (jsonNode.get("saveCount") == null || jsonNode.get("saveCount").isNull()) {
//                            objectNodeOfTrackInfo.put("saveCount", "-");
//                        } else {
//                            objectNodeOfTrackInfo.put("saveCount", jsonNode.get("saveCount").asText());
//                        }
//                        jsonNodeListForItems.add(jsonNode);
//                    });
//                    concurrentHashMap.put(page, jsonNodeListForItems);
//                });
//                final List<JsonNode> jsonNodeListForReturn = new ArrayList<>();
//                pageList.forEach(page -> {
//                    final int indexOfPage = pageList.indexOf(page);
//                    List<JsonNode> jsonNodeList = concurrentHashMap.get(page);
//                    if (jsonNodeList == null) {
//                        return;
//                    }
//                    jsonNodeList.forEach(jsonNode -> {
//                        final int indexOfJsonNode = jsonNodeList.indexOf(jsonNode);
//                        final int rank = (indexOfPage * size) + (indexOfJsonNode + 1);
//                        final ObjectNode objectNodeOfRankInfo = (ObjectNode) jsonNode.get("rankInfo");
//                        objectNodeOfRankInfo.put("rank", rank);
//                        objectNodeOfRankInfo.put("totalCount", totalCountAtomic.get());
//                    });
//                    jsonNodeListForReturn.addAll(jsonNodeList);
//                });
//                return jsonNodeListForReturn;
//            }).get();
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
//    }

    private UserEntity getUserEntityByApiKey(String apiKey) {
        Optional<UserEntity> userEntityOptional = userRepository.findByApiKeyAndDeleteDateIsNull(apiKey);
        if (userEntityOptional.isEmpty()) {
            throw new AuthenticationException("존재하지 않는 apiKey입니다.");
        }
        return userEntityOptional.get();
    }
}
