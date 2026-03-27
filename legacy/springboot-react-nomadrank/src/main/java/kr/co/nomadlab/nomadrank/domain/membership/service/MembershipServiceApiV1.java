package kr.co.nomadlab.nomadrank.domain.membership.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.membership.dto.response.ResMembershipCheckDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.membership.dto.response.ResMembershipCurrentDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.membership.dto.response.ResMembershipListDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.membership.dto.response.ResMembershipProfileSummaryDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.membership.dto.response.component.MembershipUsageDTO;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus;
import kr.co.nomadlab.nomadrank.domain.payment.service.ChargeAdapterService;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserRepository;
import kr.co.nomadlab.nomadrank.model.payment.entity.ChargeEntity;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// MembershipServiceApiV1: 멤버십 관련 비즈니스 로직을 처리하는 서비스 클래스
@Service // Spring 서비스 빈 선언
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
@Transactional(readOnly = true) // 읽기 전용 트랜잭션 관리
@Slf4j // 로깅을 위한 Lombok 어노테이션
public class MembershipServiceApiV1 {

        // 멤버십 정보 조회 및 관리용 레포지토리
        private final MembershipRepository membershipRepository;
        // 사용자별 멤버십 이력 관리 레포지토리
        private final MembershipUserRepository membershipUserRepository;
        // 사용자 정보 조회 레포지토리
        private final UserRepository userRepository;
        // 구독(결제) 정보 관리 레포지토리
        private final SubscriptionRepository subscriptionRepository;
        // 결제 이력 조회 레포지토리(Charge 전환 어댑터)
        private final ChargeAdapterService chargeAdapterService;
        private final MembershipUsageService membershipUsageService;

        // 주요 사용량 키 목록(트랙 키워드, 보고서, 실시간 쿼리)
        private static final List<String> CORE_USAGE_KEYS = List.of("trackKeywords",
                        "realtimeQueries");
        private static final int DEFAULT_PAYMENT_LIMIT = 3;
        private static final LocalDate MAX_MEMBERSHIP_END_DATE = LocalDate.of(9999, 12, 31);

        // 멤버십 목록 조회 (관리자/일반 권한별로 다르게 반환)
        public HttpEntity<?> getMembershipList(List<UserAuthoritySort> authority) {
                // 반환할 멤버십 엔티티 리스트 선언
                List<MembershipEntity> membershipEntityList;
                // 관리자 권한이 있으면 FREE 제외, 아니면 FREE/ADMIN 모두 제외
                if (authority.contains(UserAuthoritySort.ADMIN)) {
                        // 관리자: FREE 제외 전체 조회
                        membershipEntityList = membershipRepository.findByNameNotIn(List.of("FREE"));
                } else {
                        // 일반: FREE, ADMIN 모두 제외
                        membershipEntityList = membershipRepository.findByNameNotIn(List.of("FREE", "ADMIN"));
                }
                // DTO 변환 및 표준 응답(ResDTO)로 감싸서 반환, HTTP 200
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResMembershipListDTOApiV1.of(membershipEntityList))
                                                .build(),
                                HttpStatus.OK);
        }

        // 현재 구독(멤버십) 정보 조회 (본인 또는 관리자만 가능)
        public HttpEntity<?> getCurrentSubscription(Long userId, Long currentUserId,
                        List<UserAuthoritySort> currentUserAuthority) {
                // 요청 정보 로깅
                log.info("[Membership] 현재 구독 조회 요청: 대상 사용자={}, 요청자={}, 관리자 여부={}",
                                userId, currentUserId, currentUserAuthority.contains(UserAuthoritySort.ADMIN));

                // 권한 검증: 본인 또는 ADMIN만 조회 가능
                boolean isAdmin = currentUserAuthority.contains(UserAuthoritySort.ADMIN);
                if (!isAdmin && !userId.equals(currentUserId)) {
                        // 권한 부족 시 로그 및 403 반환
                        log.warn("[Membership] 권한 부족: 요청자={}, 대상 사용자={}", currentUserId, userId);
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(-1)
                                                        .message("권한이 없습니다.")
                                                        .build(),
                                        HttpStatus.FORBIDDEN);
                }

                // 사용자 존재 확인
                Optional<UserEntity> userEntityOptional = userRepository.findByIdAndDeleteDateIsNull(userId);
                if (userEntityOptional.isEmpty()) {
                        // 사용자 미존재 시 404 반환
                        log.warn("[Membership] 사용자 미존재: userId={}", userId);
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(-2)
                                                        .message("존재하지 않는 사용자입니다.")
                                                        .build(),
                                        HttpStatus.NOT_FOUND);
                }

                UserEntity userEntity = userEntityOptional.get();

                // 현재 활성 멤버십(오늘 기준) 조회
                Optional<MembershipUserEntity> currentMembership = membershipUserRepository
                                .findActiveMembershipByUserAndDate(userEntity, MembershipState.ACTIVATE,
                                                LocalDate.now());

                if (currentMembership.isEmpty()) {
                        // 활성 멤버십이 없으면 메시지와 null 데이터 반환
                        log.info("[Membership] 활성 멤버십 없음: userId={}", userId);
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(0)
                                                        .message("현재 활성화된 구독이 없습니다.")
                                                        .data(null)
                                                        .build(),
                                        HttpStatus.OK);
                }

                // DTO 변환 (ResMembershipCurrentDTOApiV1)
                ResMembershipCurrentDTOApiV1 currentSubscription = ResMembershipCurrentDTOApiV1
                                .of(currentMembership.get());

                // 조회 완료 로깅
                log.info("[Membership] 현재 구독 조회 완료: userId={}, membershipId={}, membershipName={}",
                                userId, currentSubscription.getMembershipId(), currentSubscription.getMembershipName());

                // 표준 응답 구조로 반환
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(currentSubscription)
                                                .build(),
                                HttpStatus.OK);
        }

        // 선택 멤버십 상세 및 결제 가능 여부 조회 (업그레이드/다운그레이드 판단용)
        public HttpEntity<?> getMembershipDetailAndEligibility(Integer membershipLevel,
                        BillingCycle billingCycle,
                        Long requesterUserId,
                        List<UserAuthoritySort> requesterAuthority) {
                // 요청 정보 로깅
                log.info("[Membership] 결제 가능 여부 확인 요청: membershipLevel={}, requesterUserId={}, authorities={}",
                                membershipLevel, requesterUserId, requesterAuthority);

                // 로그인 사용자 확인
                Optional<UserEntity> requesterOpt = userRepository.findByIdAndDeleteDateIsNull(requesterUserId);
                if (requesterOpt.isEmpty()) {
                        // 사용자 미존재 시 404 반환
                        log.warn("[Membership] 요청자 정보 미존재: requesterUserId={}", requesterUserId);
                        return new ResponseEntity<>(
                                        ResDTO.builder().code(-2).message("존재하지 않는 사용자입니다.").build(),
                                        HttpStatus.NOT_FOUND);
                }

                // 선택한 멤버십 조회(삭제되지 않은 것만 허용)
                Optional<MembershipEntity> selectedOpt = membershipRepository
                                .findByLevelAndDeleteDateIsNull(membershipLevel);
                if (selectedOpt.isEmpty() || selectedOpt.get().getDeleteDate() != null) {
                        // 멤버십 미존재 또는 비활성화 시 404 반환
                        log.warn("[Membership] 조회한 멤버십이 없거나 비활성화됨: membershipLevel={}", membershipLevel);
                        return new ResponseEntity<>(
                                        ResDTO.builder().code(-3).message("존재하지 않거나 비활성화된 멤버십입니다.").build(),
                                        HttpStatus.NOT_FOUND);
                }

                MembershipEntity selectedMembership = selectedOpt.get();
                // 연간 요금 미지원 시 400 반환
                BillingCycle effectiveCycle = resolveEffectiveBillingCycle(billingCycle, requesterUserId);
                if (effectiveCycle == BillingCycle.YEARLY && selectedMembership.getPriceYearly() == null) {
                        log.warn("[Membership] 연간 요금 미지원: membershipLevel={}", membershipLevel);
                        return new ResponseEntity<>(
                                        ResDTO.builder().code(-4).message("연간 요금제를 지원하지 않는 멤버십입니다.").build(),
                                        HttpStatus.BAD_REQUEST);
                }

                UserEntity user = requesterOpt.get();
                // 현재 활성 멤버십 조회
                Optional<MembershipUserEntity> currentMembershipUser = membershipUserRepository
                                .findActiveMembershipByUserAndDate(user, MembershipState.ACTIVATE, LocalDate.now());

                // 현재 멤버십 정보 추출
                MembershipEntity currentMembership = currentMembershipUser
                                .map(MembershipUserEntity::getMembershipEntity)
                                .orElse(null);

                // 선택 멤버십과 현재 멤버십 비교 DTO 생성
                ResMembershipCheckDTOApiV1 payload = ResMembershipCheckDTOApiV1.from(selectedMembership,
                                currentMembership,
                                effectiveCycle);

                // 결과 로깅
                log.info("[Membership] 결제 가능 여부 결과: membershipId={}, currentMembershipId={}, canPurchase={}, compareResult={}",
                                payload.getId(), payload.getCurrentMembershipId(), payload.isCanPurchase(),
                                payload.getCompareResult());

                // 표준 응답 구조로 반환
                return new ResponseEntity<>(
                                ResDTO.builder().code(0).message("success").data(payload).build(),
                                HttpStatus.OK);
        }

        private BillingCycle resolveEffectiveBillingCycle(BillingCycle requestedCycle, Long userId) {
                if (requestedCycle != null) {
                        return requestedCycle;
                }
                return subscriptionRepository
                                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
                                .or(() -> subscriptionRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId,
                                                SubscriptionStatus.PENDING_CANCEL))
                                .map(SubscriptionEntity::getBillingCycle)
                                .orElse(BillingCycle.MONTHLY);
        }

        // 멤버십 프로필 요약(현재 구독, 이력, 사용량, 카탈로그 등) 조회
        public HttpEntity<?> getMembershipProfileSummary(Long targetUserId,
                        Long requesterUserId,
                        List<UserAuthoritySort> requesterAuthority,
                        Integer historyLimitInput,
                        String historyCursor) {
                // 관리자 권한 여부 판단
                boolean isAdmin = requesterAuthority != null && requesterAuthority.contains(UserAuthoritySort.ADMIN);
                // 대상 사용자 ID 결정(없으면 본인)
                Long effectiveUserId = targetUserId != null ? targetUserId : requesterUserId;

                // 사용자 정보 누락 시 400 반환
                if (effectiveUserId == null) {
                        log.warn("[Membership] 프로필 요약 요청 사용자 정보 누락 - requester={}", requesterUserId);
                        return new ResponseEntity<>(
                                        ResDTO.builder().code(-1).message("요청 대상 사용자를 확인할 수 없습니다.").build(),
                                        HttpStatus.BAD_REQUEST);
                }

                // 권한 검증(본인 또는 관리자만 허용)
                if (!isAdmin && !effectiveUserId.equals(requesterUserId)) {
                        log.warn("[Membership] 프로필 요약 권한 부족 - requester={}, target={}, authority={}",
                                        requesterUserId, effectiveUserId, requesterAuthority);
                        return new ResponseEntity<>(
                                        ResDTO.builder().code(-1).message("권한이 없습니다.").build(),
                                        HttpStatus.FORBIDDEN);
                }

                // 사용자 존재 확인
                Optional<UserEntity> userEntityOptional = userRepository.findByIdAndDeleteDateIsNull(effectiveUserId);
                if (userEntityOptional.isEmpty()) {
                        log.warn("[Membership] 프로필 요약 사용자 없음 - targetUserId={}", effectiveUserId);
                        return new ResponseEntity<>(
                                        ResDTO.builder().code(-2).message("존재하지 않는 사용자입니다.").build(),
                                        HttpStatus.NOT_FOUND);
                }

                // 이력 조회 개수 제한값 보정(1~50)
                int historyLimit = sanitizeHistoryLimit(historyLimitInput);

                UserEntity targetUser = userEntityOptional.get();
                LocalDate today = LocalDate.now();

                // 현재 활성 멤버십 조회
                Optional<MembershipUserEntity> currentMembershipOpt = membershipUserRepository
                                .findActiveMembershipByUserAndDate(targetUser, MembershipState.ACTIVATE, today);

                // 현재 활성 구독(결제) 정보 조회
                Optional<SubscriptionEntity> activeSubscriptionOpt = subscriptionRepository
                                .findByUserIdAndStatusOrderByCreatedAtDesc(effectiveUserId, SubscriptionStatus.ACTIVE);

                // 사용자 전체 구독 이력 조회(최신순)
                List<SubscriptionEntity> subscriptionHistory = subscriptionRepository
                                .findByUserIdOrderByCreatedAtDesc(effectiveUserId);
                // level, name 기준 구독 이력 맵 생성
                Map<String, SubscriptionEntity> subscriptionByLevel = buildSubscriptionLookup(subscriptionHistory);

                // 현재 멤버십 요약 DTO 생성
                ResMembershipProfileSummaryDTOApiV1.CurrentDTO currentDTO = currentMembershipOpt
                                .map(membershipUser -> buildCurrentSummary(membershipUser,
                                                activeSubscriptionOpt,
                                                subscriptionByLevel,
                                                today))
                                .orElse(null);

                // 커서 파싱(무한스크롤용)
                HistoryCursor parsedCursor = parseHistoryCursor(historyCursor);
                // Pageable 객체 생성(1개 더 조회해 hasNextPage 판단)
                Pageable pageable = PageRequest.of(0, historyLimit + 1);
                // 커서 기반 멤버십 이력 조회(최신순)
                List<MembershipUserEntity> historyEntities = membershipUserRepository.findHistoryByUserWithCursor(
                                targetUser,
                                parsedCursor != null ? parsedCursor.endDate() : null,
                                parsedCursor != null ? parsedCursor.membershipUserId() : null,
                                MAX_MEMBERSHIP_END_DATE,
                                pageable);

                // 다음 페이지 존재 여부 및 커서 계산
                boolean hasNextPage = historyEntities.size() > historyLimit;
                String nextCursor = null;
                if (hasNextPage) {
                        // 다음 커서값 생성
                        MembershipUserEntity cursorEntity = historyEntities.get(historyLimit);
                        nextCursor = buildHistoryCursorValue(cursorEntity);
                        // 실제 반환 이력은 limit 개수만
                        historyEntities = historyEntities.subList(0, historyLimit);
                }

                // 이력 DTO 리스트 변환
                List<ResMembershipProfileSummaryDTOApiV1.HistoryItemDTO> historyDTOs = historyEntities.stream()
                                .filter(entity -> entity.getMembershipEntity() == null
                                                || !"FREE".equalsIgnoreCase(entity.getMembershipEntity().getName()))
                                .map(entity -> buildHistoryItem(entity, subscriptionByLevel))
                                .collect(Collectors.toCollection(ArrayList::new));

                // 이력 페이지네이션 정보 DTO 생성
                ResMembershipProfileSummaryDTOApiV1.HistoryPageInfoDTO pageInfoDTO = ResMembershipProfileSummaryDTOApiV1.HistoryPageInfoDTO
                                .builder()
                                .nextCursor(nextCursor)
                                .hasNextPage(hasNextPage)
                                .build();

                MembershipEntity activeMembershipEntity = currentMembershipOpt
                                .map(MembershipUserEntity::getMembershipEntity)
                                .orElse(null);

                Map<String, MembershipUsageDTO> usageMap = membershipUsageService.buildUsage(
                                targetUser,
                                activeMembershipEntity,
                                ZoneId.systemDefault());
                // 사용량 DTO 변환
                ResMembershipProfileSummaryDTOApiV1.UsageDTO usageDTO = buildUsageDTO(usageMap);

                List<ResMembershipProfileSummaryDTOApiV1.PaymentDTO> paymentDTOs = fetchRecentPayments(
                                effectiveUserId,
                                DEFAULT_PAYMENT_LIMIT);

                // 최종 응답 DTO 조립
                ResMembershipProfileSummaryDTOApiV1 payload = ResMembershipProfileSummaryDTOApiV1.builder()
                                .current(currentDTO)
                                .history(historyDTOs)
                                .historyPageInfo(pageInfoDTO)
                                .usage(usageDTO)
                                .payments(paymentDTOs)
                                .build();

                // 표준 응답 구조(ResDTO)로 반환, HTTP 200
                return new ResponseEntity<>(
                                ResDTO.builder().code(0).message("success").data(payload).build(),
                                HttpStatus.OK);
        }

        // 공개 멤버십 목록 조회(FREE, 실속 점주, 성장 오너, 마스터만 노출)
        public HttpEntity<?> getPublicMembershipList() {
                // 전체 활성 멤버십 목록 조회
                List<MembershipEntity> activeList = membershipRepository.findAllActiveMembershipsSortedByOrder();
                // 노출 허용 멤버십 이름 집합
                Set<String> allowed = Set.of("실속 점주", "성장 오너", "마스터");
                // 정렬 우선순위 맵
                Map<String, Integer> order = Map.of(
                                "실속 점주", 1,
                                "성장 오너", 2,
                                "마스터", 3);

                // 허용된 멤버십만 필터링 및 정렬
                List<MembershipEntity> displayList = activeList.stream()
                                .filter(m -> m.getName() != null && allowed.contains(m.getName()))
                                .sorted(Comparator
                                                .comparing((MembershipEntity m) -> order.getOrDefault(m.getName(), 999))
                                                .thenComparing(MembershipEntity::getSortOrder)
                                                .thenComparing(MembershipEntity::getId))
                                .toList();

                // 반환 전 로그
                log.info("[Membership] 공개 멤버십 목록 반환: 개수={}", displayList.size());

                // DTO 변환 및 표준 응답 반환
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResMembershipListDTOApiV1.of(displayList))
                                                .build(),
                                HttpStatus.OK);
        }

        // 이력 조회 개수 제한값 보정(1~50)
        private int sanitizeHistoryLimit(Integer limitInput) {
                int limit = limitInput != null ? limitInput : 10; // 기본값 10
                if (limit < 1) {
                        limit = 1; // 최소 1
                }
                return Math.min(limit, 50); // 최대 50
        }

        // 구독 이력 리스트 → level/name 기준 Map 변환
        private Map<String, SubscriptionEntity> buildSubscriptionLookup(List<SubscriptionEntity> subscriptions) {
                Map<String, SubscriptionEntity> lookup = new LinkedHashMap<>();
                for (SubscriptionEntity subscription : subscriptions) {
                        // 멤버십 level(문자열) 기준으로 첫 구독만 등록
                        if (subscription.getMembershipLevel() != null && !subscription.getMembershipLevel().isBlank()) {
                                lookup.putIfAbsent(subscription.getMembershipLevel(), subscription);
                        }
                        // 멤버십 이름 기준으로도 등록(중복 방지)
                        if (subscription.getMembershipName() != null && !subscription.getMembershipName().isBlank()) {
                                lookup.putIfAbsent(subscription.getMembershipName(), subscription);
                        }
                }
                return lookup;
        }

        // 현재 멤버십 요약 DTO 생성(입력: 멤버십이력, 구독정보, 이력맵, 오늘날짜)
        private ResMembershipProfileSummaryDTOApiV1.CurrentDTO buildCurrentSummary(
                        MembershipUserEntity membershipUser,
                        Optional<SubscriptionEntity> activeSubscriptionOpt,
                        Map<String, SubscriptionEntity> subscriptionLookup,
                        LocalDate today) {
                // 연관 멤버십 엔티티 추출
                MembershipEntity membership = membershipUser.getMembershipEntity();
                // 우선: 활성 구독과 멤버십 매칭, 없으면 이력 맵에서 조회
                SubscriptionEntity subscription = activeSubscriptionOpt
                                .filter(sub -> matchesSubscription(sub, membership))
                                .orElseGet(() -> resolveSubscriptionForMembership(membership, subscriptionLookup));
                // 결제 주기: 구독에 있으면 사용, 없으면 월간 기본
                BillingCycle billingCycle = subscription != null && subscription.getBillingCycle() != null
                                ? subscription.getBillingCycle()
                                : BillingCycle.MONTHLY;
                // 잔여 일수 계산(종료일-오늘, 0 미만이면 0)
                Integer remainingDays = null;
                if (membershipUser.getEndDate() != null) {
                        long diff = ChronoUnit.DAYS.between(today, membershipUser.getEndDate());
                        remainingDays = (int) Math.max(diff, 0);
                }
                // DTO 빌더로 변환
                return ResMembershipProfileSummaryDTOApiV1.CurrentDTO.builder()
                                .membershipUserId(membershipUser.getId())
                                .membershipId(membership != null ? membership.getId() : null)
                                .membershipName(membership != null ? membership.getName() : null)
                                .billingCycle(billingCycle)
                                .startDate(membershipUser.getStartDate())
                                .endDate(membershipUser.getEndDate())
                                .remainingDays(remainingDays)
                                .compareLevel(membership != null ? membership.getLevel() : null)
                                .comparePriceMonthly(membership != null ? membership.getPrice() : null)
                                .comparePriceYearly(membership != null ? membership.getPriceYearly() : null)
                                .build();
        }

        // 멤버십 이력 DTO 생성(입력: 멤버십이력, 구독이력 맵)
        private ResMembershipProfileSummaryDTOApiV1.HistoryItemDTO buildHistoryItem(
                        MembershipUserEntity entity,
                        Map<String, SubscriptionEntity> subscriptionLookup) {
                // 연관 멤버십 엔티티 추출
                MembershipEntity membership = entity.getMembershipEntity();
                // 구독이력 맵에서 결제 주기 추출, 없으면 월간 기본
                SubscriptionEntity subscription = resolveSubscriptionForMembership(membership, subscriptionLookup);
                BillingCycle billingCycle = subscription != null && subscription.getBillingCycle() != null
                                ? subscription.getBillingCycle()
                                : BillingCycle.MONTHLY;
                // DTO 빌더로 변환
                return ResMembershipProfileSummaryDTOApiV1.HistoryItemDTO.builder()
                                .membershipUserId(entity.getId())
                                .membershipId(membership != null ? membership.getId() : null)
                                .membershipName(membership != null ? membership.getName() : null)
                                .billingCycle(billingCycle)
                                .startDate(entity.getStartDate())
                                .endDate(entity.getEndDate())
                                .state(entity.getMembershipState())
                                .build();
        }

        // 사용량 응답 DTO 생성(기본값 처리 포함)
        private ResMembershipProfileSummaryDTOApiV1.UsageDTO buildUsageDTO(Map<String, MembershipUsageDTO> usageMap) {
                // null 방지용 안전 맵
                Map<String, MembershipUsageDTO> safeUsage = usageMap != null ? usageMap : Map.of();
                // 주요 사용량 항목별 기본값 처리
                MembershipUsageDTO trackKeywords = safeUsage.getOrDefault("trackKeywords", defaultUsage());
                MembershipUsageDTO realtimeQueries = safeUsage.getOrDefault("realtimeQueries", defaultUsage());
                // 기타(확장) 사용량 항목 추출
                Map<String, MembershipUsageDTO> extras = safeUsage.entrySet()
                                .stream()
                                .filter(entry -> !CORE_USAGE_KEYS.contains(entry.getKey()))
                                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> left,
                                                HashMap::new));
                // DTO 빌더로 반환
                return ResMembershipProfileSummaryDTOApiV1.UsageDTO.builder()
                                .trackKeywords(trackKeywords)
                                .realtimeQueries(realtimeQueries)
                                .extras(extras.isEmpty() ? null : extras)
                                .build();
        }

        // 사용량 기본값(used=0, limit=0) 반환
        private MembershipUsageDTO defaultUsage() {
                return MembershipUsageDTO.builder()
                                .used(0)
                                .limit(0)
                                .period("UNKNOWN")
                                .build();
        }

        private List<ResMembershipProfileSummaryDTOApiV1.PaymentDTO> fetchRecentPayments(Long userId, int limit) {
                if (userId == null || limit <= 0) {
                        return List.of();
                }

                Pageable pageable = PageRequest.of(0, limit);
                return chargeAdapterService.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                                .getContent()
                                .stream()
                                .map(this::toPaymentDTO)
                                .collect(Collectors.toCollection(ArrayList::new));
        }

        private ResMembershipProfileSummaryDTOApiV1.PaymentDTO toPaymentDTO(ChargeEntity entity) {
                String planName = resolvePlanName(entity);
                String method = entity.getPaymentMethod() != null ? entity.getPaymentMethod().name() : null;
                String status = mapPaymentStatus(entity.getStatus());
                String paidAt = formatDateTime(entity.getPaidAt());

                return ResMembershipProfileSummaryDTOApiV1.PaymentDTO.builder()
                                .id(entity.getPaymentId())
                                .amount(entity.getAmount())
                                .planName(planName)
                                .paymentMethod(method)
                                .status(status)
                                .paidAt(paidAt)
                                .receiptUrl(null)
                                .build();
        }

        private String resolvePlanName(ChargeEntity entity) {
                if (entity.getOrderName() != null && !entity.getOrderName().isBlank()) {
                        return entity.getOrderName();
                }
                if (entity.getMembershipId() != null) {
                        return membershipRepository.findById(entity.getMembershipId())
                                        .map(MembershipEntity::getName)
                                        .orElse(null);
                }
                return null;
        }

        private String mapPaymentStatus(PaymentStatus status) {
                if (status == null) {
                        return null;
                }
                if (status == PaymentStatus.PAID) {
                        return "DONE";
                }
                return status.name();
        }

        private String formatDateTime(LocalDateTime dateTime) {
                if (dateTime == null) {
                        return null;
                }
                return dateTime.atZone(ZoneId.systemDefault()).toOffsetDateTime().toString();
        }

        // 커서 문자열 파싱(형식: endDate#membershipUserId)
        private HistoryCursor parseHistoryCursor(String cursor) {
                if (cursor == null || cursor.isBlank()) {
                        return null; // 커서 미지정 시 null
                }
                String[] parts = cursor.split("#");
                if (parts.length != 2) {
                        // 형식 오류 시 400 예외
                        throw new BadRequestException("유효하지 않은 커서 형식입니다.");
                }
                // endDate 파싱
                LocalDate cursorDate = parseCursorDate(parts[0]);
                Long cursorId;
                try {
                        // membershipUserId 파싱
                        cursorId = Long.parseLong(parts[1]);
                } catch (NumberFormatException ex) {
                        throw new BadRequestException("유효하지 않은 커서 형식입니다.");
                }
                // 커서 객체 반환
                return new HistoryCursor(cursorDate, cursorId);
        }

        // 커서 날짜 파싱(OffsetDateTime, LocalDateTime, LocalDate 지원)
        private LocalDate parseCursorDate(String raw) {
                if (raw == null || raw.isBlank()) {
                        throw new BadRequestException("유효하지 않은 커서 형식입니다.");
                }
                try {
                        return OffsetDateTime.parse(raw).toLocalDate();
                } catch (DateTimeParseException ignored) {
                }
                try {
                        return LocalDateTime.parse(raw).toLocalDate();
                } catch (DateTimeParseException ignored) {
                }
                try {
                        return LocalDate.parse(raw);
                } catch (DateTimeParseException ex) {
                        throw new BadRequestException("유효하지 않은 커서 형식입니다.");
                }
        }

        // 멤버십 이력 엔티티 → 커서 문자열 생성
        private String buildHistoryCursorValue(MembershipUserEntity entity) {
                LocalDate endDate = entity.getEndDate() != null ? entity.getEndDate() : MAX_MEMBERSHIP_END_DATE;
                // OffsetDateTime(UTC) + membershipUserId 조합
                return endDate.atStartOfDay().atOffset(ZoneOffset.UTC).toString() + "#" + entity.getId();
        }

        // 멤버십 → 구독이력 맵에서 해당 구독 찾기(level 우선, 없으면 name)
        private SubscriptionEntity resolveSubscriptionForMembership(MembershipEntity membership,
                        Map<String, SubscriptionEntity> subscriptionLookup) {
                if (membership == null || subscriptionLookup.isEmpty()) {
                        return null;
                }
                // level 기준 우선 매칭
                String levelKey = membership.getLevel() != null ? String.valueOf(membership.getLevel()) : null;
                if (levelKey != null && subscriptionLookup.containsKey(levelKey)) {
                        return subscriptionLookup.get(levelKey);
                }
                // name 기준 매칭
                String nameKey = membership.getName();
                if (nameKey != null && subscriptionLookup.containsKey(nameKey)) {
                        return subscriptionLookup.get(nameKey);
                }
                return null;
        }

        // 구독-멤버십 매칭 여부 확인(level 또는 name)
        private boolean matchesSubscription(SubscriptionEntity subscription, MembershipEntity membership) {
                if (subscription == null || membership == null) {
                        return false;
                }
                // level 일치 여부
                String levelKey = membership.getLevel() != null ? String.valueOf(membership.getLevel()) : null;
                if (levelKey != null && levelKey.equals(subscription.getMembershipLevel())) {
                        return true;
                }
                // name 일치 여부(대소문자 무시)
                String nameKey = membership.getName();
                return nameKey != null && subscription.getMembershipName() != null
                                && nameKey.equalsIgnoreCase(subscription.getMembershipName());
        }

        // 이력 커서(종료일, 멤버십유저ID) 레코드 객체
        private record HistoryCursor(LocalDate endDate, Long membershipUserId) {
        }
}
