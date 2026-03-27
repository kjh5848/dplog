package kr.co.nomadlab.nomadrank.domain.nplace.keyword.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.domain.nplace.keyword.constraint.NplaceKeywordRequestType;
import kr.co.nomadlab.nomadrank.domain.nplace.keyword.dto.response.ResNplaceKeywordGetNblogSearchInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.keyword.dto.response.ResNplaceKeywordGetNsearchadKeywordstoolDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.domain.membership.service.UsageLimitPolicy;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankShopTrackInfoPointHistoryRepository;
import kr.co.nomadlab.nomadrank.model.use_log.entity.UseLogEntity;
import kr.co.nomadlab.nomadrank.model.use_log.repository.UseLogRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import kr.co.nomadlab.nomadrank.model_external.nblog.dto.response.ResNblogSearchInfoDTO;
import kr.co.nomadlab.nomadrank.model_external.nblog.repository.NblogRepository;
import kr.co.nomadlab.nomadrank.model_external.nsearchad.dto.response.ResNsearchadKeywordstoolDTO;
import kr.co.nomadlab.nomadrank.model_external.nsearchad.repository.NsearchadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NplaceKeywordServiceApiV1 {

    private final UserRepository userRepository;

    private final NsearchadRepository nsearchadRepository;
    private final NblogRepository nblogRepository;
    private final NplaceRankShopTrackInfoPointHistoryRepository nplaceRankShopTrackInfoPointHistoryRepository;
    private final UseLogRepository useLogRepository;

    private final MembershipUserRepository membershipUserRepository;
    private final MembershipRepository membershipRepository;
    private final UsageLimitPolicy usageLimitPolicy;

    @Transactional
    public HttpEntity<?> getNsearchadKeywordstoolRelation(List<String> keywordList, NplaceKeywordRequestType requestType, Long userId) {

        UserEntity userEntity = getUserEntityById(userId);

        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.plusDays(1).atStartOfDay();

        // find user membership
        Optional<MembershipUserEntity> membershipUserEntityOptional = membershipUserRepository.findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE);
        MembershipEntity membershipEntity;
        if (membershipUserEntityOptional.isEmpty()) {
            membershipEntity = membershipRepository.findByName("FREE");
        } else {
            membershipEntity = membershipUserEntityOptional.get().getMembershipEntity();
        }
        log.info("membership: {}", membershipEntity.getName());

        Integer limitCount = usageLimitPolicy.getDailyLimit(membershipEntity, ServiceSort.NPLACE_KEYWORD_RELATION);

        int useCount = Math.toIntExact(useLogRepository.countByUserEntityAndServiceSortAndCreateDateBetween(userEntity,
                ServiceSort.NPLACE_KEYWORD_RELATION, dayStart, dayEnd));
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
        useLogRepository.save(UseLogEntity.builder()
                .userEntity(userEntity)
                .serviceSort(ServiceSort.NPLACE_KEYWORD_RELATION)
                .build());

        if (keywordList.stream().anyMatch(thisKeyword -> thisKeyword == null || thisKeyword.isBlank())) {
            throw new BadRequestException("키워드가 비어있습니다.");
        }
        String keyword;
        if (NplaceKeywordRequestType.RELATION.equals(requestType)) {
            keyword = keywordList.get(0);
        } else {
            keyword = String.join(",", keywordList.stream().map(thisKeyword -> thisKeyword.replaceAll(" ", "")).toList());
        }
        ResNsearchadKeywordstoolDTO resNsearchadKeywordstoolDTO = nsearchadRepository.getKeywordstool(keyword);
        List<ResNsearchadKeywordstoolDTO.Keyword> resNsearchadKeywordstoolKeywordList;
        if (NplaceKeywordRequestType.RELATION.equals(requestType)) {
            resNsearchadKeywordstoolKeywordList = resNsearchadKeywordstoolDTO.getKeywordList();
        } else {
            resNsearchadKeywordstoolKeywordList = resNsearchadKeywordstoolDTO.getKeywordList().subList(0, keywordList.size());
        }

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceKeywordGetNsearchadKeywordstoolDTOApiV1.of(resNsearchadKeywordstoolKeywordList))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> getNsearchadKeywordstool(String keywordString, Long userId) {

        UserEntity userEntity = getUserEntityById(userId);

        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.plusDays(1).atStartOfDay();

        // find user membership
        Optional<MembershipUserEntity> membershipUserEntityOptional = membershipUserRepository.findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE);
        MembershipEntity membershipEntity;
        if (membershipUserEntityOptional.isEmpty()) {
            membershipEntity = membershipRepository.findByName("FREE");
        } else {
            membershipEntity = membershipUserEntityOptional.get().getMembershipEntity();
        }
        log.info("membership: {}", membershipEntity.getName());

        Integer limitCount = usageLimitPolicy.getDailyLimit(membershipEntity, ServiceSort.NPLACE_KEYWORD);

        int useCount = Math.toIntExact(useLogRepository.countByUserEntityAndServiceSortAndCreateDateBetween(userEntity,
                ServiceSort.NPLACE_KEYWORD, dayStart, dayEnd));
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
        useLogRepository.save(UseLogEntity.builder()
                .userEntity(userEntity)
                .serviceSort(ServiceSort.NPLACE_KEYWORD)
                .build());
        
        String[] keywordList = keywordString.split("\\r?\\n");
        List<ResNsearchadKeywordstoolDTO.Keyword> resNsearchadKeywordstoolKeywordList = new ArrayList<>();
        for (String keyword : keywordList) {
            ResNsearchadKeywordstoolDTO resNsearchadKeywordstoolDTO = nsearchadRepository.getKeywordstool(keyword);
            resNsearchadKeywordstoolKeywordList.add(resNsearchadKeywordstoolDTO.getKeywordList().get(0));
        }

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceKeywordGetNsearchadKeywordstoolDTOApiV1.of(resNsearchadKeywordstoolKeywordList))
                        .build(),
                HttpStatus.OK
        );
    }



    public HttpEntity<?> getNblogSearchInfo(String keyword) {
        ResNblogSearchInfoDTO resNblogSearchInfoDTO = nblogRepository.getNblogSearchInfo(keyword);
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(
                                ResNplaceKeywordGetNblogSearchInfoDTOApiV1.of(resNblogSearchInfoDTO.getResult())
                        )
                        .build(),
                HttpStatus.OK
        );
    }

    private UserEntity getUserEntityById(Long userId) {
        Optional<UserEntity> userEntityOptional = userRepository.findByIdAndDeleteDateIsNull(userId);
        if (userEntityOptional.isEmpty()) {
            throw new AuthenticationException("재인증이 필요한 사용자입니다. 로그인 후 다시 시도해주세요.");
        }
        return userEntityOptional.get();
    }

}
