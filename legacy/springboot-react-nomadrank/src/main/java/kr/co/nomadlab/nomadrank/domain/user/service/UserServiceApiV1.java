package kr.co.nomadlab.nomadrank.domain.user.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserStatus;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqSaveUserMembershipDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqUserDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqUserStatusDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqUserUpdateDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqUserUpdateDistributorDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.response.ResCheckUsernameDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.response.ResGetUserMembershipDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.response.ResUserDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.response.ResUserListDTOApiV1;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.distributor.repository.DistributorRepository;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserLogEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserLogRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceApiV1 {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final DistributorRepository distributorRepository;
        private final MembershipUserRepository membershipUserRepository;
        private final MembershipRepository membershipRepository;
        private final MembershipUserLogRepository membershipUserLogEntityRepository;

        public HttpEntity<?> getUserList(ResAuthInfoDTOApiV1.User user) {

                List<UserEntity> userEntityList;
                if (user.getAuthority().contains(UserAuthoritySort.ADMIN)) {
                        userEntityList = userRepository.findByAuthorityContains(UserAuthoritySort.USER);
                } else {
                        userEntityList = userRepository.findByAuthorityContainsAndDistributorEntity(
                                        UserAuthoritySort.USER, user.getDistributorEntity());
                }

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResUserListDTOApiV1.of(userEntityList))
                                                .build(),
                                HttpStatus.OK);
        }

        @Transactional
        public HttpEntity<?> saveUser(ReqUserDTOApiV1 reqDto) {
                if (userRepository.existsByUsername(reqDto.getUser().getUserName())) {
                        throw new BadRequestException("이미 존재하는 아이디입니다.");
                }

                long existCount = userRepository.countByCompanyNumber(reqDto.getUser().getCompanyNumber());
                if (existCount > 0) {
                        throw new BadRequestException("이미 등록된 사업자등록번호입니다.");
                }

                DistributorEntity AdminEntity = distributorRepository.findById(1L).get();
                UserEntity reqUserEntity = reqDto.toUserEntity(reqDto, AdminEntity);
                reqUserEntity.setPassword(passwordEncoder.encode(reqUserEntity.getPassword()));
                userRepository.save(reqUserEntity);
                assignDefaultFreeMembership(reqUserEntity);

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
        }

        @Transactional
        public HttpEntity<?> completeUser(ReqUserStatusDTOApiV1 reqDto) {
                UserEntity user = userRepository.findByUsername(reqDto.getUser().getUserName()).orElseThrow(
                                () -> new BadRequestException("유저가 존재하지 않습니다."));

                user.setStatus(UserStatus.COMPLETION);
                UserEntity saveUserEntity = userRepository.save(user);

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResUserDTOApiV1.of(saveUserEntity))
                                                .build(),
                                HttpStatus.OK);
        }

        @Transactional
        public HttpEntity<?> withdrawUser(ReqUserStatusDTOApiV1 reqDto) {
                UserEntity user = userRepository.findByUsername(reqDto.getUser().getUserName()).orElseThrow(
                                () -> new BadRequestException("유저가 존재하지 않습니다."));

                user.setStatus(UserStatus.WITHDRAW);
                UserEntity saveUserEntity = userRepository.save(user);

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResUserDTOApiV1.of(saveUserEntity))
                                                .build(),
                                HttpStatus.OK);
        }

        @Transactional
        public HttpEntity<?> updateUser(ReqUserUpdateDTOApiV1 reqDto, Long loginUserId,
                        List<UserAuthoritySort> authoritySortList) {

                if (!authoritySortList.contains(UserAuthoritySort.ADMIN)
                                && !authoritySortList.contains(UserAuthoritySort.DISTRIBUTOR_MANAGER)
                                && !Objects.equals(loginUserId, reqDto.getUser().getUserId())) {
                        throw new AuthenticationException("권한이 없습니다.");
                }

                UserEntity userEntity = userRepository.findById(reqDto.getUser().getUserId()).orElseThrow(
                                () -> new BadRequestException("해당 유저가 없습니다."));

                if (StringUtils.hasText(reqDto.getUser().getCompanyName())) {
                        userEntity.setCompanyName(reqDto.getUser().getCompanyName());
                }
                if (StringUtils.hasText(reqDto.getUser().getTel())) {
                        userEntity.setTel(reqDto.getUser().getTel());
                }
                if (StringUtils.hasText(reqDto.getUser().getPassword())) {
                        userEntity.setPassword(passwordEncoder.encode(reqDto.getUser().getPassword()));
                }
                userEntity.setStatus(reqDto.getUser().getStatus());

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
        }

        public HttpEntity<?> getUser(Long id) {
                UserEntity userEntity = userRepository.findById(id).orElseThrow(
                                () -> new BadRequestException("해당 유저가 없습니다."));

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResUserDTOApiV1.of(userEntity))
                                                .build(),
                                HttpStatus.OK);
        }

        @Transactional
        public HttpEntity<?> saveUserMembership(Long userId, ReqSaveUserMembershipDTOApiV1 reqDto) {
                UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                                () -> new BadRequestException("해당 유저가 없습니다."));
                MembershipEntity membershipEntity = membershipRepository
                                .findById(reqDto.getMembership().getMembershipId()).orElseThrow(
                                                () -> new BadRequestException("해당 멤버십이 없습니다."));

                LocalDate reqStartDate = reqDto.getMembership().getStartDateAsLocalDate();

                membershipUserRepository
                                .findActiveMembershipByUserAndDate(userEntity, MembershipState.ACTIVATE, reqStartDate)
                                .ifPresent(
                                                membershipUserEntity -> {
                                                        throw new BadRequestException("해당 날짜에 이미 활성화된 멤버십이 존재합니다.");
                                                });

                MembershipUserEntity reqMembershipUserEntity = reqDto.toMembershipUserEntity(userEntity,
                                membershipEntity);
                if (reqMembershipUserEntity.getMembershipState().equals(MembershipState.ACTIVATE)) {
                        membershipUserRepository
                                        .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE)
                                        .ifPresent(
                                                        membershipUserEntity -> {
                                                                throw new BadRequestException("이미 활성화된 멤버십이 있습니다.");
                                                        });
                }

                MembershipUserEntity membershipUserEntity = membershipUserRepository.save(reqMembershipUserEntity);
                membershipUserLogEntityRepository.save(
                                MembershipUserLogEntity.builder()
                                                .membershipUserEntity(membershipUserEntity)
                                                .action("SAVE")
                                                .startDate(membershipUserEntity.getStartDate())
                                                .endDate(membershipUserEntity.getEndDate())
                                                .membershipState(membershipUserEntity.getMembershipState())
                                                .build());

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
        }

        public HttpEntity<?> getUserMembership(Long userId) {
                List<MembershipUserEntity> membershipUserEntityList = membershipUserRepository
                                .findByUserEntity_Id(userId);
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResGetUserMembershipDTOApiV1.of(membershipUserEntityList))
                                                .build(),
                                HttpStatus.OK);
        }

        @Transactional
        public HttpEntity<?> updateDistributor(ReqUserUpdateDistributorDTOApiV1 reqDto,
                        List<UserAuthoritySort> authoritySortList) {
                if (!authoritySortList.contains(UserAuthoritySort.ADMIN)) {
                        throw new AuthenticationException("권한이 없습니다.");
                }

                UserEntity userEntity = userRepository.findById(reqDto.getUser().getUserId()).orElseThrow(
                                () -> new BadRequestException("해당 유저가 없습니다."));

                DistributorEntity distributorEntity = distributorRepository
                                .findById(reqDto.getUser().getDistirbutorId()).orElseThrow(
                                                () -> new BadRequestException("해당 관리자가 없습니다."));

                userEntity.setDistributorEntity(distributorEntity);
                userRepository.save(userEntity);

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);

        }

        @Transactional
        public HttpEntity<?> toggleUserMembership(Long membershipUserId) {
                MembershipUserEntity membershipUserEntity = membershipUserRepository.findById(membershipUserId).get();

                if (membershipUserEntity.getMembershipState().equals(MembershipState.ACTIVATE)) {
                        membershipUserEntity.setMembershipState(MembershipState.EXPIRED);
                } else if (membershipUserEntity.getMembershipState().equals(MembershipState.EXPIRED)) {
                        membershipUserEntity.setMembershipState(MembershipState.ACTIVATE);
                } else {
                        throw new BadRequestException("해당 멤버십은 변경할 수 없습니다.");
                }

                membershipUserRepository.save(membershipUserEntity);

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
        }

        public HttpEntity<?> checkUsernameDuplicate(String username) {
                boolean exists = userRepository.existsByUsername(username);

                if (exists) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(-1)
                                                        .message("이미 존재하는 아이디입니다.")
                                                        .data(null)
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }

                ResCheckUsernameDTOApiV1 res = new ResCheckUsernameDTOApiV1(username, true);

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("사용 가능한 아이디입니다.")
                                                .data(res)
                                                .build(),
                                HttpStatus.OK);
        }

        private void assignDefaultFreeMembership(UserEntity user) {
                if (membershipUserRepository.findByUserEntityAndMembershipState(user, MembershipState.ACTIVATE)
                                .isPresent()) {
                        log.info("사용자 {} 는 이미 활성 멤버십을 보유하고 있습니다.", user.getUsername());
                        return;
                }

                MembershipEntity freeMembership = membershipRepository.findByName("FREE");
                if (freeMembership == null) {
                        log.warn("FREE 멤버십 엔티티를 찾을 수 없어 기본 멤버십을 할당하지 못했습니다.");
                        return;
                }

                MembershipUserEntity membershipUser = MembershipUserEntity.builder()
                                .userEntity(user)
                                .membershipEntity(freeMembership)
                                .startDate(LocalDate.now())
                                .endDate(null)
                                .membershipState(MembershipState.ACTIVATE)
                                .build();
                membershipUserRepository.save(membershipUser);

                membershipUserLogEntityRepository.save(MembershipUserLogEntity.builder()
                                .membershipUserEntity(membershipUser)
                                .action("ASSIGN_DEFAULT_FREE")
                                .startDate(membershipUser.getStartDate())
                                .endDate(membershipUser.getEndDate())
                                .membershipState(membershipUser.getMembershipState())
                                .build());

                log.info("FREE 멤버십 자동 할당 완료 - user={}", user.getUsername());
        }
}
