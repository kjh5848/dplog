package kr.co.nomadlab.nomadrank.domain.nplace.rank.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.domain.membership.dto.response.component.UsageLimitMeta;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.domain.membership.service.UsageLimitMetaFactory;
import kr.co.nomadlab.nomadrank.domain.membership.service.UsageLimitPolicy;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request.ReqNplaceRankChangeGroupDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request.ReqNplaceRankChangeTrackInfoStatusDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request.ReqNplaceRankGetRealtimeWithKeywordDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request.ReqNplaceRankPostShopDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request.ReqNplaceRankPostTrackDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.response.ResNplaceRankGetRealtimeWithKeywordDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.response.ResNplaceRankGetShopWithIdDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.response.ResNplaceRankPostShopTableDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.response.ResNplaceRankPostTrackDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.enums.NplaceRankShopTrackInfoStatus;
import kr.co.nomadlab.nomadrank.domain.point.service.PointServiceApiV1;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupEntity;
import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupNplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.group.repository.GroupNplaceRankShopRepository;
import kr.co.nomadlab.nomadrank.model.group.repository.GroupRepository;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipDetailEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipDetailRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankDailyTrackInfoEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankSearchShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopKeywordEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopTrackInfoEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopTrackInfoStatusHistoryEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankDailyTrackInfoRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankSearchShopRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankShopKeywordRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankShopRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankShopTrackInfoPointHistoryRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankShopTrackInfoRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankShopTrackInfoStatusHistoryRepository;
import kr.co.nomadlab.nomadrank.model.use_log.entity.UseLogEntity;
import kr.co.nomadlab.nomadrank.model.use_log.repository.UseLogRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.request.ReqNomadscrapNplaceRankPostTrackChartDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.request.ReqNomadscrapNplaceRankPostTrackInfoDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankGetRealtimeDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankGetTrackStateDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankGetTrackableDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankPostTrackChartDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankPostTrackDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankPostTrackInfoDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.repository.NomadscrapNplaceRankRealtimeRepository;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.repository.NomadscrapNplaceRankTrackChartRepository;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.repository.NomadscrapNplaceRankTrackInfoRepository;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.repository.NomadscrapNplaceRankTrackRepository;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.repository.NomadscrapNplaceRankTrackStateRepository;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.repository.NomadscrapNplaceRankTrackableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NplaceServiceApiV1 {

        private final UserRepository userRepository;

        private final NplaceRankShopRepository nplaceRankShopRepository;
        private final NplaceRankShopTrackInfoRepository nplaceRankShopTrackInfoRepository;
        private final NplaceRankShopTrackInfoStatusHistoryRepository nplaceRankShopTrackInfoStatusHistoryRepository;
        private final NplaceRankSearchShopRepository nplaceRankSearchShopRepository;
        private final NplaceRankDailyTrackInfoRepository nplaceRankDailyTrackInfoRepository;

        private final NomadscrapNplaceRankRealtimeRepository nomadscrapNplaceRankRealtimeRepository;
        private final NomadscrapNplaceRankTrackableRepository nomadscrapNplaceRankTrackableRepository;
        private final NomadscrapNplaceRankTrackRepository nomadscrapNplaceRankTrackRepository;
        private final NomadscrapNplaceRankTrackInfoRepository nomadscrapNplaceRankTrackInfoRepository;
        private final NomadscrapNplaceRankTrackChartRepository nomadscrapNplaceRankTrackChartRepository;
        private final NomadscrapNplaceRankTrackStateRepository nomadscrapNplaceRankTrackStateRepository;

        private final PointServiceApiV1 pointServiceApiV1;
        private final NplaceRankShopTrackInfoPointHistoryRepository nplaceRankShopTrackInfoPointHistoryRepository;
        private final UseLogRepository useLogRepository;
        private final NplaceRankShopKeywordRepository nplaceRankShopKeywordRepository;
        private final GroupNplaceRankShopRepository groupNplaceRankShopRepository;
        private final GroupRepository groupRepository;
        private final MembershipUserRepository membershipUserRepository;
        private final MembershipRepository membershipRepository;
        private final UsageLimitMetaFactory usageLimitMetaFactory;
        private final UsageLimitPolicy usageLimitPolicy;
        private final MembershipDetailRepository membershipDetailRepository;

        @Transactional
        public HttpEntity<?> getRealtime(String keyword, String province, String filterType, String filterValue,
                        Long userId) {
                log.info("[Nplace][Realtime] 요청 수신 userId={}, keyword={}, province={}, filterType={}, filterValue={}",
                                userId, keyword, province, filterType, filterValue);

                UserEntity userEntity = getUserEntityById(userId);

                LocalDate today = LocalDate.now();
                LocalDateTime dayStart = today.atStartOfDay();
                LocalDateTime dayEnd = today.plusDays(1).atStartOfDay();

                // find user membership
                Optional<MembershipUserEntity> membershipUserEntityOptional = membershipUserRepository
                                .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE);
                MembershipEntity membershipEntity;
                if (membershipUserEntityOptional.isEmpty()) {
                        membershipEntity = membershipRepository.findByName("FREE");
                } else {
                        membershipEntity = membershipUserEntityOptional.get().getMembershipEntity();
                }
                log.info("membership: {}", membershipEntity.getName());

                Integer limitCount = usageLimitPolicy.getDailyLimit(membershipEntity, ServiceSort.NPLACE_RANK_REALTIME);

                int useCount = Math.toIntExact(useLogRepository
                                .countByUserEntityAndServiceSortAndCreateDateBetween(userEntity,
                                                ServiceSort.NPLACE_RANK_REALTIME, dayStart, dayEnd));
                log.info("dayStart: {}, dayEnd: {}", dayStart, dayEnd);
                log.info("useCount/limitCount: {} / {}", useCount, limitCount);
                if (limitCount != null) {
                        if (limitCount <= 0) {
                                throw new AuthenticationException("해당 기능은 현재 플랜에서 사용할 수 없습니다.");
                        }
                        if (useCount >= limitCount) {
                                throw new AuthenticationException(limitCount + "회 사용횟수를 모두 사용하였습니다.");
                        }
                }

                var realtimeResponse = nomadscrapNplaceRankRealtimeRepository
                                .getRealtime(keyword, province, filterType, filterValue)
                                .getData();

                int updatedUseCount = useCount + 1;
                recordUsage(userEntity, ServiceSort.NPLACE_RANK_REALTIME);
                log.info("[Nplace][Realtime] 사용량 기록 userId={}, keyword={}, used={}/{}",
                                userId, keyword, updatedUseCount, limitCount);
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(realtimeResponse)
                                                .meta(createLimitMeta(membershipEntity, limitCount, updatedUseCount,
                                                                ServiceSort.NPLACE_RANK_REALTIME))
                                                .build(),
                                HttpStatus.OK);

        }

        public HttpEntity<?> getTrackable(String url) {
                log.info("[Nplace][Trackable] 요청 수신 url={}", url);
                ResponseEntity<ResDTO<Object>> response = new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(nomadscrapNplaceRankTrackableRepository.getTrackable(url)
                                                                .getData())
                                                .build(),
                                HttpStatus.OK);
                log.info("[Nplace][Trackable] 응답 완료 url={}", url);
                return response;
        }

        public HttpEntity<?> getShopTable(Long userId) {
                log.info("[Nplace][ShopTable] 요청 수신 userId={}", userId);
                UserEntity userEntity = getUserEntityById(userId);

                // find user membership
                Optional<MembershipUserEntity> membershipUserEntityOptional = membershipUserRepository
                                .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE);
                if (membershipUserEntityOptional.isEmpty()) {
                        LocalDateTime createdDate = userEntity.getCreateDate();
                        if (LocalDateTime.now().isAfter(createdDate.plusDays(7))) {
                                return new ResponseEntity<>(
                                                ResDTO.builder()
                                                                .code(1)
                                                                .message("7일 무료 기간이 만료되었습니다.")
                                                                .build(),
                                                HttpStatus.FORBIDDEN);
                        }
                }

                List<NplaceRankShopEntity> nplaceRankShopEntityList = nplaceRankShopRepository
                                .findByUserEntity(userEntity);
                List<Long> nomadscrapRankTrackInfoIdList = new ArrayList<>();
                nplaceRankShopEntityList.forEach(thisNplaceRankShopEntity -> {
                        thisNplaceRankShopEntity.getNplaceRankShopTrackInfoEntityList()
                                        .forEach(thisNplaceRankShopTrackInfoEntity -> {
                                                nomadscrapRankTrackInfoIdList.add(thisNplaceRankShopTrackInfoEntity
                                                                .getNomadscrapNplaceRankTrackInfoId());
                                        });
                });
                ResNomadscrapNplaceRankPostTrackInfoDTO resNomadscrapNplaceRankPostTrackInfoDTO = nomadscrapNplaceRankTrackInfoRepository
                                .postTrackInfo(
                                                ReqNomadscrapNplaceRankPostTrackInfoDTO.builder()
                                                                .nplaceRankTrackInfoIdList(
                                                                                nomadscrapRankTrackInfoIdList)
                                                                .build());

                ResponseEntity<ResDTO<Object>> response = new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResNplaceRankPostShopTableDTOApiV1.of(
                                                                nplaceRankShopEntityList,
                                                                resNomadscrapNplaceRankPostTrackInfoDTO))
                                                .build(),
                                HttpStatus.OK);
                log.info("[Nplace][ShopTable] 응답 완료 userId={}, shopCount={}",
                                userId, nplaceRankShopEntityList.size());
                return response;
        }

        @Transactional
        public HttpEntity<?> getShopWithId(Long userId, Long id) {
                log.info("[Nplace][ShopDetail] 요청 수신 userId={}, shopId={}", userId, id);
                UserEntity userEntity = getUserEntityById(userId);
                List<String> keywordList;

                Optional<NplaceRankShopEntity> nplaceRankShopEntityOptional = nplaceRankShopRepository.findById(id);
                if (nplaceRankShopEntityOptional.isEmpty()) {
                        throw new RuntimeException("존재하지 않는 샵입니다.");
                }
                NplaceRankShopEntity nplaceRankShopEntity = nplaceRankShopEntityOptional.get();

                Optional<NplaceRankShopKeywordEntity> nplaceRankShopKeywordEntityOptional = nplaceRankShopKeywordRepository
                                .findFirstByNplaceRankShopEntity_IdOrderByCreateDateDesc(id);
                if (nplaceRankShopKeywordEntityOptional.isPresent()) {
                        NplaceRankShopKeywordEntity nplaceRankShopKeywordEntity = nplaceRankShopKeywordEntityOptional
                                        .get();
                        LocalDateTime latestDate = nplaceRankShopKeywordEntity.getCreateDate();
                        LocalDate startOfLatestDate = latestDate.toLocalDate();

                        LocalDateTime startDate = startOfLatestDate.atStartOfDay();
                        LocalDateTime endDate = startDate.plusDays(1).minusNanos(1);

                        List<NplaceRankShopKeywordEntity> dailyNplaceRankShopKeywordEntity = nplaceRankShopKeywordRepository
                                        .findByNplaceRankShopEntity_IdAndCreateDateBetween(id, startDate, endDate);
                        keywordList = dailyNplaceRankShopKeywordEntity.stream()
                                        .map(NplaceRankShopKeywordEntity::getKeyword).toList();
                        log.info("keywordList{ }", keywordList);
                } else {
                        keywordList = new ArrayList<>();
                }

                if (!nplaceRankShopEntity.getUserEntity().getId().equals(userEntity.getId())) {
                        throw new AuthenticationException("권한이 없습니다.");
                }
                // ResNomadscrapNplaceRankPostTrackInfoDTO
                // resNomadscrapNplaceRankPostTrackInfoDTO =
                // nomadscrapNplaceRankTrackInfoRepository.postTrackInfo(
                // ReqNomadscrapNplaceRankPostTrackInfoDTO.builder()
                // .nplaceRankTrackInfoIdList(nplaceRankShopEntity.getNplaceRankShopTrackInfoEntityList().stream().map(NplaceRankShopTrackInfoEntity::getNomadscrapNplaceRankTrackInfoId).toList())
                // .build()
                // );
                ResNomadscrapNplaceRankPostTrackChartDTO resNomadscrapNplaceRankPostTrackChartDTO = nomadscrapNplaceRankTrackChartRepository
                                .postTrackChart(
                                                ReqNomadscrapNplaceRankPostTrackChartDTO.builder()
                                                                .nplaceRankTrackInfoList(nplaceRankShopEntity
                                                                                .getNplaceRankShopTrackInfoEntityList()
                                                                                .stream()
                                                                                .map(thisNplaceRankShopTrackInfoEntity -> ReqNomadscrapNplaceRankPostTrackChartDTO.NplaceRankTrackInfo
                                                                                                .builder()
                                                                                                .id(thisNplaceRankShopTrackInfoEntity
                                                                                                                .getNomadscrapNplaceRankTrackInfoId())
                                                                                                .trackStartDate(thisNplaceRankShopTrackInfoEntity
                                                                                                                .getCreateDate())
                                                                                                .build())
                                                                                .toList())
                                                                .build());

                if (!resNomadscrapNplaceRankPostTrackChartDTO.getData().getNplaceRankTrackInfoMap().isEmpty()) {
                        JsonNode jsonNode = resNomadscrapNplaceRankPostTrackChartDTO.getData()
                                        .getNplaceRankTrackInfoMap().values().stream().findFirst().get().getJson();
                        if (jsonNode.get("trackInfo") != null && !jsonNode.get("trackInfo").isNull()) {
                                nplaceRankShopEntity.setShopName(jsonNode.get("trackInfo").get("shopName").asText());
                                nplaceRankShopEntity.setShopImageUrl(
                                                jsonNode.get("trackInfo").get("shopImageUrl").asText());
                                nplaceRankShopEntity.setCategory(jsonNode.get("trackInfo").get("category").asText());
                                nplaceRankShopEntity.setAddress(jsonNode.get("trackInfo").get("address").asText());
                                nplaceRankShopEntity
                                                .setRoadAddress(jsonNode.get("trackInfo").get("roadAddress").asText());
                                nplaceRankShopEntity.setVisitorReviewCount(
                                                jsonNode.get("trackInfo").get("visitorReviewCount").asText());
                                nplaceRankShopEntity.setBlogReviewCount(
                                                jsonNode.get("trackInfo").get("blogReviewCount").asText());
                                nplaceRankShopEntity.setScoreInfo(jsonNode.get("trackInfo").get("scoreInfo").asText());
                        } else {
                                Optional<ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo> nplaceRankTrackInfoOptional = resNomadscrapNplaceRankPostTrackChartDTO
                                                .getData().getNplaceRankTrackInfoMap().values().stream().findFirst();
                                if (nplaceRankTrackInfoOptional.isPresent()) {
                                        List<ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo.NplaceRankTrack> nplaceRankTrackList = nplaceRankTrackInfoOptional
                                                        .get().getNplaceRankTrackList();
                                        ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo.NplaceRankTrack lastNplaceRankTrack = nplaceRankTrackList
                                                        .stream()
                                                        .filter(ResNomadscrapNplaceRankPostTrackChartDTO.DTOData.NplaceRankTrackInfo.NplaceRankTrack::getIsValid)
                                                        .reduce((first, second) -> second).orElse(null);
                                        if (lastNplaceRankTrack != null) {
                                                nplaceRankShopEntity.setVisitorReviewCount(
                                                                lastNplaceRankTrack.getVisitorReviewCount());
                                                nplaceRankShopEntity.setBlogReviewCount(
                                                                lastNplaceRankTrack.getBlogReviewCount());
                                                nplaceRankShopEntity.setScoreInfo(lastNplaceRankTrack.getScoreInfo());
                                        }
                                }
                        }
                }
                ResponseEntity<ResDTO<Object>> response = new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResNplaceRankGetShopWithIdDTOApiV1.of(nplaceRankShopEntity,
                                                                resNomadscrapNplaceRankPostTrackChartDTO, keywordList))
                                                .build(),
                                HttpStatus.OK);
                log.info("[Nplace][ShopDetail] 응답 완료 userId={}, shopId={}, keywordCount={}",
                                userId, id, keywordList.size());
                return response;
        }

        @Transactional
        public HttpEntity<?> postShopTable(Long userId, ReqNplaceRankPostShopDTOApiV1 reqDto) {
                String shopId = reqDto.getNplaceRankShop().getShopId();
                int keywordCount = reqDto.getNplaceRankShop().getKeywordList() != null
                                ? reqDto.getNplaceRankShop().getKeywordList().size()
                                : 0;
                log.info("[Nplace][ShopRegister] 요청 수신 userId={}, shopId={}, keywordCount={}",
                                userId, shopId, keywordCount);
                UserEntity userEntity = getUserEntityById(userId);

                // find user membership
                Optional<MembershipUserEntity> membershipUserEntityOptional = membershipUserRepository
                                .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE);
                MembershipEntity membershipEntity;
                if (membershipUserEntityOptional.isEmpty()) {
                        membershipEntity = membershipRepository.findByName("FREE");
                } else {
                        membershipEntity = membershipUserEntityOptional.get().getMembershipEntity();
                }
                log.info("membership: {}", membershipEntity.getName());

                // check a limit count of the membership
                MembershipDetailEntity membershipDetailEntity = membershipDetailRepository
                                .findByMembershipEntityAndServiceSort(membershipEntity,
                                                ServiceSort.NPLACE_SHOP_REGISTER);
                int limitCount = Optional.ofNullable(membershipDetailEntity.getLimitCount()).orElse(0);

                int shopCount = nplaceRankShopRepository.countByUserEntity(userEntity);
                log.info("shopCount/limitCount: {} / {}", shopCount, limitCount);

                if (shopCount >= limitCount) {
                        throw new AuthenticationException(limitCount + "개의 샵을 모두 등록하였습니다.");
                }

                nplaceRankShopRepository.findByUserEntityAndShopId(userEntity, reqDto.getNplaceRankShop().getShopId())
                                .ifPresent(thisNplaceRankShopEntity -> {
                                        throw new BadRequestException("이미 등록된 샵입니다.");
                                });

                NplaceRankShopEntity nplaceRankShopEntity = nplaceRankShopRepository
                                .save(reqDto.getNplaceRankShop().toEntity(userEntity));
                nplaceRankShopEntity.setNplaceRankShopKeywordEntityList(
                                reqDto.getNplaceRankShop()
                                                .getKeywordList()
                                                .stream()
                                                .map(keyword -> NplaceRankShopKeywordEntity.builder()
                                                                .keyword(keyword)
                                                                .nplaceRankShopEntity(nplaceRankShopEntity)
                                                                .build())
                                                .toList());

                List<NplaceRankShopEntity> nplaceRankShopEntityList = nplaceRankShopRepository
                                .findByUserEntity(userEntity);
                List<Long> nomadscrapRankTrackInfoIdList = new ArrayList<>();
                nplaceRankShopEntityList.forEach(thisNplaceRankShopEntity -> {
                        thisNplaceRankShopEntity.getNplaceRankShopTrackInfoEntityList()
                                        .forEach(thisNplaceRankShopTrackInfoEntity -> {
                                                nomadscrapRankTrackInfoIdList.add(thisNplaceRankShopTrackInfoEntity
                                                                .getNomadscrapNplaceRankTrackInfoId());
                                        });
                });
                ResNomadscrapNplaceRankPostTrackInfoDTO resNomadscrapNplaceRankPostTrackInfoDTO = nomadscrapNplaceRankTrackInfoRepository
                                .postTrackInfo(
                                                ReqNomadscrapNplaceRankPostTrackInfoDTO.builder()
                                                                .nplaceRankTrackInfoIdList(
                                                                                nomadscrapRankTrackInfoIdList)
                                                                .build());
                int updatedShopCount = shopCount + 1;
                ResponseEntity<ResDTO<Object>> response = new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResNplaceRankPostShopTableDTOApiV1.of(
                                                                nplaceRankShopEntityList,
                                                                resNomadscrapNplaceRankPostTrackInfoDTO))
                                                .meta(createLimitMeta(membershipEntity, limitCount, updatedShopCount,
                                                                ServiceSort.NPLACE_SHOP_REGISTER))
                                                .build(),
                                HttpStatus.OK);
                recordUsage(userEntity, ServiceSort.NPLACE_SHOP_REGISTER);
                log.info("[Nplace][ShopRegister] 완료 userId={}, shopId={}, totalShops={}",
                                userId, shopId, nplaceRankShopEntityList.size());
                return response;
        }

        @Transactional
        public HttpEntity<?> deleteShopWithId(Long userId, Long id) {
                log.info("[Nplace][ShopDelete] 요청 수신 userId={}, shopId={}", userId, id);
                UserEntity userEntity = getUserEntityById(userId);
                Optional<NplaceRankShopEntity> nplaceRankShopEntityOptional = nplaceRankShopRepository.findById(id);
                if (nplaceRankShopEntityOptional.isEmpty()) {
                        throw new RuntimeException("존재하지 않는 샵입니다.");
                }
                NplaceRankShopEntity nplaceRankShopEntity = nplaceRankShopEntityOptional.get();
                if (!nplaceRankShopEntity.getUserEntity().getId().equals(userEntity.getId())) {
                        throw new AuthenticationException("권한이 없습니다.");
                }

                Optional<MembershipUserEntity> membershipUserEntityOptional = membershipUserRepository
                                .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE);
                MembershipEntity membershipEntity = membershipUserEntityOptional
                                .map(MembershipUserEntity::getMembershipEntity)
                                .orElseGet(() -> membershipRepository.findByName("FREE"));
                int limitCount = Optional.ofNullable(
                                membershipDetailRepository
                                                .findByMembershipEntityAndServiceSort(membershipEntity,
                                                                ServiceSort.NPLACE_SHOP_REGISTER)
                                                .getLimitCount())
                                .orElse(0);

                List<NplaceRankShopTrackInfoEntity> nplaceRankShopTrackInfoEntityList = nplaceRankShopEntity
                                .getNplaceRankShopTrackInfoEntityList();
                nplaceRankShopTrackInfoEntityList.forEach(thisNplaceRankShopTrackInfoEntity -> {
                        List<NplaceRankShopTrackInfoEntity> nplaceRankShopTrackInfoEntityListForDelete = nplaceRankShopTrackInfoRepository
                                        .findByNomadscrapNplaceRankTrackInfoId(thisNplaceRankShopTrackInfoEntity
                                                        .getNomadscrapNplaceRankTrackInfoId());
                        if (nplaceRankShopTrackInfoEntityListForDelete.size() < 2) {
                try {
                                    nomadscrapNplaceRankTrackRepository.deleteTrack(
                                                thisNplaceRankShopTrackInfoEntity.getNomadscrapNplaceRankTrackInfoId());
                } catch (NomadscrapException e) {
                    String message = e.getMessage();
                    if (message == null || !message.contains("존재하지 않는 추적 정보입니다")) {
                        throw e;
                    }
                    log.warn("Nomadscrap 트랙 삭제 실패: {} (nomadscrapId={}, trackInfoId={})", message, thisNplaceRankShopTrackInfoEntity.getNomadscrapNplaceRankTrackInfoId(), thisNplaceRankShopTrackInfoEntity.getId());
                    nplaceRankShopTrackInfoRepository.delete(thisNplaceRankShopTrackInfoEntity);
                    log.info("Nomadscrap 트랙이 존재하지 않아도, DB에서 트랙 정보 삭제 (nomadscrapId={}, trackInfoId={})", thisNplaceRankShopTrackInfoEntity.getNomadscrapNplaceRankTrackInfoId(), thisNplaceRankShopTrackInfoEntity.getId());
                }
                        }
                });
                nplaceRankShopRepository.delete(nplaceRankShopEntity);
                useLogRepository.findTopByUserEntityAndServiceSortOrderByCreateDateDesc(userEntity,
                                ServiceSort.NPLACE_SHOP_REGISTER)
                                .ifPresent(useLogRepository::delete);
                int updatedShopCount = nplaceRankShopRepository.countByUserEntity(userEntity);
                ResponseEntity<ResDTO<Object>> response = new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .meta(createLimitMeta(membershipEntity, limitCount, updatedShopCount,
                                                                ServiceSort.NPLACE_SHOP_REGISTER))
                                                .build(),
                                HttpStatus.OK);
                log.info("[Nplace][ShopDelete] 완료 userId={}, shopId={}", userId, id);
                return response;
        }

        @Transactional
        public HttpEntity<?> postTrack(Long userId, ReqNplaceRankPostTrackDTOApiV1 reqDto) {
                var trackInfo = reqDto.getNplaceRankTrackInfo();
                log.info("[Nplace][TrackRegister] 요청 수신 userId={}, shopId={}, keyword={}, province={}",
                                userId,
                                trackInfo.getShopId(),
                                trackInfo.getKeyword(),
                                trackInfo.getProvince());

                UserEntity userEntity = getUserEntityById(userId);

                Optional<MembershipUserEntity> membershipUserEntityOptional = membershipUserRepository
                                .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE);

                MembershipEntity membershipEntity = membershipUserEntityOptional
                                .map(MembershipUserEntity::getMembershipEntity)
                                .orElseGet(() -> membershipRepository.findByName("FREE"));
                log.info("membership: {}", membershipEntity.getName());

                ResNomadscrapNplaceRankPostTrackDTO resNomadscrapNplaceRankPostTrackDTO = nomadscrapNplaceRankTrackRepository
                                .postTrack(reqDto.toNomadscrapDTO());

                // 응답 받은 트랙 정보로 기존 상점 정보 존재 여부 확인
                Optional<NplaceRankShopEntity> nplaceRankShopEntityOptional = nplaceRankShopRepository
                                .findByUserEntityAndShopId(userEntity,
                                                resNomadscrapNplaceRankPostTrackDTO.getData().getNplaceRankTrackInfo()
                                                                .getShopId());

                log.debug("[Nplace][TrackRegister] 기존 상점 조회 결과 userId={}, shopId={}, exists={}",
                                userId,
                                trackInfo.getShopId(),
                                nplaceRankShopEntityOptional.isPresent());

                NplaceRankShopEntity nplaceRankShopEntity;
                if (nplaceRankShopEntityOptional.isPresent()) {
                        nplaceRankShopEntity = nplaceRankShopEntityOptional.get();
                } else {
                        MembershipDetailEntity shopLimitDetail = membershipDetailRepository
                                        .findByMembershipEntityAndServiceSort(membershipEntity,
                                                        ServiceSort.NPLACE_SHOP_REGISTER);
                        int shopLimitCount = Optional.ofNullable(shopLimitDetail.getLimitCount()).orElse(0);
                        int shopCount = nplaceRankShopRepository.countByUserEntity(userEntity);
                        log.info("shopCount/limitCount: {} / {}", shopCount, shopLimitCount);
                        if (shopCount >= shopLimitCount) {
                                throw new AuthenticationException(shopLimitCount + "개의 샵을 모두 등록하였습니다.");
                        }
                        nplaceRankShopEntity = nplaceRankShopRepository.save(resNomadscrapNplaceRankPostTrackDTO
                                        .getData()
                                        .getNplaceRankTrackInfo().toRankShopEntity(userEntity));
                }

                // 동일한 트랙이 이미 등록되어 있는지 확인
                if (nplaceRankShopEntity.getNplaceRankShopTrackInfoEntityList().stream()
                                .anyMatch(thisNplaceRankShopTrackInfoEntity -> thisNplaceRankShopTrackInfoEntity
                                                .getNomadscrapNplaceRankTrackInfoId()
                                                .equals(resNomadscrapNplaceRankPostTrackDTO.getData()
                                                                .getNplaceRankTrackInfo().getId()))) {
                        throw new RuntimeException("이미 등록된 키워드와 지역입니다.");
                }

                MembershipDetailEntity trackLimitDetail = membershipDetailRepository
                                .findByMembershipEntityAndServiceSort(membershipEntity,
                                                ServiceSort.NPLACE_RANK_TRACK);
                int trackLimitCount = Optional.ofNullable(trackLimitDetail.getLimitCount()).orElse(0);
                int trackCount = nplaceRankShopTrackInfoRepository
                                .countByNplaceRankShopEntity_UserEntity(userEntity);
                log.info("trackCount/limitCount: {} / {}", trackCount, trackLimitCount);
                if (trackCount >= trackLimitCount) {
                        throw new AuthenticationException(trackLimitCount + "개의 키워드를 모두 등록하였습니다.");
                }
                int updatedTrackCount = trackCount + 1;

                // 트랙 정보 저장
                NplaceRankShopTrackInfoEntity nplaceRankShopTrackInfoEntity = nplaceRankShopTrackInfoRepository
                                .save(NplaceRankShopTrackInfoEntity.builder().nplaceRankShopEntity(nplaceRankShopEntity)
                                                .nomadscrapNplaceRankTrackInfoId(
                                                                resNomadscrapNplaceRankPostTrackDTO.getData()
                                                                                .getNplaceRankTrackInfo().getId())
                                                .build());

                log.debug("[Nplace][TrackRegister] 트랙 저장 완료 trackInfoId={}",
                                nplaceRankShopTrackInfoEntity.getId());

                // 상점 엔티티에 트랙 정보 추가
                nplaceRankShopEntity.getNplaceRankShopTrackInfoEntityList().add(nplaceRankShopTrackInfoEntity);

                // 외부 API에 모든 트랙 ID를 보내서 트랙 정보 요청
                ResNomadscrapNplaceRankPostTrackInfoDTO resNomadscrapNplaceRankPostTrackInfoDTO = nomadscrapNplaceRankTrackInfoRepository
                                .postTrackInfo(ReqNomadscrapNplaceRankPostTrackInfoDTO.builder()
                                                .nplaceRankTrackInfoIdList(nplaceRankShopEntity
                                                                .getNplaceRankShopTrackInfoEntityList().stream()
                                                                .map(NplaceRankShopTrackInfoEntity::getNomadscrapNplaceRankTrackInfoId)
                                                                .toList())
                                                .build());

                recordUsage(userEntity, ServiceSort.NPLACE_RANK_TRACK);
                log.info("[Nplace][TrackRegister] 완료 userId={}, shopId={}, keyword={}, trackInfoCount={}",
                                userId,
                                trackInfo.getShopId(),
                                trackInfo.getKeyword(),
                                nplaceRankShopEntity.getNplaceRankShopTrackInfoEntityList().size());
                return new ResponseEntity<>(ResDTO.builder().code(0).message("success")
                                .data(ResNplaceRankPostTrackDTOApiV1.of(nplaceRankShopEntity,
                                                resNomadscrapNplaceRankPostTrackInfoDTO))
                                .meta(createLimitMeta(membershipEntity, trackLimitCount, updatedTrackCount,
                                                ServiceSort.NPLACE_RANK_TRACK))
                                .build(), HttpStatus.OK);
        }

        // public HttpEntity<?> postTrackInfo(Long userId,
        // ReqNplaceRankPostTrackInfoDTOApiV1 reqDto) {
        // UserEntity userEntity = getUserEntityById(userId);
        // return null;
        // }

        // public HttpEntity<?> postTrackChart(Long userId,
        // ReqNplaceRankPostTrackChartDTOApiV1 reqDto) {
        // UserEntity userEntity = getUserEntityById(userId);
        // Long count =
        // nplaceRankShopTrackInfoRepository.countByNplaceRankShopEntity_UserEntityAndNomadscrapNplaceRankTrackInfoIdIn(
        // userEntity,
        // reqDto.getNplaceRankTrackInfoList()
        // .stream()
        // .map(ReqNplaceRankPostTrackChartDTOApiV1.NplaceRankTrackInfo::getNomadscrapNplaceRankTrackInfoId)
        // .toList()
        // );
        // if (count != reqDto.getNplaceRankTrackInfoList().size()){
        // throw new BadRequestException("유효하지 않은 요청입니다.");
        // }
        // ResNomadscrapNplaceRankPostTrackChartDTO
        // resNomadscrapNplaceRankPostTrackChartDTO =
        // nomadscrapNplaceRankTrackChartRepository.postTrackChart(reqDto.toNomadscrapDTO());
        // return new ResponseEntity<>(
        // ResDTO.builder()
        // .code(0)
        // .message("success")
        // .data(resNomadscrapNplaceRankPostTrackChartDTO.getData())
        // .build(),
        // HttpStatus.OK
        // );
        // }

        @Transactional
        public HttpEntity<?> deleteTrack(Long userId, Long id) {
                log.info("[Nplace][TrackDelete] 요청 수신 userId={}, trackInfoId={}", userId, id);
                UserEntity userEntity = getUserEntityById(userId);
                Optional<NplaceRankShopTrackInfoEntity> nplaceRankShopTrackInfoEntityOptional = nplaceRankShopTrackInfoRepository
                                .findById(id);
                if (nplaceRankShopTrackInfoEntityOptional.isEmpty()) {
                        throw new RuntimeException("존재하지 않는 추적 정보입니다.");
                }
                NplaceRankShopTrackInfoEntity nplaceRankShopTrackInfoEntity = nplaceRankShopTrackInfoEntityOptional
                                .get();
                if (!nplaceRankShopTrackInfoEntity.getNplaceRankShopEntity().getUserEntity().getId()
                                .equals(userEntity.getId())) {
                        throw new AuthenticationException("권한이 없습니다.");
                }
                List<NplaceRankShopTrackInfoEntity> nplaceRankShopTrackInfoEntityListForDelete = nplaceRankShopTrackInfoRepository
                                .findByNomadscrapNplaceRankTrackInfoId(
                                                nplaceRankShopTrackInfoEntity.getNomadscrapNplaceRankTrackInfoId());
                if (nplaceRankShopTrackInfoEntityListForDelete.size() < 2) {
                        nomadscrapNplaceRankTrackRepository.deleteTrack(
                                        nplaceRankShopTrackInfoEntity.getNomadscrapNplaceRankTrackInfoId());
                }
                nplaceRankShopTrackInfoRepository.delete(nplaceRankShopTrackInfoEntity);
                Optional<MembershipUserEntity> membershipUserEntityOptional = membershipUserRepository
                                .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE);
                MembershipEntity membershipEntity = membershipUserEntityOptional
                                .map(MembershipUserEntity::getMembershipEntity)
                                .orElseGet(() -> membershipRepository.findByName("FREE"));
                int limitCount = Optional.ofNullable(
                                membershipDetailRepository
                                                .findByMembershipEntityAndServiceSort(membershipEntity,
                                                                ServiceSort.NPLACE_RANK_TRACK)
                                                .getLimitCount())
                                .orElse(0);
                int updatedTrackCount = nplaceRankShopTrackInfoRepository.countByNplaceRankShopEntity_UserEntity(
                                userEntity);
                ResponseEntity<ResDTO<Object>> response = new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .meta(createLimitMeta(membershipEntity, limitCount, updatedTrackCount,
                                                                ServiceSort.NPLACE_RANK_TRACK))
                                                .build(),
                                HttpStatus.OK);
                log.info("[Nplace][TrackDelete] 완료 userId={}, trackInfoId={}", userId, id);
                return response;
        }

        private UserEntity getUserEntityById(Long userId) {
                Optional<UserEntity> userEntityOptional = userRepository.findByIdAndDeleteDateIsNull(userId);
                if (userEntityOptional.isEmpty()) {
                        throw new AuthenticationException("재인증이 필요한 사용자입니다. 로그인 후 다시 시도해주세요.");
                }
                return userEntityOptional.get();
        }

        @Transactional
        public HttpEntity<?> changeTrackInfoStatus(Long userId, ReqNplaceRankChangeTrackInfoStatusDTOApiV1 reqDto) {
                log.info("[Nplace][TrackStatus] 요청 수신 userId={}, trackInfoId={}, newStatus={}",
                                userId,
                                reqDto.getNplaceRankTrackInfoStatus().getId(),
                                reqDto.getNplaceRankTrackInfoStatus().getStatus());
                UserEntity userEntity = getUserEntityById(userId);
                Optional<NplaceRankShopTrackInfoEntity> nplaceRankShopTrackInfoEntityOptional = nplaceRankShopTrackInfoRepository
                                .findById(reqDto.getNplaceRankTrackInfoStatus().getId());
                if (nplaceRankShopTrackInfoEntityOptional.isEmpty()) {
                        throw new RuntimeException("존재하지 않는 추적 정보입니다.");
                }
                NplaceRankShopTrackInfoEntity nplaceRankShopTrackInfoEntity = nplaceRankShopTrackInfoEntityOptional
                                .get();
                if (!nplaceRankShopTrackInfoEntity.getNplaceRankShopEntity().getUserEntity().getId()
                                .equals(userEntity.getId())) {
                        throw new AuthenticationException("권한이 없습니다.");
                }

                NplaceRankShopTrackInfoStatus newStatus = reqDto.getNplaceRankTrackInfoStatus().getStatus();
                NplaceRankShopTrackInfoStatus currentStatus = nplaceRankShopTrackInfoEntity
                                .getNplaceRankShopTrackInfoStatus();

                if (currentStatus.equals(newStatus)) {
                        throw new BadRequestException("이미 " + newStatus.name() + " 상태입니다.");
                }

                nplaceRankShopTrackInfoEntity.setNplaceRankShopTrackInfoStatus(newStatus);
                nplaceRankShopTrackInfoStatusHistoryRepository.save(
                                NplaceRankShopTrackInfoStatusHistoryEntity.builder()
                                                .nplaceRankShopTrackInfoEntity(nplaceRankShopTrackInfoEntity)
                                                .nplaceRankShopTrackInfoStatus(newStatus)
                                                .build());

                if (newStatus.equals(NplaceRankShopTrackInfoStatus.RUNNING)) {
                        LocalDateTime now = LocalDateTime.now();
                        LocalDateTime firstDayOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).toLocalDate()
                                        .atStartOfDay();
                        LocalDateTime lastDayOfMonth = now.with(TemporalAdjusters.lastDayOfMonth()).toLocalDate()
                                        .atTime(23, 59, 59);

                        boolean paymentExistsForCurrentMonth = nplaceRankShopTrackInfoPointHistoryRepository
                                        .existsByNplaceRankShopTrackInfoEntityAndCreateDateBetween(
                                                        nplaceRankShopTrackInfoEntity, firstDayOfMonth, lastDayOfMonth);
                        if (!paymentExistsForCurrentMonth) {
                                pointServiceApiV1.rankPointPayment(userEntity);
                        }
                }

                ResponseEntity<ResDTO<Object>> response = new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
                log.info("[Nplace][TrackStatus] 변경 완료 userId={}, trackInfoId={}, newStatus={}",
                                userId,
                                reqDto.getNplaceRankTrackInfoStatus().getId(),
                                newStatus);
                return response;
        }

        @Transactional
        public HttpEntity<?> updateKeywordList(Long id) {
                log.info("[Nplace][KeywordUpdate] 요청 수신 shopId={}", id);
                Optional<NplaceRankShopEntity> nplaceRankShopEntityOptional = nplaceRankShopRepository.findById(id);
                if (nplaceRankShopEntityOptional.isEmpty()) {
                        throw new RuntimeException("존재하지 않는 샵입니다.");
                }
                NplaceRankShopEntity nplaceRankShopEntity = nplaceRankShopEntityOptional.get();

                LocalDateTime startDate = LocalDate.now().atStartOfDay();
                LocalDateTime endDate = startDate.plusDays(1).minusNanos(1);
                if (nplaceRankShopKeywordRepository.existsByNplaceRankShopEntityAndCreateDateBetween(
                                nplaceRankShopEntity, startDate, endDate)) {
                        throw new BadRequestException("키워드 갱신은 하루에 한번만 가능합니다.");
                }

                ResNomadscrapNplaceRankGetTrackableDTO.DTOData nplaceRankTrackableDTO = nomadscrapNplaceRankTrackableRepository
                                .getTrackable(nplaceRankShopEntity.getShopId()).getData();

                JsonNode jsonKeywordList = nplaceRankTrackableDTO.getNplaceRankShop().get("keywordList");
                List<String> keywordList = new ArrayList<>();
                if (jsonKeywordList != null && jsonKeywordList.isArray()) {
                        for (JsonNode keyword : jsonKeywordList) {
                                keywordList.add(keyword.asText());
                        }
                }

                List<NplaceRankShopKeywordEntity> nplaceRankShopKeywordEntityList = nplaceRankShopEntity
                                .getNplaceRankShopKeywordEntityList();

                keywordList.forEach(keyword -> {
                        nplaceRankShopKeywordEntityList.add(
                                        NplaceRankShopKeywordEntity.builder()
                                                        .keyword(keyword)
                                                        .nplaceRankShopEntity(nplaceRankShopEntity)
                                                        .build());
                });

                ResponseEntity<ResDTO<Object>> response = new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
                log.info("[Nplace][KeywordUpdate] 완료 shopId={}, keywordCount={}",
                                id, keywordList.size());
                return response;
        }

        @Transactional
        public HttpEntity<?> changeGroup(ReqNplaceRankChangeGroupDTOApiV1 reqDto) {
                int shopCount = reqDto.getNplaceRankShopList().size();
                Long groupId = reqDto.getGroup().getId();
                log.info("[Nplace][GroupChange] 요청 수신 groupId={}, shopCount={}", groupId, shopCount);
                List<NplaceRankShopEntity> nplaceRankShopEntityList = nplaceRankShopRepository
                                .findByIdIn(reqDto.getNplaceRankShopList().stream()
                                                .map(ReqNplaceRankChangeGroupDTOApiV1.NplaceRankShop::getId).toList());
                groupNplaceRankShopRepository.deleteByNplaceRankShopEntityIn(nplaceRankShopEntityList);
                Optional<GroupEntity> optionalGroupEntity = groupRepository.findById(reqDto.getGroup().getId());
                if (optionalGroupEntity.isEmpty()) {
                        throw new RuntimeException("존재하지 않는 그룹입니다.");
                }
                GroupEntity groupEntity = optionalGroupEntity.get();

                List<GroupNplaceRankShopEntity> groupNplaceRankShopEntitiyList = nplaceRankShopEntityList.stream()
                                .map(nplaceRankShopEntity -> GroupNplaceRankShopEntity.builder()
                                                .nplaceRankShopEntity(nplaceRankShopEntity)
                                                .groupEntity(groupEntity)
                                                .build())
                                .toList();
                groupNplaceRankShopRepository.saveAll(groupNplaceRankShopEntitiyList);

                ResponseEntity<ResDTO<Object>> response = new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
                log.info("[Nplace][GroupChange] 완료 groupId={}, shopCount={}", groupId, shopCount);
                return response;
        }

        @Transactional
        public void saveRealtime() {
                log.info("saveRealtime start");
                nplaceRankDailyTrackInfoRepository.deleteAll();
                boolean isEnd = false;
                while (!isEnd) {
                        ResNomadscrapNplaceRankGetTrackStateDTO resNomadscrapNplaceRankGetTrackStateDTO = nomadscrapNplaceRankTrackStateRepository
                                        .getTrackState();
                        int completedTrackInfoCount = resNomadscrapNplaceRankGetTrackStateDTO.getData()
                                        .getCompletedTrackInfoCount();
                        int totalTrackInfoCount = resNomadscrapNplaceRankGetTrackStateDTO.getData()
                                        .getTotalTrackInfoCount();
                        log.info("trackInfoCount: {}/{}", completedTrackInfoCount, totalTrackInfoCount);
                        resNomadscrapNplaceRankGetTrackStateDTO.getData().getCompletedTrackInfoList()
                                        .forEach(thisNplaceRankTrackInfo -> {
                                                String keyword = thisNplaceRankTrackInfo.getKeyword();
                                                String province = thisNplaceRankTrackInfo.getProvince();
                                                if (!nplaceRankDailyTrackInfoRepository
                                                                .existsByKeywordAndProvince(keyword, province)) {
                                                        ResNomadscrapNplaceRankGetRealtimeDTO resNomadscrapNplaceRankGetRealtimeDTO = nomadscrapNplaceRankRealtimeRepository
                                                                        .getRealtime(keyword, province);
                                                        nplaceRankDailyTrackInfoRepository
                                                                        .save(NplaceRankDailyTrackInfoEntity.builder()
                                                                                        .keyword(keyword)
                                                                                        .province(province)
                                                                                        .build());
                                                        nplaceRankSearchShopRepository.saveAll(
                                                                        NplaceRankSearchShopEntity.createFromDto(
                                                                                        resNomadscrapNplaceRankGetRealtimeDTO,
                                                                                        keyword, province));
                                                }
                                        });

                        if (completedTrackInfoCount == totalTrackInfoCount) {
                                isEnd = true;
                        }
                        try {
                                Thread.sleep(60000);
                        } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                                throw new RuntimeException(e);
                        }
                }
                log.info("saveRealtime complete");
        }

        public HttpEntity<?> getRealtimeWithKeyword(ReqNplaceRankGetRealtimeWithKeywordDTOApiV1 reqDto) {
                log.info("[Nplace][RealtimeKeyword] 요청 수신 keyword={}, province={}, searchDate={}",
                                reqDto.getNplaceRankCheckData().getKeyword(),
                                reqDto.getNplaceRankCheckData().getProvince(),
                                reqDto.getNplaceRankCheckData().getSearchDate());

                // 먼저 해당 키워드와 지역으로 최근 7일간의 데이터가 있는지 확인
                List<NplaceRankSearchShopEntity> recentDataCheck = nplaceRankSearchShopRepository
                                .findBySearchKeyword_KeywordAndSearchKeyword_ProvinceAndCreateDateBetween(
                                                reqDto.getNplaceRankCheckData().getKeyword(),
                                                reqDto.getNplaceRankCheckData().getProvince(),
                                                reqDto.getNplaceRankCheckData().getSearchDate().minusDays(7),
                                                reqDto.getNplaceRankCheckData().getSearchDate().plusDays(1));
                log.debug("[Nplace][RealtimeKeyword] 최근 7일 데이터 건수 keyword={}, province={}, count={}",
                                reqDto.getNplaceRankCheckData().getKeyword(),
                                reqDto.getNplaceRankCheckData().getProvince(),
                                recentDataCheck.size());

                if (!recentDataCheck.isEmpty()) {
                        NplaceRankSearchShopEntity recent = recentDataCheck.get(0);
                        log.debug("[Nplace][RealtimeKeyword] 최근 데이터 예시 createDate={}, shopName={}",
                                        recent.getCreateDate(), recent.getShopName());
                }

                List<NplaceRankSearchShopEntity> nplaceRankSearchShopEntityList = nplaceRankSearchShopRepository
                                .findBySearchKeyword_KeywordAndSearchKeyword_ProvinceAndCreateDateBetween(
                                                reqDto.getNplaceRankCheckData().getKeyword(),
                                                reqDto.getNplaceRankCheckData().getProvince(),
                                                reqDto.getNplaceRankCheckData().getSearchDate(),
                                                reqDto.getNplaceRankCheckData().getSearchDate().plusDays(1)

                                );

                log.info("[Nplace][RealtimeKeyword] 조회 결과 keyword={}, province={}, resultCount={}",
                                reqDto.getNplaceRankCheckData().getKeyword(),
                                reqDto.getNplaceRankCheckData().getProvince(),
                                nplaceRankSearchShopEntityList.size());

                if (!nplaceRankSearchShopEntityList.isEmpty()) {
                        for (int i = 0; i < Math.min(5, nplaceRankSearchShopEntityList.size()); i++) {
                                NplaceRankSearchShopEntity entity = nplaceRankSearchShopEntityList.get(i);
                                log.debug("[Nplace][RealtimeKeyword] result idx={}, id={}, rank={}, shopName={}, createDate={}, address={}, category={}",
                                                (i + 1),
                                                entity.getId(),
                                                entity.getRank(),
                                                entity.getShopName(),
                                                entity.getCreateDate(),
                                                entity.getAddress(),
                                                entity.getCategory());
                        }
                } else {
                        log.info("[Nplace][RealtimeKeyword] 조회된 데이터가 없습니다. keyword={}, province={}, searchDate={}",
                                        reqDto.getNplaceRankCheckData().getKeyword(),
                                        reqDto.getNplaceRankCheckData().getProvince(),
                                        reqDto.getNplaceRankCheckData().getSearchDate());
                }

                List<NplaceRankSearchShopEntity> distinctList = nplaceRankSearchShopEntityList.stream()
                                .collect(Collectors.collectingAndThen(
                                                Collectors.toMap(
                                                                NplaceRankSearchShopEntity::getRank,
                                                                entity -> entity,
                                                                (existing, replacement) -> existing),
                                                map -> new ArrayList<>(map.values())));

                log.info("[Nplace][RealtimeKeyword] 중복 제거 후 데이터 건수 keyword={}, province={}, deduplicatedCount={}",
                                reqDto.getNplaceRankCheckData().getKeyword(),
                                reqDto.getNplaceRankCheckData().getProvince(),
                                distinctList.size());

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResNplaceRankGetRealtimeWithKeywordDTOApiV1.of(distinctList))
                                                .build(),
                                HttpStatus.OK);
        }

        private void recordUsage(UserEntity userEntity, ServiceSort serviceSort) {
                if (userEntity == null || serviceSort == null) {
                        return;
                }
                useLogRepository.save(UseLogEntity.builder()
                                .userEntity(userEntity)
                                .serviceSort(serviceSort)
                                .build());
        }

        private UsageLimitMeta createLimitMeta(MembershipEntity membershipEntity,
                Integer limitCount,
                int usedCount,
                ServiceSort serviceSort) {
                return usageLimitMetaFactory.create(membershipEntity, serviceSort, limitCount, usedCount, ZoneId.systemDefault());
        }
}
