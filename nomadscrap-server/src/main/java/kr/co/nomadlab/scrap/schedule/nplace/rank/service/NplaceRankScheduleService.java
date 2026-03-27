package kr.co.nomadlab.scrap.schedule.nplace.rank.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import kr.co.nomadlab.scrap.model.db.constraint.AmpmType;
import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackEntity;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.nplace.rank.repository.NplaceRankTrackInfoRepository;
import kr.co.nomadlab.scrap.model.db.nplace.rank.repository.NplaceRankTrackRepository;
import kr.co.nomadlab.scrap.model.db.user.entity.UserNplaceRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.user.repository.UserNplaceRankTrackInfoRepository;
import kr.co.nomadlab.scrap.model_external.nomadproxy.repository.NomadproxyWirelessRepository;
import kr.co.nomadlab.scrap.util.ServiceHelper;
import kr.co.nomadlab.scrap.util.UtilVariable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NplaceRankScheduleService {

    @Nullable
    @Value("${proxy-server.ip}")
    private final String proxyServerIp;

    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    private final NomadproxyWirelessRepository nomadproxyWirelessRepository;
    private final NplaceRankTrackInfoRepository nplaceRankTrackInfoRepository;
    private final NplaceRankTrackRepository nplaceRankTrackRepository;
    private final UserNplaceRankTrackInfoRepository userNplaceRankTrackInfoRepository;
    private final ServiceHelper serviceHelper;


    @Transactional
    public void deleteAllRealtimeData() {
//        nplaceRankSearchShopInfoRepository.deleteAll();
        jdbcTemplate.execute("DELETE FROM NPLACE_RANK_SEARCH_SHOP WHERE 1 = 1");
        jdbcTemplate.execute("DELETE FROM NPLACE_RANK_SEARCH_SHOP_INFO WHERE 1 = 1");
    }

    @Transactional
    public void updateNplaceRankTrackInfoEntityForTrack() {
        List<UserNplaceRankTrackInfoEntity> userNplaceRankTrackInfoEntityList = userNplaceRankTrackInfoRepository.findAll();
        Set<Long> nplaceRankTrackInfoIdSet = new HashSet<>();
        userNplaceRankTrackInfoEntityList.forEach(userNplaceRankTrackInfoEntity -> {
            nplaceRankTrackInfoIdSet.add(userNplaceRankTrackInfoEntity.getNplaceRankTrackInfoEntity().getId());
        });
        List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList = nplaceRankTrackInfoRepository.findByIdIn(nplaceRankTrackInfoIdSet);
        nplaceRankTrackInfoEntityList.forEach(nplaceRankTrackInfoEntity -> {
            NplaceRankTrackEntity nplaceRankTrackEntityForSave;
            if (nplaceRankTrackInfoEntity.getNplaceRankTrackEntityList().isEmpty()) {
                nplaceRankTrackEntityForSave = NplaceRankTrackEntity.builder()
                        .nplaceRankTrackInfoEntity(nplaceRankTrackInfoEntity)
                        .rank(-1)
                        .prevRank(-1)
                        .visitorReviewCount("")
                        .blogReviewCount("")
                        .scoreInfo("")
                        .saveCount("")
                        .ampm(LocalTime.now().isBefore(LocalTime.NOON) ? AmpmType.AM : AmpmType.PM)
                        .isValid(false)
                        .chartDate(LocalDateTime.now())
                        .createDate(LocalDateTime.now())
                        .build();
            } else {
                List<NplaceRankTrackEntity> nplaceRankTrackEntityListForFilter = nplaceRankTrackInfoEntity.getNplaceRankTrackEntityList()
                        .stream()
                        .filter(NplaceRankTrackEntity::getIsValid)
                        .toList();
                NplaceRankTrackEntity nplaceRankTrackEntityByFilterLast = nplaceRankTrackEntityListForFilter.get(nplaceRankTrackEntityListForFilter.size() - 1);
                nplaceRankTrackEntityForSave = NplaceRankTrackEntity.builder()
                        .nplaceRankTrackInfoEntity(nplaceRankTrackInfoEntity)
                        .rank(-1)
                        .prevRank(nplaceRankTrackEntityByFilterLast.getRank())
                        .visitorReviewCount(nplaceRankTrackEntityByFilterLast.getVisitorReviewCount())
                        .blogReviewCount(nplaceRankTrackEntityByFilterLast.getBlogReviewCount())
                        .scoreInfo(nplaceRankTrackEntityByFilterLast.getScoreInfo())
                        .saveCount(nplaceRankTrackEntityByFilterLast.getSaveCount())
                        .ampm(LocalTime.now().isBefore(LocalTime.NOON) ? AmpmType.AM : AmpmType.PM)
                        .isValid(false)
                        .chartDate(LocalDateTime.now())
                        .createDate(LocalDateTime.now())
                        .build();
            }
            NplaceRankTrackEntity nplaceRankTrackEntity = nplaceRankTrackRepository.save(nplaceRankTrackEntityForSave);
            nplaceRankTrackInfoEntity.setTodayNplaceRankTrackId(nplaceRankTrackEntity.getId());
            nplaceRankTrackInfoEntity.setTrackStatus(TrackStatusType.WAIT);
            nplaceRankTrackInfoEntity.setUpdateDate(LocalDateTime.now());
        });
    }

    public Long countNeedToTrack() {
        return nplaceRankTrackInfoRepository.countByTrackStatus(TrackStatusType.WAIT);
    }

    public Long countNeedToTrackAgain() {
        List<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityList = nplaceRankTrackInfoRepository.findByTrackStatus(TrackStatusType.WAIT_AGAIN);
        return nplaceRankTrackInfoEntityList
                .stream()
                .filter(thisNplaceRankTrackInfoEntity -> LocalDateTime.now().isAfter(thisNplaceRankTrackInfoEntity.getUpdateDate().plusHours(1L)))
                .count();
    }

    @Transactional
    public void track(TrackStatusType trackStatusType) {
        Optional<NplaceRankTrackInfoEntity> nplaceRankTrackInfoEntityOptional = nplaceRankTrackInfoRepository.findFirstByTrackStatus(trackStatusType);
        if (nplaceRankTrackInfoEntityOptional.isEmpty()) {
            return;
        }
        NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity = nplaceRankTrackInfoEntityOptional.get();
        List<JsonNode> jsonNodeList;
        String proxyServerApiKey = null;
        try {
            proxyServerApiKey = UtilVariable.proxyServerApiKeyQueue.take();
            jsonNodeList = serviceHelper.saveNplaceRankSearchShopEntityListAndGetJsonNodeList(
                    nplaceRankTrackInfoEntity.getKeyword(),
                    nplaceRankTrackInfoEntity.getProvince(),
                    nplaceRankTrackInfoEntity.getBusinessSector(),
                    proxyServerApiKey
            );
        } catch (InterruptedException e) {
            throw new RuntimeException("key를 가져오는 도중 중단되었습니다.");
        } finally {
            if (proxyServerApiKey != null) {
                nomadproxyWirelessRepository.releaseWirelessEntityByApiKey(proxyServerApiKey);
                UtilVariable.proxyServerApiKeyQueue.add(proxyServerApiKey);
            }
        }
        Optional<JsonNode> jsonNodeOptionalByFilterShopId = jsonNodeList
                .stream()
                .filter(jsonNode -> jsonNode.get("trackInfo").get("shopId").asText().contains(nplaceRankTrackInfoEntity.getShopId()))
                .findFirst();
        Optional<NplaceRankTrackEntity> nplaceRankTrackEntityOptional = nplaceRankTrackRepository.findById(nplaceRankTrackInfoEntity.getTodayNplaceRankTrackId());
        if (nplaceRankTrackEntityOptional.isEmpty()) {
            // 없을 수 없음. 텔레그램 등으로 에러 알림 처리 해야함. 또는 백업 처리
            log.error("nplaceRankTrackEntityOptional.isEmpty()");
            return;
        }
        NplaceRankTrackEntity nplaceRankTrackEntity = nplaceRankTrackEntityOptional.get();
        JsonNode jsonNodeOfTrackable = null;
        try {
            jsonNodeOfTrackable = serviceHelper.getJsonNodeOfNplaceRankTrackableByShopId(nplaceRankTrackInfoEntity.getShopId());
        } catch (Exception ignored) {
            // 아무 것도 안함
        }
        if (jsonNodeOfTrackable != null){
            nplaceRankTrackEntity.setVisitorReviewCount(jsonNodeOfTrackable.get("visitorReviewCount").asText());
            nplaceRankTrackEntity.setBlogReviewCount(jsonNodeOfTrackable.get("blogReviewCount").asText());
            nplaceRankTrackEntity.setScoreInfo(jsonNodeOfTrackable.get("scoreInfo").asText());
        }
        if (jsonNodeOptionalByFilterShopId.isEmpty()) {
            nplaceRankTrackEntity.setRank(-1);
            if (nplaceRankTrackInfoEntity.getJson() != null && !nplaceRankTrackInfoEntity.getJson().isNull()) {
                if (nplaceRankTrackEntity.getPrevRank() != -1 && TrackStatusType.WAIT_AGAIN.equals(trackStatusType)) {
                    JsonNode jsonNode = nplaceRankTrackInfoEntity.getJson().deepCopy();
                    ObjectNode objectNodeOfRankInfo = (ObjectNode) jsonNode.get("rankInfo");
                    objectNodeOfRankInfo.put("rank", -1);
                    nplaceRankTrackInfoEntity.setJson(jsonNode);
                } else {
                    // 아무 것도 안함
                }
            } else {
                ObjectNode json = objectMapper.createObjectNode();
                ObjectNode rankInfoObjectNode = json.putObject("rankInfo");
                rankInfoObjectNode.put("rank", -1);
                nplaceRankTrackInfoEntity.setJson(json);
            }
        } else {
            JsonNode jsonNodeByFilterShopId = jsonNodeOptionalByFilterShopId.get().deepCopy();
            nplaceRankTrackEntity.setRank(jsonNodeByFilterShopId.get("rankInfo").get("rank").asInt());
            nplaceRankTrackEntity.setSaveCount(jsonNodeByFilterShopId.get("trackInfo").get("saveCount").asText());
            ObjectNode trackInfoObjectNode = (ObjectNode) jsonNodeByFilterShopId.get("trackInfo");
            if (jsonNodeOfTrackable != null) {
                trackInfoObjectNode.put("visitorReviewCount", jsonNodeOfTrackable.get("visitorReviewCount").asText());
                trackInfoObjectNode.put("blogReviewCount", jsonNodeOfTrackable.get("blogReviewCount").asText());
                trackInfoObjectNode.put("scoreInfo", jsonNodeOfTrackable.get("scoreInfo").asText());
            }
            nplaceRankTrackInfoEntity.setJson(jsonNodeByFilterShopId);
        }
        nplaceRankTrackEntity.setIsValid(true);
        nplaceRankTrackEntity.setChartDate(LocalDateTime.now());
        nplaceRankTrackEntity.setUpdateDate(LocalDateTime.now());
        nplaceRankTrackInfoEntity.setTrackStatus(TrackStatusType.COMPLETE);
        nplaceRankTrackInfoEntity.setUpdateDate(LocalDateTime.now());
        if (nplaceRankTrackEntity.getPrevRank() == -1) {
            if (nplaceRankTrackEntity.getRank() == -1) {
                nplaceRankTrackInfoEntity.setRankChange(0);
            } else {
                nplaceRankTrackInfoEntity.setRankChange(nplaceRankTrackEntity.getRank() - 301);
            }
        } else {
            if (nplaceRankTrackEntity.getRank() == -1) {
                if (TrackStatusType.WAIT.equals(trackStatusType)) {
                    nplaceRankTrackEntity.setIsValid(false);
                    nplaceRankTrackInfoEntity.setTrackStatus(TrackStatusType.WAIT_AGAIN);
                } else if (TrackStatusType.WAIT_AGAIN.equals(trackStatusType)) {
                    nplaceRankTrackInfoEntity.setRankChange(301 - nplaceRankTrackEntity.getPrevRank());
                }
            } else {
                nplaceRankTrackInfoEntity.setRankChange(nplaceRankTrackEntity.getRank() - nplaceRankTrackEntity.getPrevRank());
            }
        }
    }
}
