package kr.co.nomadlab.nomadrank.domain.distributor.service;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.distributor.dto.request.ReqDistributorDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.distributor.dto.request.ReqDistributorUpdateDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.distributor.dto.response.ResDistributorDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.distributor.dto.response.ResDistributorListDTOApiV1;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.distributor.repository.DistributorRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DistributorServiceApiV1 {

    private final UserRepository userRepository;
    private final DistributorRepository distributorRepository;
    private final PasswordEncoder passwordEncoder;

    public HttpEntity<?> getDistributorList() {

//        List<UserEntity> userEntityList = userRepository.findByAuthorityContains(UserAuthoritySort.DISTRIBUTOR_MANAGER);
        List<UserEntity> userEntityList = userRepository.findByAuthorityIn(List.of(UserAuthoritySort.DISTRIBUTOR_MANAGER, UserAuthoritySort.ADMIN));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResDistributorListDTOApiV1.of(userEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getDistributor(Long userId) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResDistributorDTOApiV1.of(userEntity))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> saveDistributor(ReqDistributorDTOApiV1 reqDto) {
        DistributorEntity saveDistributorEntity = distributorRepository.save(reqDto.toDistributorEntity(reqDto));
        UserEntity reqUserEntity = reqDto.toUserEntity(reqDto, saveDistributorEntity);
        reqUserEntity.setPassword(passwordEncoder.encode(reqUserEntity.getPassword()));
        UserEntity saveUserEntity = userRepository.save(reqUserEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResDistributorDTOApiV1.of(saveUserEntity))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> updateDistributor(ReqDistributorUpdateDTOApiV1 reqDto, Long loginUserId, List<UserAuthoritySort> authoritySortList) {
        if (!authoritySortList.contains(UserAuthoritySort.ADMIN) && !Objects.equals(loginUserId, reqDto.getDistributor().getUserId())) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        DistributorEntity distributorEntity = distributorRepository.findById(reqDto.getDistributor().getDistributorId()).orElseThrow(
                () -> new BadRequestException("해당 관리자가 없습니다.")
        );
        UserEntity userEntity = userRepository.findById(reqDto.getDistributor().getUserId()).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        if (StringUtils.hasText(reqDto.getDistributor().getEmail())) {
            distributorEntity.setEmail(reqDto.getDistributor().getEmail());
        }
        if (StringUtils.hasText(reqDto.getDistributor().getDeposit())) {
            distributorEntity.setDeposit(reqDto.getDistributor().getDeposit());
        }
        if (StringUtils.hasText(reqDto.getDistributor().getAccountNumber())) {
            distributorEntity.setAccountNumber(reqDto.getDistributor().getAccountNumber());
        }
        if (StringUtils.hasText(reqDto.getDistributor().getBankName())) {
            distributorEntity.setBankName(reqDto.getDistributor().getBankName());
        }
        if (StringUtils.hasText(reqDto.getDistributor().getGoogleSheetUrl())) {
            distributorEntity.setGoogleSheetUrl(reqDto.getDistributor().getGoogleSheetUrl());
        }
        if (StringUtils.hasText(reqDto.getDistributor().getGoogleCredentialJson())) {
            distributorEntity.setGoogleCredentialJson(reqDto.getDistributor().getGoogleCredentialJson());
        }
        if (StringUtils.hasText(reqDto.getDistributor().getMemo())) {
            distributorEntity.setMemo(reqDto.getDistributor().getMemo());
        }
        if (StringUtils.hasText(reqDto.getDistributor().getTel())) {
            userEntity.setTel(reqDto.getDistributor().getTel());
        }
        if (StringUtils.hasText(reqDto.getDistributor().getPassword())) {
            userEntity.setPassword(passwordEncoder.encode(reqDto.getDistributor().getPassword()));
        }

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }
}
