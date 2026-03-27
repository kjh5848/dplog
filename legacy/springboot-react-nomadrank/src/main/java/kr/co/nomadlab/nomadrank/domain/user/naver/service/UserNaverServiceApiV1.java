package kr.co.nomadlab.nomadrank.domain.user.naver.service;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.user.naver.dto.request.ReqUserNaverDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.naver.dto.response.ResUserNaverDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.naver.dto.response.ResUserNaverStatusDTOApiV1;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.naver.entity.UserNaverEntity;
import kr.co.nomadlab.nomadrank.model.user.naver.repository.UserNaverRepository;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserNaverServiceApiV1 {

    private final UserNaverRepository userNaverRepository;
    private final UserRepository userRepository;

    public HttpEntity<?> getUserNaverStatus(Long id) {
        boolean exists = userNaverRepository.existsByUserEntity_Id(id);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResUserNaverStatusDTOApiV1.of(exists))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getUserNaver(Long id) {
        UserNaverEntity userNaverEntity = userNaverRepository.findByUserEntity_Id(id).orElseThrow(
                () -> new BadRequestException("해당 유저의 네이버 정보가 없습니다.")
        );

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResUserNaverDTOApiV1.of(userNaverEntity))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> saveUserNaver(Long userId, ReqUserNaverDTOApiV1 reqDto) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );
        if (userNaverRepository.existsByUserEntity_Id(userId)) {
            throw new BadRequestException("이미 네이버 정보가 등록되어 있습니다.");
        }

        userNaverRepository.save(reqDto.toUserNaverEntity(userEntity));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> updateUserNaver(Long userId, ReqUserNaverDTOApiV1 reqDto) {
        UserNaverEntity userNaverEntity = userNaverRepository.findByUserEntity_Id(userId).orElseThrow(
                () -> new BadRequestException("해당 유저의 네이버 정보가 없습니다.")
        );
        userNaverEntity.setNaverId(reqDto.getUserNaver().getNaverId());
        userNaverEntity.setNaverPw(reqDto.getUserNaver().getNaverPw());
        userNaverRepository.save(userNaverEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }
}
