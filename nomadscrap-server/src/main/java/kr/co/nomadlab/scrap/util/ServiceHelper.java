package kr.co.nomadlab.scrap.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankSearchShopEntity;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankSearchShopInfoEntity;
import kr.co.nomadlab.scrap.model.db.nplace.rank.repository.NplaceRankSearchShopInfoRepository;
import kr.co.nomadlab.scrap.model_external.nomadproxy.entity.NomadproxyWirelessEntity;
import kr.co.nomadlab.scrap.model_external.nomadproxy.repository.NomadproxyWirelessRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

@Component
@RequiredArgsConstructor
public class ServiceHelper {

    @Nullable
    @Value("${proxy-server.ip}")
    private final String proxyServerIp;

    @Nullable
    @Value("${scrap-mall-vpn}")
    private String scrapMallVpn;

    @PersistenceContext
    private final EntityManager entityManager;

    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    private final NplaceRankSearchShopInfoRepository nplaceRankSearchShopInfoRepository;
    private final NomadproxyWirelessRepository nomadproxyWirelessRepository;

    public JsonNode getJsonNodeOfNplaceRankTrackableByShopId(String shopId) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("https://m.place.naver.com/place/%s".formatted(shopId))
                .build();
        AtomicReference<String> lastRequestUrlAtomic = new AtomicReference<>("https://m.place.naver.com/place/");
        ResponseEntity<String> responseEntity = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888, lastRequestUrlAtomic)
                .get()
                .uri(uriComponents.toUriString())
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
        final String businessSector = lastRequestUrlAtomic.get().split("https://m.place.naver.com/")[1].split("/")[0];
        final Document document = Jsoup.parse(responseEntity.getBody());
        long errorCount = document.select("div")
                .stream()
                .filter(element -> element.text().contains("요청하신 페이지를 찾을 수 없습니다"))
                .count();
        if (errorCount > 0) {
            throw new BadRequestException("존재하지 않는 shopId입니다.");
        }
        String shopImageUrl;
        Map<String, String> metaImageContent = UtilFunction.parseQueryString(document.selectFirst("meta[id='og:image']").attr("content"));
        if (metaImageContent.isEmpty() || metaImageContent.get("src") == null) {
            shopImageUrl = "https://blog.kakaocdn.net/dn/9f2bW/btqFqMBK1Z0/IwomidqUtEOLksTIuXH6IK/img.png";
        } else {
            shopImageUrl = URLDecoder.decode(metaImageContent.get("src"), StandardCharsets.UTF_8);
        }
        String blogReviewCount = "0";
        String[] reviewDescArray = document.selectFirst("meta[id='og:description']").attr("content").split("블로그리뷰 ");
        if (reviewDescArray.length > 1) {
            blogReviewCount = reviewDescArray[1];
        }
        JsonNode jsonNode = null;
        for (Element element : document.select("script")) {
            if (element.data().contains("window.__APOLLO_STATE__ =")) {
                String[] elementStrBySplit = element.data().split("window.__PLACE_STATE__ =");
                String json = elementStrBySplit[0].split("window.__APOLLO_STATE__ =")[1];
                try {
                    JsonNode jsonOfApollo = objectMapper.readTree(json);
                    JsonNode jsonNodeForAdd = jsonOfApollo.get("PlaceDetailBase:%s".formatted(shopId));
                    ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNodeForAdd).putObject("trackInfo");
                    objectNodeOfTrackInfo.put("shopId", jsonNodeForAdd.get("id").asText());
                    objectNodeOfTrackInfo.put("shopName", jsonNodeForAdd.get("name").asText());
                    objectNodeOfTrackInfo.put("shopImageUrl", shopImageUrl);
                    objectNodeOfTrackInfo.put("category", jsonNodeForAdd.get("category").asText());
                    objectNodeOfTrackInfo.put("address", jsonNodeForAdd.get("address").asText());
                    objectNodeOfTrackInfo.put("roadAddress", jsonNodeForAdd.get("roadAddress").asText());
                    objectNodeOfTrackInfo.put("visitorReviewCount", jsonNodeForAdd.get("visitorReviewsTotal").asText());
                    objectNodeOfTrackInfo.put("blogReviewCount", blogReviewCount);
                    if (jsonNodeForAdd.get("visitorReviewsScore") == null || jsonNodeForAdd.get("visitorReviewsScore").isNull()) {
                        objectNodeOfTrackInfo.put("scoreInfo", "-");
                    } else {
                        objectNodeOfTrackInfo.put("scoreInfo", jsonNodeForAdd.get("visitorReviewsScore").asText());
                    }
                    objectNodeOfTrackInfo.put("businessSector", businessSector);
                    String placeDetailFieldName = null;
                    String informationTabFieldName = null;
                    for (Iterator<String> it = jsonOfApollo.get("ROOT_QUERY").fieldNames(); it.hasNext(); ) {
                        String fieldName = it.next();
                        if (fieldName.contains("placeDetail")) {
                            placeDetailFieldName = fieldName;
                            break;
                        }
                    }
                    for (Iterator<String> it = jsonOfApollo.get("ROOT_QUERY").get(placeDetailFieldName).fieldNames(); it.hasNext(); ) {
                        String fieldName = it.next();
                        if (fieldName.contains("informationTab")) {
                            informationTabFieldName = fieldName;
                            break;
                        }
                    }
                    if (placeDetailFieldName != null || informationTabFieldName != null) {
                        objectNodeOfTrackInfo.putPOJO(
                                "keywordList",
                                jsonOfApollo
                                        .get("ROOT_QUERY")
                                        .get(placeDetailFieldName)
                                        .get(informationTabFieldName)
                                        .get("keywordList")
                        );
                    } else {
                        objectNodeOfTrackInfo.putArray("keywordList");
                    }
                    jsonNode = jsonNodeForAdd.get("trackInfo");
                    break;
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            }
        }
        return jsonNode;
    }

    public List<JsonNode> saveNplaceRankSearchShopEntityListAndGetJsonNodeList(
            String keyword,
            String province,
            String businessSector,
            String proxyServerApiKey
    ) {
        List<JsonNode> jsonNodeListForReturn;
        Optional<NplaceRankSearchShopInfoEntity> nplaceRankSearchShopInfoEntityOptional = nplaceRankSearchShopInfoRepository.findByKeywordAndProvince(keyword, province);
        if (nplaceRankSearchShopInfoEntityOptional.isPresent()) {
            NplaceRankSearchShopInfoEntity nplaceRankSearchShopInfoEntity = nplaceRankSearchShopInfoEntityOptional.get();
            if (nplaceRankSearchShopInfoEntity.getBusinessSector() != null || businessSector == null) {
                return nplaceRankSearchShopInfoEntity.getNplaceRankSearchShopEntityList()
                        .stream()
                        .map(NplaceRankSearchShopEntity::getJson)
                        .toList();
            } else {
                nplaceRankSearchShopInfoRepository.deleteByKeywordAndProvince(keyword, province);
                entityManager.flush();
            }
        }
        jsonNodeListForReturn = getJsonNodeListOfNplaceRankRealtime(
                keyword,
                province,
                businessSector,
                proxyServerApiKey
        );
        NplaceRankSearchShopInfoEntity nplaceRankSearchShopInfoEntityForSave = NplaceRankSearchShopInfoEntity.builder()
                .province(province)
                .keyword(keyword)
                .businessSector(businessSector)
                .createDate(LocalDateTime.now())
                .build();
        NplaceRankSearchShopInfoEntity nplaceRankSearchShopInfoEntity = nplaceRankSearchShopInfoRepository.save(nplaceRankSearchShopInfoEntityForSave);
        List<NplaceRankSearchShopEntity> nplaceRankSearchShopEntityListForSave = jsonNodeListForReturn
                .stream()
                .map(jsonNode -> {
                    try {
                        return NplaceRankSearchShopEntity.builder()
                                .nplaceRankSearchShopInfoEntity(nplaceRankSearchShopInfoEntity)
                                .json(jsonNode)
                                .createDate(LocalDateTime.now())
                                .build();
                    } catch (Exception e) {
                        e.printStackTrace();
                        throw new BadRequestException("데이터 파싱 도중 문제가 발생했습니다.");
                    }
                })
                .toList();
        final String sql = "INSERT INTO NPLACE_RANK_SEARCH_SHOP (nplace_rank_search_shop_info_id, json, create_date) VALUES (?, ?, ?)";
        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                ps.setLong(1, nplaceRankSearchShopEntityListForSave.get(i).getNplaceRankSearchShopInfoEntity().getId());
                try {
                    ps.setString(2, objectMapper.writeValueAsString(nplaceRankSearchShopEntityListForSave.get(i).getJson()));
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                    throw new BadRequestException("데이터 파싱 도중 문제가 발생했습니다.");
                }
                ps.setTimestamp(3, Timestamp.valueOf(nplaceRankSearchShopEntityListForSave.get(i).getCreateDate()));
            }

            @Override
            public int getBatchSize() {
                return nplaceRankSearchShopEntityListForSave.size();
            }
        });
        return jsonNodeListForReturn;
    }


    public List<JsonNode> getJsonNodeListOfNplaceRankRealtime(
            String keyword,
            String province,
            String businessSector,
            String proxyServerApiKey
    ) {
        double[] latLong = UtilFunction.getLatLongByProvince(province);
        try {
            return new ForkJoinPool(10).submit(() -> {
                final List<Integer> pageList = List.of(1, 2, 3);
                final ConcurrentHashMap<Integer, List<JsonNode>> concurrentHashMap = new ConcurrentHashMap<>();
                final AtomicInteger totalCountAtomic = new AtomicInteger(0);
                final int size = 100;
                final String nplaceToken = UtilFunction.getNplaceToken(keyword);
                NomadproxyWirelessEntity nomadproxyWirelessEntity = nomadproxyWirelessRepository.getWirelessEntityByApiKey(proxyServerApiKey);
                WebClient webClient = UtilFunction.getWebClientAutoRedirectWithProxy(proxyServerIp, nomadproxyWirelessEntity.getData().getPort());
                pageList.parallelStream().forEach(page -> {
                    int start = ((page - 1) * size) + 1;
                    final UriComponents uriComponents = UriComponentsBuilder
                            .fromHttpUrl("https://pcmap-api.place.naver.com/graphql")
                            .build();
                    final Map<String, Object> jsonMap = new HashMap<>();
                    if ("restaurant".equals(businessSector)) {
                        jsonMap.put("operationName", "getRestaurants");
                        jsonMap.put("query", "query getRestaurants($restaurantListInput: RestaurantListInput, $restaurantListFilterInput: RestaurantListFilterInput, $reverseGeocodingInput: ReverseGeocodingInput, $useReverseGeocode: Boolean = false, $isNmap: Boolean = false) {\n  restaurants: restaurantList(input: $restaurantListInput) {\n    items {\n      apolloCacheId\n      coupon {\n        ...CouponItems\n        __typename\n      }\n      ...CommonBusinessItems\n      ...RestaurantBusinessItems\n      __typename\n    }\n    ...RestaurantCommonFields\n    optionsForMap {\n      ...OptionsForMap\n      __typename\n    }\n    nlu {\n      ...NluFields\n      __typename\n    }\n    searchGuide {\n      ...SearchGuide\n      __typename\n    }\n    __typename\n  }\n  filters: restaurantListFilter(input: $restaurantListFilterInput) {\n    ...RestaurantFilter\n    __typename\n  }\n  reverseGeocodingAddr(input: $reverseGeocodingInput) @include(if: $useReverseGeocode) {\n    ...ReverseGeocodingAddr\n    __typename\n  }\n}\n\nfragment OptionsForMap on OptionsForMap {\n  maxZoom\n  minZoom\n  includeMyLocation\n  maxIncludePoiCount\n  center\n  spotId\n  keepMapBounds\n  __typename\n}\n\nfragment NluFields on Nlu {\n  queryType\n  user {\n    gender\n    __typename\n  }\n  queryResult {\n    ptn0\n    ptn1\n    region\n    spot\n    tradeName\n    service\n    selectedRegion {\n      name\n      index\n      x\n      y\n      __typename\n    }\n    selectedRegionIndex\n    otherRegions {\n      name\n      index\n      __typename\n    }\n    property\n    keyword\n    queryType\n    nluQuery\n    businessType\n    cid\n    branch\n    forYou\n    franchise\n    titleKeyword\n    location {\n      x\n      y\n      default\n      longitude\n      latitude\n      dong\n      si\n      __typename\n    }\n    noRegionQuery\n    priority\n    showLocationBarFlag\n    themeId\n    filterBooking\n    repRegion\n    repSpot\n    dbQuery {\n      isDefault\n      name\n      type\n      getType\n      useFilter\n      hasComponents\n      __typename\n    }\n    type\n    category\n    menu\n    context\n    __typename\n  }\n  __typename\n}\n\nfragment SearchGuide on SearchGuide {\n  queryResults {\n    regions {\n      displayTitle\n      query\n      region {\n        rcode\n        __typename\n      }\n      __typename\n    }\n    isBusinessName\n    __typename\n  }\n  queryIndex\n  types\n  __typename\n}\n\nfragment ReverseGeocodingAddr on ReverseGeocodingResult {\n  rcode\n  region\n  __typename\n}\n\nfragment CouponItems on Coupon {\n  total\n  promotions {\n    promotionSeq\n    couponSeq\n    conditionType\n    image {\n      url\n      __typename\n    }\n    title\n    description\n    type\n    couponUseType\n    __typename\n  }\n  __typename\n}\n\nfragment CommonBusinessItems on BusinessSummary {\n  id\n  dbType\n  name\n  businessCategory\n  category\n  description\n  hasBooking\n  hasNPay\n  x\n  y\n  distance\n  imageUrl\n  imageCount\n  phone\n  virtualPhone\n  routeUrl\n  streetPanorama {\n    id\n    pan\n    tilt\n    lat\n    lon\n    __typename\n  }\n  roadAddress\n  address\n  commonAddress\n  blogCafeReviewCount\n  bookingReviewCount\n  totalReviewCount\n  bookingUrl\n  bookingBusinessId\n  talktalkUrl\n  detailCid {\n    c0\n    c1\n    c2\n    c3\n    __typename\n  }\n  options\n  promotionTitle\n  agencyId\n  businessHours\n  newOpening\n  markerId @include(if: $isNmap)\n  markerLabel @include(if: $isNmap) {\n    text\n    style\n    __typename\n  }\n  imageMarker @include(if: $isNmap) {\n    marker\n    markerSelected\n    __typename\n  }\n  __typename\n}\n\nfragment RestaurantFilter on RestaurantListFilterResult {\n  filters {\n    index\n    name\n    displayName\n    value\n    multiSelectable\n    defaultParams {\n      age\n      gender\n      day\n      time\n      __typename\n    }\n    items {\n      index\n      name\n      value\n      selected\n      representative\n      displayName\n      clickCode\n      laimCode\n      type\n      icon\n      __typename\n    }\n    __typename\n  }\n  votingKeywordList {\n    items {\n      name\n      displayName\n      value\n      icon\n      clickCode\n      __typename\n    }\n    menuItems {\n      name\n      value\n      icon\n      clickCode\n      __typename\n    }\n    total\n    __typename\n  }\n  optionKeywordList {\n    items {\n      name\n      displayName\n      value\n      icon\n      clickCode\n      __typename\n    }\n    total\n    __typename\n  }\n  __typename\n}\n\nfragment RestaurantCommonFields on RestaurantListResult {\n  restaurantCategory\n  queryString\n  siteSort\n  selectedFilter {\n    order\n    rank\n    tvProgram\n    region\n    brand\n    menu\n    food\n    mood\n    purpose\n    sortingOrder\n    takeout\n    orderBenefit\n    cafeFood\n    day\n    time\n    age\n    gender\n    myPreference\n    hasMyPreference\n    cafeMenu\n    cafeTheme\n    theme\n    voting\n    filterOpening\n    keywordFilter\n    property\n    realTimeBooking\n    hours\n    __typename\n  }\n  rcodes\n  location {\n    sasX\n    sasY\n    __typename\n  }\n  total\n  __typename\n}\n\nfragment RestaurantBusinessItems on RestaurantListSummary {\n  categoryCodeList\n  visitorReviewCount\n  visitorReviewScore\n  imageUrls\n  bookingHubUrl\n  bookingHubButtonName\n  visitorImages {\n    id\n    reviewId\n    imageUrl\n    profileImageUrl\n    nickname\n    __typename\n  }\n  visitorReviews {\n    id\n    review\n    reviewId\n    __typename\n  }\n  foryouLabel\n  foryouTasteType\n  microReview\n  priceCategory\n  broadcastInfo {\n    program\n    date\n    menu\n    __typename\n  }\n  michelinGuide {\n    year\n    star\n    comment\n    url\n    hasGrade\n    isBib\n    alternateText\n    hasExtraNew\n    region\n    __typename\n  }\n  broadcasts {\n    program\n    menu\n    episode\n    broadcast_date\n    __typename\n  }\n  tvcastId\n  naverBookingCategory\n  saveCount\n  uniqueBroadcasts\n  isDelivery\n  deliveryArea\n  isCvsDelivery\n  isTableOrder\n  isPreOrder\n  isTakeOut\n  bookingDisplayName\n  bookingVisitId\n  bookingPickupId\n  popularMenuImages {\n    name\n    price\n    bookingCount\n    menuUrl\n    menuListUrl\n    imageUrl\n    isPopular\n    usePanoramaImage\n    __typename\n  }\n  newBusinessHours {\n    status\n    description\n    __typename\n  }\n  baemin {\n    businessHours {\n      deliveryTime {\n        start\n        end\n        __typename\n      }\n      closeDate {\n        start\n        end\n        __typename\n      }\n      temporaryCloseDate {\n        start\n        end\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  yogiyo {\n    businessHours {\n      actualDeliveryTime {\n        start\n        end\n        __typename\n      }\n      bizHours {\n        start\n        end\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  realTimeBookingInfo {\n    description\n    hasMultipleBookingItems\n    bookingBusinessId\n    bookingUrl\n    itemId\n    itemName\n    timeSlots {\n      date\n      time\n      timeRaw\n      available\n      __typename\n    }\n    __typename\n  }\n  __typename\n}");
                        jsonMap.put("variables", Map.of(
                                "useReverseGeocode", true,
                                "isNmap", false,
                                "isBounds", false,
                                "restaurantListInput", Map.of(
                                        "query", keyword,
                                        "start", start,
                                        "display", size,
                                        "x", String.valueOf(latLong[1]),
                                        "y", String.valueOf(latLong[0]),
                                        "deviceType", "pcmap",
                                        "isPcmap", true
//                                    "bounds", "129.1111525169227;35.16712921740793;129.11462865980633;35.17881076448309",
                                ),
                                "restaurantListFilterInput", Map.of(
                                        "query", keyword,
                                        "start", start,
                                        "display", size,
                                        "x", String.valueOf(latLong[1]),
                                        "y", String.valueOf(latLong[0]),
                                        "deviceType", "pcmap"
//                                    "bounds", "129.1111525169227;35.16712921740793;129.11462865980633;35.17881076448309",
                                ),
                                "reverseGeocodingInput", Map.of(
                                        "x", String.valueOf(latLong[1]),
                                        "y", String.valueOf(latLong[0])
                                )
                        ));
                    } else if ("hospital".equals(businessSector)) {
                        jsonMap.put("operationName", "getNxList");
                        jsonMap.put("query", "query getNxList($input: HospitalListInput, $reverseGeocodingInput: ReverseGeocodingInput, $isNmap: Boolean = false, $isBounds: Boolean = false, $useReverseGeocode: Boolean = false) {\n  businesses: hospitals(input: $input) {\n    total\n    items {\n      ...HospitalItemFields\n      __typename\n    }\n    nlu {\n      ...HospitalNluFields\n      __typename\n    }\n    searchGuide {\n      queryResults {\n        regions {\n          displayTitle\n          query\n          region {\n            name\n            rcode\n            __typename\n          }\n          __typename\n        }\n        isBusinessName\n        __typename\n      }\n      queryIndex\n      types\n      __typename\n    }\n    optionsForMap @include(if: $isBounds) {\n      ...OptionsForMap\n      __typename\n    }\n    queryString\n    siteSort\n    examinationFilters {\n      name\n      count\n      __typename\n    }\n    isCacheForced\n    __typename\n  }\n  reverseGeocodingAddr(input: $reverseGeocodingInput) @include(if: $useReverseGeocode) {\n    ...ReverseGeocodingAddr\n    __typename\n  }\n}\n\nfragment HospitalItemFields on HospitalSummary {\n  id\n  name\n  hasBooking\n  bookingUrl\n  hasNPay\n  blogCafeReviewCount\n  bookingReviewCount\n  visitorReviewCount\n  visitorReviewScore\n  description\n  commonAddress\n  roadAddress\n  address\n  fullAddress\n  imageCount\n  distance\n  category\n  categoryCodeList\n  imageUrl\n  talktalkUrl\n  promotionTitle\n  businessHours\n  x\n  y\n  businessCategory\n  phone\n  virtualPhone\n  markerId @include(if: $isNmap)\n  markerLabel @include(if: $isNmap) {\n    text\n    style\n    __typename\n  }\n  imageMarker @include(if: $isNmap) {\n    marker\n    markerSelected\n    __typename\n  }\n  detailCid {\n    c0\n    c1\n    c2\n    c3\n    __typename\n  }\n  streetPanorama {\n    id\n    pan\n    tilt\n    lat\n    lon\n    __typename\n  }\n  newBusinessHours {\n    status\n    description\n    __typename\n  }\n  apolloCacheId\n  hiraSpecialists {\n    name\n    count\n    __typename\n  }\n  __typename\n}\n\nfragment OptionsForMap on OptionsForMap {\n  maxZoom\n  minZoom\n  includeMyLocation\n  maxIncludePoiCount\n  center\n  spotId\n  keepMapBounds\n  __typename\n}\n\nfragment HospitalNluFields on Nlu {\n  queryType\n  queryResult {\n    ptn0\n    ptn1\n    region\n    spot\n    tradeName\n    service\n    selectedRegion {\n      name\n      index\n      x\n      y\n      __typename\n    }\n    selectedRegionIndex\n    otherRegions {\n      name\n      index\n      __typename\n    }\n    property\n    keyword\n    queryType\n    location {\n      x\n      y\n      default\n      longitude\n      latitude\n      dong\n      si\n      __typename\n    }\n    noRegionQuery\n    priority\n    showLocationBarFlag\n    themeId\n    filterBooking\n    dbQuery {\n      isDefault\n      name\n      type\n      getType\n      useFilter\n      hasComponents\n      __typename\n    }\n    hospitalQuery\n    department\n    disease\n    repRegion\n    repSpot\n    day\n    __typename\n  }\n  __typename\n}\n\nfragment ReverseGeocodingAddr on ReverseGeocodingResult {\n  rcode\n  region\n  __typename\n}");
                        jsonMap.put("variables", Map.of(
                                "useReverseGeocode", true,
                                "isNmap", false,
                                "isBounds", false,
                                "input", Map.of(
                                        "query", keyword,
                                        "start", start,
                                        "display", size,
                                        "x", String.valueOf(latLong[1]),
                                        "y", String.valueOf(latLong[0]),
                                        "deviceType", "pcmap",
                                        "filterBooking", false,
                                        "filterOpentime", false,
                                        "filterSpecialist", false,
                                        "sortingOrder", "precision"
//                                    "bounds", "129.1111525169227;35.16712921740793;129.11462865980633;35.17881076448309",
                                ),
                                "reverseGeocodingInput", Map.of(
                                        "x", String.valueOf(latLong[1]),
                                        "y", String.valueOf(latLong[0])
                                )
                        ));
                    } else if ("hairshop".equals(businessSector)) {
                        jsonMap.put("operationName", "getBeautyList");
                        jsonMap.put("query", "query getBeautyList($input: BeautyListInput, $businessType: String, $isNmap: Boolean!, $isBounds: Boolean!, $reverseGeocodingInput: ReverseGeocodingInput, $useReverseGeocode: Boolean = false) {\n  businesses: hairshops(input: $input) {\n    total\n    userGender\n    items {\n      ...BeautyBusinessItems\n      imageMarker @include(if: $isNmap) {\n        marker\n        markerSelected\n        __typename\n      }\n      markerId @include(if: $isNmap)\n      markerLabel @include(if: $isNmap) {\n        text\n        style\n        __typename\n      }\n      __typename\n    }\n    nlu {\n      ...NluFields\n      __typename\n    }\n    optionsForMap @include(if: $isBounds) {\n      ...OptionsForMap\n      __typename\n    }\n    __typename\n  }\n  brands: beautyBrands(input: $input, businessType: $businessType) {\n    name\n    cid\n    __typename\n  }\n  reverseGeocodingAddr(input: $reverseGeocodingInput) @include(if: $useReverseGeocode) {\n    ...ReverseGeocodingAddr\n    __typename\n  }\n}\n\nfragment NluFields on Nlu {\n  queryType\n  user {\n    gender\n    __typename\n  }\n  queryResult {\n    ptn0\n    ptn1\n    region\n    spot\n    tradeName\n    service\n    selectedRegion {\n      name\n      index\n      x\n      y\n      __typename\n    }\n    selectedRegionIndex\n    otherRegions {\n      name\n      index\n      __typename\n    }\n    property\n    keyword\n    queryType\n    nluQuery\n    businessType\n    cid\n    branch\n    forYou\n    franchise\n    titleKeyword\n    location {\n      x\n      y\n      default\n      longitude\n      latitude\n      dong\n      si\n      __typename\n    }\n    noRegionQuery\n    priority\n    showLocationBarFlag\n    themeId\n    filterBooking\n    repRegion\n    repSpot\n    dbQuery {\n      isDefault\n      name\n      type\n      getType\n      useFilter\n      hasComponents\n      __typename\n    }\n    type\n    category\n    menu\n    context\n    __typename\n  }\n  __typename\n}\n\nfragment ReverseGeocodingAddr on ReverseGeocodingResult {\n  rcode\n  region\n  __typename\n}\n\nfragment OptionsForMap on OptionsForMap {\n  maxZoom\n  minZoom\n  includeMyLocation\n  maxIncludePoiCount\n  center\n  spotId\n  keepMapBounds\n  __typename\n}\n\nfragment CouponItems on Coupon {\n  total\n  promotions {\n    promotionSeq\n    couponSeq\n    conditionType\n    image {\n      url\n      __typename\n    }\n    title\n    description\n    type\n    couponUseType\n    __typename\n  }\n  __typename\n}\n\nfragment BeautyBusinessItemBase on BeautySummary {\n  id\n  apolloCacheId\n  name\n  hasBooking\n  hasNPay\n  blogCafeReviewCount\n  bookingReviewCount\n  bookingReviewScore\n  description\n  roadAddress\n  address\n  imageUrl\n  talktalkUrl\n  distance\n  x\n  y\n  representativePrice {\n    isFiltered\n    priceName\n    price\n    __typename\n  }\n  promotionTitle\n  stylesCount\n  visitorReviewCount\n  visitorReviewScore\n  styleBookingCounts {\n    styleNum\n    name\n    count\n    isPopular\n    __typename\n  }\n  newOpening\n  coupon {\n    ...CouponItems\n    __typename\n  }\n  __typename\n}\n\nfragment BeautyBusinessItems on BeautySummary {\n  ...BeautyBusinessItemBase\n  styles {\n    desc\n    shortDesc\n    styleNum\n    isPopular\n    images {\n      imageUrl\n      __typename\n    }\n    styleOptions {\n      num\n      __typename\n    }\n    __typename\n  }\n  streetPanorama {\n    id\n    pan\n    tilt\n    lat\n    lon\n    __typename\n  }\n  __typename\n}");
                        jsonMap.put("variables", Map.of(
                                "useReverseGeocode", true,
                                "isNmap", false,
                                "isBounds", false,
                                "businessType", "hairshop",
                                "input", Map.of(
                                        "query", keyword,
                                        "start", start,
                                        "display", size,
                                        "x", String.valueOf(latLong[1]),
                                        "y", String.valueOf(latLong[0]),
                                        "deviceType", "pcmap",
                                        "filterBooking", false,
                                        "filterCoupon", false,
                                        "naverBenefit", false,
                                        "sortingOrder", "precision"
//                                    "bounds", "129.1111525169227;35.16712921740793;129.11462865980633;35.17881076448309",
                                ),
                                "reverseGeocodingInput", Map.of(
                                        "x", String.valueOf(latLong[1]),
                                        "y", String.valueOf(latLong[0])
                                )
                        ));
                    } else {
                        jsonMap.put("operationName", "getPlacesList");
                        jsonMap.put("query", "query getPlacesList($input: PlacesInput, $isNmap: Boolean!, $isBounds: Boolean!, $reverseGeocodingInput: ReverseGeocodingInput, $useReverseGeocode: Boolean = false) {\n  businesses: places(input: $input) {\n    total\n    items {\n      id\n      name\n      normalizedName\n      category\n      detailCid {\n        c0\n        c1\n        c2\n        c3\n        __typename\n      }\n      categoryCodeList\n      dbType\n      distance\n      roadAddress\n      address\n      fullAddress\n      commonAddress\n      bookingUrl\n      phone\n      virtualPhone\n      businessHours\n      daysOff\n      imageUrl\n      imageCount\n      x\n      y\n      poiInfo {\n        polyline {\n          shapeKey {\n            id\n            name\n            version\n            __typename\n          }\n          boundary {\n            minX\n            minY\n            maxX\n            maxY\n            __typename\n          }\n          details {\n            totalDistance\n            arrivalAddress\n            departureAddress\n            __typename\n          }\n          __typename\n        }\n        polygon {\n          shapeKey {\n            id\n            name\n            version\n            __typename\n          }\n          boundary {\n            minX\n            minY\n            maxX\n            maxY\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      subwayId\n      markerId @include(if: $isNmap)\n      markerLabel @include(if: $isNmap) {\n        text\n        style\n        stylePreset\n        __typename\n      }\n      imageMarker @include(if: $isNmap) {\n        marker\n        markerSelected\n        __typename\n      }\n      oilPrice @include(if: $isNmap) {\n        gasoline\n        diesel\n        lpg\n        __typename\n      }\n      isPublicGas\n      isDelivery\n      isTableOrder\n      isPreOrder\n      isTakeOut\n      isCvsDelivery\n      hasBooking\n      naverBookingCategory\n      bookingDisplayName\n      bookingBusinessId\n      bookingVisitId\n      bookingPickupId\n      baemin {\n        businessHours {\n          deliveryTime {\n            start\n            end\n            __typename\n          }\n          closeDate {\n            start\n            end\n            __typename\n          }\n          temporaryCloseDate {\n            start\n            end\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      yogiyo {\n        businessHours {\n          actualDeliveryTime {\n            start\n            end\n            __typename\n          }\n          bizHours {\n            start\n            end\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      isPollingStation\n      hasNPay\n      talktalkUrl\n      visitorReviewCount\n      visitorReviewScore\n      blogCafeReviewCount\n      bookingReviewCount\n      streetPanorama {\n        id\n        pan\n        tilt\n        lat\n        lon\n        __typename\n      }\n      naverBookingHubId\n      bookingHubUrl\n      bookingHubButtonName\n      newOpening\n      newBusinessHours {\n        status\n        description\n        dayOff\n        dayOffDescription\n        __typename\n      }\n      coupon {\n        total\n        promotions {\n          promotionSeq\n          couponSeq\n          conditionType\n          image {\n            url\n            __typename\n          }\n          title\n          description\n          type\n          couponUseType\n          __typename\n        }\n        __typename\n      }\n      mid\n      __typename\n    }\n    optionsForMap @include(if: $isBounds) {\n      ...OptionsForMap\n      displayCorrectAnswer\n      correctAnswerPlaceId\n      __typename\n    }\n    searchGuide {\n      queryResults {\n        regions {\n          displayTitle\n          query\n          region {\n            rcode\n            __typename\n          }\n          __typename\n        }\n        isBusinessName\n        __typename\n      }\n      queryIndex\n      types\n      __typename\n    }\n    queryString\n    siteSort\n    __typename\n  }\n  reverseGeocodingAddr(input: $reverseGeocodingInput) @include(if: $useReverseGeocode) {\n    ...ReverseGeocodingAddr\n    __typename\n  }\n}\n\nfragment OptionsForMap on OptionsForMap {\n  maxZoom\n  minZoom\n  includeMyLocation\n  maxIncludePoiCount\n  center\n  spotId\n  keepMapBounds\n  __typename\n}\n\nfragment ReverseGeocodingAddr on ReverseGeocodingResult {\n  rcode\n  region\n  __typename\n}");
                        jsonMap.put("variables", Map.of(
                                "useReverseGeocode", true,
                                "isNmap", false,
                                "isBounds", false,
                                "input", Map.of(
                                        "query", keyword,
                                        "start", start,
                                        "display", size,
                                        "x", String.valueOf(latLong[1]),
                                        "y", String.valueOf(latLong[0]),
//                                    "bounds", "129.1111525169227;35.16712921740793;129.11462865980633;35.17881076448309",
                                        "queryRank", "",
                                        "spq", false,
                                        "adult", false,
                                        "deviceType", "pcmap"
                                ),
                                "reverseGeocodingInput", Map.of(
                                        "x", String.valueOf(latLong[1]),
                                        "y", String.valueOf(latLong[0])
                                )
                        ));
                    }
                    final List<Map<String, Object>> jsonMapList = new ArrayList<>();
                    jsonMapList.add(jsonMap);
                    ResponseEntity<String> responseEntity = webClient
                            .post()
                            .uri(uriComponents.toUriString())
                            .header("Origin", "https://pcmap.place.naver.com")
                            .header("Content-Type", "application/json")
                            .header("Accept", "application/json, text/plain, */*")
                            .header("X-Wtm-Graphql", nplaceToken)
                            .bodyValue(jsonMapList)
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
                    final List<JsonNode> jsonNodeListForItems = new ArrayList<>();
                    final JsonNode jsonNodeOfItems;
                    try {
                        if ("restaurant".equals(businessSector)) {
                            jsonNodeOfItems = objectMapper.readTree(responseEntity.getBody())
                                    .get(0)
                                    .get("data")
                                    .get("restaurants");
                        } else {
                            jsonNodeOfItems = objectMapper.readTree(responseEntity.getBody())
                                    .get(0)
                                    .get("data")
                                    .get("businesses");
                        }
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                    if (page == 1) {
                        totalCountAtomic.set(jsonNodeOfItems.get("total").asInt());
                    }
                    jsonNodeOfItems.get("items").forEach(jsonNode -> {
//                        ((ObjectNode) jsonNode).putObject("rankInfo");
//                        ObjectNode objectNodeOfTrackInfo = ((ObjectNode) jsonNode).putObject("trackInfo");
                        ObjectNode objectNode = objectMapper.createObjectNode();
                        ObjectNode objectNodeOfTrackInfo = objectNode.putObject("trackInfo");
                        String imageUrl;
                        if (jsonNode.get("imageUrl") == null || jsonNode.get("imageUrl").isNull() || jsonNode.get("imageUrl").asText().isBlank()) {
                            imageUrl = "https://blog.kakaocdn.net/dn/9f2bW/btqFqMBK1Z0/IwomidqUtEOLksTIuXH6IK/img.png";
                        } else {
                            imageUrl = jsonNode.get("imageUrl").asText();
                        }
                        objectNodeOfTrackInfo.put("shopId", jsonNode.get("id").asText());
                        objectNodeOfTrackInfo.put("shopName", jsonNode.get("name").asText());
                        objectNodeOfTrackInfo.put("shopImageUrl", imageUrl);
                        objectNodeOfTrackInfo.put("category", jsonNode.get("category").asText());
                        objectNodeOfTrackInfo.put("address", jsonNode.get("address").asText());
                        objectNodeOfTrackInfo.put("roadAddress", jsonNode.get("roadAddress").asText());
                        objectNodeOfTrackInfo.put("visitorReviewCount", jsonNode.get("visitorReviewCount").asText());
                        objectNodeOfTrackInfo.put("blogReviewCount", jsonNode.get("blogCafeReviewCount").asText());
                        if (jsonNode.get("visitorReviewScore") == null || jsonNode.get("visitorReviewScore").isNull()) {
                            objectNodeOfTrackInfo.put("scoreInfo", "-");
                        } else {
                            objectNodeOfTrackInfo.put("scoreInfo", jsonNode.get("visitorReviewScore").asText());
                        }
                        if (jsonNode.get("saveCount") == null || jsonNode.get("saveCount").isNull()) {
                            objectNodeOfTrackInfo.put("saveCount", "-");
                        } else {
                            objectNodeOfTrackInfo.put("saveCount", jsonNode.get("saveCount").asText());
                        }
//                        jsonNodeListForItems.add(jsonNode);
                        jsonNodeListForItems.add(objectNode);
                    });
                    concurrentHashMap.put(page, jsonNodeListForItems);
                });
                final List<JsonNode> jsonNodeListForReturn = new ArrayList<>();
                pageList.forEach(page -> {
                    final int indexOfPage = pageList.indexOf(page);
                    List<JsonNode> jsonNodeList = concurrentHashMap.get(page);
                    if (jsonNodeList == null) {
                        throw new BadRequestException("랭킹 전체를 가져오지 못했습니다.");
                    }
                    jsonNodeList.forEach(jsonNode -> {
                        final int indexOfJsonNode = jsonNodeList.indexOf(jsonNode);
                        final int rank = (indexOfPage * size) + (indexOfJsonNode + 1);
//                        final ObjectNode objectNodeOfRankInfo = (ObjectNode) jsonNode.get("rankInfo");
                        final ObjectNode objectNodeOfRankInfo = ((ObjectNode) jsonNode).putObject("rankInfo");
                        objectNodeOfRankInfo.put("rank", rank);
                        objectNodeOfRankInfo.put("totalCount", totalCountAtomic.get());
                    });
                    jsonNodeListForReturn.addAll(jsonNodeList);
                });
                return jsonNodeListForReturn;
            }).get();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
