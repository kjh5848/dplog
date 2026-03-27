package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.service;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.google.service.GoogleServiceApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request.ReqNplaceCampaignBlogWritersPostBlogWritersDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request.ReqNplaceRewardBlogWritersPostBlogWritersRegisterDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request.ReqNplaceRewardSaveBlogWritersDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request.ReqNplaceRewardUpdateBlogWritersDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.response.ResNplaceCampaignBlogWritersGetBlogWritersDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.response.ResNplaceRewardBlogWritersGetBlogWritersRegisterDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.response.ResNplaceRewardGetBlogWritersDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.response.ResNplaceRewardGetBlogWritersListDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.enums.NplaceRewardBlogWritersType;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceCampaignBlogWritersEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceCampaignBlogWritersRecruitEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceRewardBlogWritersEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceRewardBlogWritersRegisterEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.repository.NplaceCampaignBlogWritersRecruitRepository;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.repository.NplaceCampaignBlogWritersRepository;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.repository.NplaceRewardBlogWritersRegisterRepository;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.repository.NplaceRewardBlogWritersRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import kr.co.nomadlab.nomadrank.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NplaceRewardBlogWritersServiceApiV1 {

    private final UserRepository userRepository;
    private final NplaceRewardBlogWritersRepository nplaceRewardBlogWritersRepository;
    private final NplaceRewardBlogWritersRegisterRepository nplaceRewardBlogWritersRegisterRepository;

    private final GoogleServiceApiV1 googleServiceApiV1;

    @Transactional
    public HttpEntity<?> postBlogWritersRegister(ReqNplaceRewardBlogWritersPostBlogWritersRegisterDTOApiV1 reqDto, Long id) {
        UserEntity userEntity = getUserEntityById(id);

        NplaceRewardBlogWritersRegisterEntity nplaceRewardBlogWritersRegisterEntity = nplaceRewardBlogWritersRegisterRepository.save(reqDto.toNplaceRewardBlogWritersRegisterEntity(userEntity));

        try{
            Sheets sheetsService = googleServiceApiV1.getSheetsService(userEntity.getDistributorEntity().getGoogleCredentialJson());
            String spreadsheetId = UtilFunction.getSheetIdFromUrl(userEntity.getDistributorEntity().getGoogleSheetUrl());
            String range = "블로그 기자단";

            ValueRange body = new ValueRange()
                    .setValues(Collections.singletonList(
                            List.of(
                                    nplaceRewardBlogWritersRegisterEntity.getWritersType().getValue(),
                                    nplaceRewardBlogWritersRegisterEntity.getCampaignName(),
                                    nplaceRewardBlogWritersRegisterEntity.getPlaceAddress(),
                                    nplaceRewardBlogWritersRegisterEntity.getContactInfo(),
                                    nplaceRewardBlogWritersRegisterEntity.getLinkUrl(),
                                    nplaceRewardBlogWritersRegisterEntity.getMainKeyword(),
                                    nplaceRewardBlogWritersRegisterEntity.getHashtags(),
                                    nplaceRewardBlogWritersRegisterEntity.getDescription(),
                                    nplaceRewardBlogWritersRegisterEntity.getStartDate(),
                                    nplaceRewardBlogWritersRegisterEntity.getEndDate(),
                                    nplaceRewardBlogWritersRegisterEntity.getDailyOpenCount(),
                                    nplaceRewardBlogWritersRegisterEntity.getImageUrl()
                            )
                    ));

            sheetsService.spreadsheets().values().append(spreadsheetId, range, body)
                    .setValueInputOption("USER_ENTERED")
                    .execute();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error while processing Google Sheets data", e);
        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
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

    public HttpEntity<?> getBlogWritersRegister(Long id) {
        UserEntity userEntity = getUserEntityById(id);

        List<NplaceRewardBlogWritersRegisterEntity> nplaceRewardBlogWritersRegisterEntityList = nplaceRewardBlogWritersRegisterRepository.findByUserEntity(userEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRewardBlogWritersGetBlogWritersRegisterDTOApiV1.of(nplaceRewardBlogWritersRegisterEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getBlogWritersList(Long userId) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        List<NplaceRewardBlogWritersEntity> nplaceRewardBlogWritersEntityList = nplaceRewardBlogWritersRepository.findByUserEntityAndDeleteDateNull(userEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRewardGetBlogWritersListDTOApiV1.of(nplaceRewardBlogWritersEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> saveBlogWriters(Long userId, ReqNplaceRewardSaveBlogWritersDTOApiV1 reqDto) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        nplaceRewardBlogWritersRepository.findByUserEntityAndNplaceRewardBlogWritersType(userEntity, reqDto.getBlogWriters().getNplaceRewardBlogWritersType())
                .ifPresent(nplaceRewardBlogWritersEntity -> {
                    throw new BadRequestException(reqDto.getBlogWriters().getNplaceRewardBlogWritersType().getValue() + "은/는 이미 등록되어 있습니다.");
                });

        nplaceRewardBlogWritersRepository.save(reqDto.toBlogWritersEntity(userEntity));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );

    }

    @Transactional
    public HttpEntity<?> updateBlogWriters(Long userId, ReqNplaceRewardUpdateBlogWritersDTOApiV1 reqDto) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        NplaceRewardBlogWritersEntity nplaceRewardBlogWritersEntity = nplaceRewardBlogWritersRepository.findByIdAndUserEntity(reqDto.getBlogWriters().getId(), userEntity).orElseThrow(
                () -> new BadRequestException("해당 블로그 기자단이 없습니다.")
        );

        nplaceRewardBlogWritersEntity.setPrice(reqDto.getBlogWriters().getPrice());
        nplaceRewardBlogWritersEntity.setAccountNumber(reqDto.getBlogWriters().getAccountNumber());
        nplaceRewardBlogWritersEntity.setDeposit(reqDto.getBlogWriters().getDeposit());
        nplaceRewardBlogWritersEntity.setBankName(reqDto.getBlogWriters().getBankName());
        nplaceRewardBlogWritersRepository.save(nplaceRewardBlogWritersEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getBlogWriters(Long userId, String type) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        NplaceRewardBlogWritersEntity nplaceRewardBlogWritersEntity = nplaceRewardBlogWritersRepository.findByDistributorEntityAndNplaceRewardBlogWritersType(
                        userEntity.getDistributorEntity(),
                        NplaceRewardBlogWritersType.valueOf(type.toUpperCase()))
                .orElseThrow(() -> new BadRequestException("해당 블로그 기자단이 없습니다."));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRewardGetBlogWritersDTOApiV1.of(nplaceRewardBlogWritersEntity))
                        .build(),
                HttpStatus.OK
        );
    }
}
