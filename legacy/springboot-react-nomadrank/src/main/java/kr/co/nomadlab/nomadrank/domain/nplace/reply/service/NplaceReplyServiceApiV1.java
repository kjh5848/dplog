package kr.co.nomadlab.nomadrank.domain.nplace.reply.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.domain.membership.service.UsageLimitPolicy;
import kr.co.nomadlab.nomadrank.domain.nplace.reply.dto.request.ReqNplaceReplyChangeNplaceReplyDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reply.dto.response.ResNplaceReplyListDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserRepository;
import kr.co.nomadlab.nomadrank.model.nplace.reply.entity.NplaceReplyEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reply.entity.NplaceReplyLogEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reply.repository.NplaceReplyLogRepository;
import kr.co.nomadlab.nomadrank.model.nplace.reply.repository.NplaceReplyRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.naver.entity.UserNaverEntity;
import kr.co.nomadlab.nomadrank.model.user.naver.repository.UserNaverRepository;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.request.ReqPumpingstorePostSellerNvidDTO;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.request.ReqPumpingstorePutSellerNvidDTO;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.response.ResPumpingstorePostSellerNvidDTO;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.response.ResPumpingstorePutSellerNvidDTO;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.repository.PumpingstoreReplyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NplaceReplyServiceApiV1 {

        private final UserRepository userRepository;
        private final MembershipUserRepository membershipUserRepository;
        private final MembershipRepository membershipRepository;
        private final UsageLimitPolicy usageLimitPolicy;
        private final NplaceReplyRepository nplaceReplyRepository;
        private final NplaceReplyLogRepository nplaceReplyLogRepository;
        private final UserNaverRepository userNaverRepository;
        private final PumpingstoreReplyRepository pumpingstoreReplyRepository;

        public HttpEntity<?> getNplaceReplyStatusList(Long userId) {
                UserEntity userEntity = getUserEntityById(userId);
                validateMasterMembership(userEntity);
                List<NplaceReplyEntity> nplaceReplyEntityList = nplaceReplyRepository
                                .findByUserEntityId(userEntity.getId());

                log.info("[NplaceReply][Service] userId={} replyStatusCount={}", userId, nplaceReplyEntityList.size());
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResNplaceReplyListDTOApiV1.of(nplaceReplyEntityList))
                                                .build(),
                                HttpStatus.OK);
        }

        @Transactional
        public HttpEntity<?> changeNplaceReply(Long userId, ReqNplaceReplyChangeNplaceReplyDTOApiV1 reqDto) {
                UserEntity userEntity = getUserEntityById(userId);
                validateMasterMembership(userEntity);
                UserNaverEntity userNaverEntity = userNaverRepository.findByUserEntity_Id(userId)
                                .orElseThrow(() -> new AuthenticationException("네이버 인증 정보가 없습니다."));

                Optional<NplaceReplyEntity> nplaceReplyEntityOptional = nplaceReplyRepository.findByUserEntityId(userId)
                                .stream()
                                .filter(nplaceReplyEntity -> nplaceReplyEntity.getPlaceId()
                                                .equals(reqDto.getNplaceReplyInfo().getPlaceId()))
                                .findFirst();

                log.info(
                                "[NplaceReply][Service][Request] userId={} naverId={} placeId={} active={}",
                                userId,
                                userNaverEntity.getNaverId(),
                                reqDto.getNplaceReplyInfo().getPlaceId(),
                                reqDto.getNplaceReplyInfo().getActive());

                NplaceReplyEntity nplaceReplyEntity;
                NplaceReplyLogEntity nplaceReplyLogEntity;
                if (nplaceReplyEntityOptional.isPresent()) {
                        log.info("[NplaceReply][Service] existing reply found, sending Pumpingstore PUT");
                        ReqPumpingstorePutSellerNvidDTO reqPutDto = reqDto.toPumpingstorePutNvIdDTO(userNaverEntity);
                        log.info("[NplaceReply][Service][Request] Pumpingstore PUT dto={}", reqPutDto);
                        ResPumpingstorePutSellerNvidDTO resPumpingstorePutSellerNvidDTO = pumpingstoreReplyRepository
                                        .putSellerNvid(reqPutDto, userNaverEntity.getNaverId());
                        log.info("[NplaceReply][Service][Response] Pumpingstore PUT full={}",
                                        resPumpingstorePutSellerNvidDTO);
                        log.info(
                                        "[NplaceReply][Service][Response] Pumpingstore PUT code={} message={}",
                                        resPumpingstorePutSellerNvidDTO.getCode(),
                                        resPumpingstorePutSellerNvidDTO.getMessage());

                        nplaceReplyEntity = nplaceReplyEntityOptional.get();
                        nplaceReplyLogEntity = nplaceReplyEntity
                                        .toNplaceReplyLogEntity(userEntity, nplaceReplyEntity.getActive(),
                                                        reqDto.getNplaceReplyInfo().getActive());
                        nplaceReplyEntity.setActive(reqDto.getNplaceReplyInfo().getActive());

                } else {
                        log.info("[NplaceReply][Service] no existing reply, sending Pumpingstore POST");
                        ReqPumpingstorePostSellerNvidDTO reqPostDto = reqDto.toPumpingstorePostNvIdDTO(userNaverEntity);
                        log.info("[NplaceReply][Service][Request] Pumpingstore POST dto={}", reqPostDto);
                        ResPumpingstorePostSellerNvidDTO resPumpingstorePostSellerNvidDTO = pumpingstoreReplyRepository
                                        .postSellerNvid(reqPostDto);
                        log.info("[NplaceReply][Service][Response] Pumpingstore POST full={}",
                                        resPumpingstorePostSellerNvidDTO);
                        log.info(
                                        "[NplaceReply][Service][Response] Pumpingstore POST code={} message={}",
                                        resPumpingstorePostSellerNvidDTO.getCode(),
                                        resPumpingstorePostSellerNvidDTO.getMessage());

                        nplaceReplyEntity = reqDto.toEntity(userEntity);
                        nplaceReplyLogEntity = nplaceReplyEntity
                                        .toNplaceReplyLogEntity(userEntity, null, nplaceReplyEntity.getActive());
                }

                nplaceReplyRepository.save(nplaceReplyEntity);
                nplaceReplyLogRepository.save(nplaceReplyLogEntity);
                log.info(
                                "[NplaceReply][Service][Persist] userId={} replyId={} placeId={} active={}",
                                userId,
                                nplaceReplyEntity.getId(),
                                nplaceReplyEntity.getPlaceId(),
                                nplaceReplyEntity.getActive());

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
        }

        @Transactional
        public HttpEntity<?> deleteNplaceReply(Long userId) {
                UserEntity userEntity = getUserEntityById(userId);
                validateMasterMembership(userEntity);
                UserNaverEntity userNaverEntity = userNaverRepository.findByUserEntity_Id(userId)
                                .orElseThrow(() -> new AuthenticationException("네이버 인증 정보가 없습니다."));

                log.info("[NplaceReply][Service][Request] delete userId={} naverId={}", userId,
                                userNaverEntity.getNaverId());
                pumpingstoreReplyRepository.deleteSellerNvid(userNaverEntity.getNaverId());
                List<NplaceReplyEntity> nplaceReplyEntityList = nplaceReplyRepository.findByUserEntityId(userId);

                for (NplaceReplyEntity nplaceReplyEntity : nplaceReplyEntityList) {
                        nplaceReplyLogRepository.deleteByNplaceReplyEntity(nplaceReplyEntity);
                        nplaceReplyRepository.delete(nplaceReplyEntity);
                }

                log.info("[NplaceReply][Service][Response] delete userId={} removedReplies={}", userId,
                                nplaceReplyEntityList.size());
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
        }

        private UserEntity getUserEntityById(Long userId) {
                Optional<UserEntity> userEntityOptional = userRepository.findByIdAndDeleteDateIsNull(userId);
                if (userEntityOptional.isEmpty()) {
                        throw new AuthenticationException("재인증이 필요한 사용자입니다. 로그인 후 다시 시도해주세요.");
                }
                return userEntityOptional.get();
        }

        private void validateMasterMembership(UserEntity userEntity) {
                MembershipEntity membershipEntity = resolveMembership(userEntity);
                Integer limitCount = usageLimitPolicy.getDailyLimit(membershipEntity, ServiceSort.NPLACE_REVIEW_REPLY);
                if (limitCount != null && limitCount <= 0) {
                        throw new AuthenticationException("리뷰 답글 기능은 프리미엄 마스터 플랜에서만 사용할 수 있습니다.");
                }
        }

        private MembershipEntity resolveMembership(UserEntity userEntity) {
                MembershipEntity membershipEntity = membershipUserRepository
                                .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE)
                                .map(MembershipUserEntity::getMembershipEntity)
                                .orElseGet(() -> membershipRepository.findByName("FREE"));
                if (membershipEntity == null) {
                        throw new AuthenticationException("멤버십 정보를 확인할 수 없습니다.");
                }
                return membershipEntity;
        }
}
