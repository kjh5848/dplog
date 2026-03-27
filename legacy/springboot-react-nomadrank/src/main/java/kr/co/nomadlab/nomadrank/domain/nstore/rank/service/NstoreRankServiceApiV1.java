package kr.co.nomadlab.nomadrank.domain.nstore.rank.service;

import com.fasterxml.jackson.databind.JsonNode;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.common.exception.EntityAlreadyExistException;
import kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.request.ReqNstoreRankPostProductDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.response.ResNstoreRankGetProductTableDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.response.ResNstoreRankGetProductWithIdDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.response.ResNstoreRankPostProductTableDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.response.ResNstoreRankPostTrackDTOApiV1;
import kr.co.nomadlab.nomadrank.model.nstore.rank.entity.NstoreRankProductEntity;
import kr.co.nomadlab.nomadrank.model.nstore.rank.entity.NstoreRankProductTrackInfoEntity;
import kr.co.nomadlab.nomadrank.model.nstore.rank.repository.NstoreRankProductRepository;
import kr.co.nomadlab.nomadrank.model.nstore.rank.repository.NstoreRankProductTrackInfoRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.request.ReqNomadscrapNstoreRankPostTrackChartDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.request.ReqNomadscrapNstoreRankPostTrackInfoDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response.ResNomadscrapNstoreRankPostTrackChartDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response.ResNomadscrapNstoreRankPostTrackDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response.ResNomadscrapNstoreRankPostTrackInfoDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NstoreRankServiceApiV1 {

    private final UserRepository userRepository;

    private final NstoreRankProductRepository nstoreRankProductRepository;
    private final NstoreRankProductTrackInfoRepository nstoreRankProductTrackInfoRepository;

    private final NomadscrapNstoreRankRealtimeRepository nomadscrapNstoreRankRealtimeRepository;
    private final NomadscrapNstoreRankTrackableRepository nomadscrapNstoreRankTrackableRepository;
    private final NomadscrapNstoreRankTrackRepository nomadscrapNstoreRankTrackRepository;
    private final NomadscrapNstoreRankTrackInfoRepository nomadscrapNstoreRankTrackInfoRepository;
    private final NomadscrapNstoreRankTrackChartRepository nomadscrapNstoreRankTrackChartRepository;

    public HttpEntity<?> getRealtime(String keyword, String filterType, String filterValue, boolean compare) {
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(nomadscrapNstoreRankRealtimeRepository.getRealtime(keyword, filterType, filterValue, compare).getData())
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getTrackable(String url) {
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(nomadscrapNstoreRankTrackableRepository.getTrackable(url).getData())
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getProductTable(Long userId) {
        UserEntity userEntity = getUserEntityById(userId);
        List<NstoreRankProductEntity> nstoreRankProductEntityList = nstoreRankProductRepository.findByUserEntity(userEntity);
        List<Long> nomadscrapRankTrackInfoIdList = new ArrayList<>();
        nstoreRankProductEntityList.forEach(thisNstoreRankProductEntity -> {
            thisNstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList().forEach(thisNstoreRankProductTrackInfoEntity -> {
                nomadscrapRankTrackInfoIdList.add(thisNstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId());
            });
        });
        ResNomadscrapNstoreRankPostTrackInfoDTO resNomadscrapNstoreRankPostTrackInfoDTO = nomadscrapNstoreRankTrackInfoRepository.postTrackInfo(
                ReqNomadscrapNstoreRankPostTrackInfoDTO.builder()
                        .nstoreRankTrackInfoIdList(nomadscrapRankTrackInfoIdList)
                        .build()
        );
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreRankGetProductTableDTOApiV1.of(
                                nstoreRankProductEntityList,
                                resNomadscrapNstoreRankPostTrackInfoDTO)
                        )
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> getProductWithId(Long userId, Long id) {
        UserEntity userEntity = getUserEntityById(userId);
        Optional<NstoreRankProductEntity> nstoreRankProductEntityOptional = nstoreRankProductRepository.findById(id);
        if (nstoreRankProductEntityOptional.isEmpty()) {
            throw new BadRequestException("존재하지 않는 상품입니다.");
        }
        if (!nstoreRankProductEntityOptional.get().getUserEntity().getId().equals(userEntity.getId())) {
            throw new AuthenticationException("권한이 없습니다.");
        }
        NstoreRankProductEntity nstoreRankProductEntity = nstoreRankProductEntityOptional.get();
//        ResNomadscrapNstoreRankPostTrackInfoDTO resNomadscrapNstoreRankPostTrackInfoDTO = nomadscrapNstoreRankTrackInfoRepository.postTrackInfo(
//                ReqNomadscrapNstoreRankPostTrackInfoDTO.builder()
//                        .nstoreRankTrackInfoIdList(nstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList().stream().map(NstoreRankProductTrackInfoEntity::getNomadscrapNstoreRankTrackInfoId).toList())
//                        .build()
//        );
        ResNomadscrapNstoreRankPostTrackChartDTO resNomadscrapNstoreRankPostTrackChartDTO = nomadscrapNstoreRankTrackChartRepository.postTrackChart(
                ReqNomadscrapNstoreRankPostTrackChartDTO.builder()
                        .nstoreRankTrackInfoList(nstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList()
                                .stream()
                                .map(thisNstoreRankProductTrackInfoEntity -> ReqNomadscrapNstoreRankPostTrackChartDTO.NstoreRankTrackInfo.builder()
                                        .id(thisNstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId())
                                        .trackStartDate(thisNstoreRankProductTrackInfoEntity.getCreateDate())
                                        .build())
                                .toList())
                        .build()
        );
        if (!resNomadscrapNstoreRankPostTrackChartDTO.getData().getNstoreRankTrackInfoMap().isEmpty()) {
            JsonNode jsonNode = resNomadscrapNstoreRankPostTrackChartDTO.getData().getNstoreRankTrackInfoMap().values().stream().findFirst().get().getJson();
            if (jsonNode.get("trackInfo") != null && !jsonNode.get("trackInfo").isNull()) {
                nstoreRankProductEntity.setProductId(jsonNode.get("trackInfo").get("productId").asText());
                nstoreRankProductEntity.setMid(jsonNode.get("trackInfo").get("mid").asText());
                nstoreRankProductEntity.setProductName(jsonNode.get("trackInfo").get("productName").asText());
                nstoreRankProductEntity.setProductImageUrl(jsonNode.get("trackInfo").get("productImageUrl").asText());
                nstoreRankProductEntity.setCategory(jsonNode.get("trackInfo").get("category").asText());
                nstoreRankProductEntity.setPrice(jsonNode.get("trackInfo").get("price").asText());
                nstoreRankProductEntity.setMallName(jsonNode.get("trackInfo").get("mallName").asText());
                nstoreRankProductEntity.setReviewCount(jsonNode.get("trackInfo").get("reviewCount").asText());
                nstoreRankProductEntity.setScoreInfo(jsonNode.get("trackInfo").get("scoreInfo").asText());
            }
        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreRankGetProductWithIdDTOApiV1.of(nstoreRankProductEntity, resNomadscrapNstoreRankPostTrackChartDTO))
                        .build(),
                HttpStatus.OK
        );

    }

    @Transactional
    public HttpEntity<?> postProductTable(Long userId, ReqNstoreRankPostProductDTOApiV1 reqDto) {
        UserEntity userEntity = getUserEntityById(userId);
        if (reqDto.getNstoreRankProduct().getProductId() == null && reqDto.getNstoreRankProduct().getMid() == null) {
            throw new BadRequestException("productId 또는 mid 중 하나는 필수입니다.");
        }
        nstoreRankProductRepository.findByUserEntityAndMidAndMidIsNotNull(userEntity, reqDto.getNstoreRankProduct().getMid())
                .ifPresent(nstoreRankProductEntity -> {
                    throw new EntityAlreadyExistException("이미 등록된 상품입니다.");
                });
        nstoreRankProductRepository.findByUserEntityAndProductIdAndProductIdIsNotNull(userEntity, reqDto.getNstoreRankProduct().getProductId())
                .ifPresent(nstoreRankProductEntity -> {
                    throw new EntityAlreadyExistException("이미 등록된 상품입니다.");
                });
//        nstoreRankProductRepository.findByUserEntityAndProductIdOrMid(userEntity, reqDto.getNstoreRankProduct().getProductId(), reqDto.getNstoreRankProduct().getMid())
//                .ifPresent(nstoreRankProductEntity -> {
//                    throw new EntityAlreadyExistException("이미 등록된 상품입니다.");
//                });
        nstoreRankProductRepository.save(reqDto.getNstoreRankProduct().toEntity(userEntity));
        List<NstoreRankProductEntity> nstoreRankProductEntityList = nstoreRankProductRepository.findByUserEntity(userEntity);
        List<Long> nomadscrapRankTrackInfoIdList = new ArrayList<>();
        nstoreRankProductEntityList.forEach(thisNstoreRankProductEntity -> {
            thisNstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList().forEach(thisNstoreRankProductTrackInfoEntity -> {
                nomadscrapRankTrackInfoIdList.add(thisNstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId());
            });
        });
        ResNomadscrapNstoreRankPostTrackInfoDTO resNomadscrapNstoreRankPostTrackInfoDTO = nomadscrapNstoreRankTrackInfoRepository.postTrackInfo(
                ReqNomadscrapNstoreRankPostTrackInfoDTO.builder()
                        .nstoreRankTrackInfoIdList(nomadscrapRankTrackInfoIdList)
                        .build()
        );
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreRankPostProductTableDTOApiV1.of(
                                nstoreRankProductEntityList,
                                resNomadscrapNstoreRankPostTrackInfoDTO)
                        )
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> deleteProductWithId(Long userId, Long id) {
        UserEntity userEntity = getUserEntityById(userId);
        Optional<NstoreRankProductEntity> nstoreRankProductEntityOptional = nstoreRankProductRepository.findById(id);
        if (nstoreRankProductEntityOptional.isEmpty()) {
            throw new BadRequestException("존재하지 않는 상품입니다.");
        }
        NstoreRankProductEntity nstoreRankProductEntity = nstoreRankProductEntityOptional.get();
        if (!nstoreRankProductEntity.getUserEntity().getId().equals(userEntity.getId())) {
            throw new AuthenticationException("권한이 없습니다.");
        }
        List<NstoreRankProductTrackInfoEntity> nstoreRankProductTrackInfoEntityList = nstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList();
        nstoreRankProductTrackInfoEntityList.forEach(thisNstoreRankProductTrackInfoEntity -> {
            List<NstoreRankProductTrackInfoEntity> nstoreRankProductTrackInfoEntityListForDelete = nstoreRankProductTrackInfoRepository.findByNomadscrapNstoreRankTrackInfoId(thisNstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId());
            if (nstoreRankProductTrackInfoEntityListForDelete.size() < 2) {
                nomadscrapNstoreRankTrackRepository.deleteTrack(thisNstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId());
            }
        });
        nstoreRankProductRepository.delete(nstoreRankProductEntity);
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> postTrack(Long userId, ReqNstoreRankPostTrackDTOApiV1 reqDto) {
        UserEntity userEntity = getUserEntityById(userId);
        if (reqDto.getNstoreRankTrackInfo().getProductId() == null && reqDto.getNstoreRankTrackInfo().getMid() == null) {
            throw new BadRequestException("productId 또는 mid 중 하나는 필수입니다.");
        }
        ResNomadscrapNstoreRankPostTrackDTO resNomadscrapNstoreRankPostTrackDTO = nomadscrapNstoreRankTrackRepository.postTrack(reqDto.toNomadscrapDTO());
//        Optional<NstoreRankProductEntity> nstoreRankProductEntityOptional = nstoreRankProductRepository.findByUserEntityAndProductIdOrMid(
//                userEntity,
//                resNomadscrapNstoreRankPostTrackDTO.getData().getNstoreRankTrackInfo().getProductId(),
//                resNomadscrapNstoreRankPostTrackDTO.getData().getNstoreRankTrackInfo().getMid()
//        );
        Optional<NstoreRankProductEntity> nstoreRankProductEntityOptional;
        if (reqDto.getNstoreRankTrackInfo().getMid() != null) {
            nstoreRankProductEntityOptional = nstoreRankProductRepository.findByUserEntityAndMidAndMidIsNotNull(
                    userEntity,
                    reqDto.getNstoreRankTrackInfo().getMid()
            );
        } else {
            nstoreRankProductEntityOptional = nstoreRankProductRepository.findByUserEntityAndProductIdAndProductIdIsNotNull(
                    userEntity,
                    reqDto.getNstoreRankTrackInfo().getProductId()
            );
        }
        NstoreRankProductEntity nstoreRankProductEntity = nstoreRankProductEntityOptional.orElseGet(() -> nstoreRankProductRepository.save(resNomadscrapNstoreRankPostTrackDTO.getData().getNstoreRankTrackInfo().toRankProductEntity(userEntity)));
        if (
                nstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList()
                        .stream()
                        .anyMatch(thisNstoreRankProductTrackInfoEntity -> thisNstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId().equals(resNomadscrapNstoreRankPostTrackDTO.getData().getNstoreRankTrackInfo().getId()))
        ) {
            throw new EntityAlreadyExistException("이미 등록된 키워드입니다.");
        }
        NstoreRankProductTrackInfoEntity nstoreRankProductTrackInfoEntity = nstoreRankProductTrackInfoRepository.save(
                NstoreRankProductTrackInfoEntity.builder()
                        .nstoreRankProductEntity(nstoreRankProductEntity)
                        .nomadscrapNstoreRankTrackInfoId(resNomadscrapNstoreRankPostTrackDTO.getData().getNstoreRankTrackInfo().getId())
                        .build()
        );
        nstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList().add(nstoreRankProductTrackInfoEntity);
        ResNomadscrapNstoreRankPostTrackInfoDTO resNomadscrapNstoreRankPostTrackInfoDTO = nomadscrapNstoreRankTrackInfoRepository.postTrackInfo(
                ReqNomadscrapNstoreRankPostTrackInfoDTO.builder()
                        .nstoreRankTrackInfoIdList(nstoreRankProductEntity.getNstoreRankProductTrackInfoEntityList().stream().map(NstoreRankProductTrackInfoEntity::getNomadscrapNstoreRankTrackInfoId).toList())
                        .build()
        );
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreRankPostTrackDTOApiV1.of(nstoreRankProductEntity, resNomadscrapNstoreRankPostTrackInfoDTO))
                        .build(),
                HttpStatus.OK
        );
    }

//    public HttpEntity<?> postTrackInfo(Long userId, ReqNomadscrapNstoreRankPostTrackInfoDTO reqDto) {
//        UserEntity userEntity = getUserEntityById(userId);
//        return null;
//    }

//    public HttpEntity<?> postTrackChart(Long userId, ReqNstoreRankPostTrackChartDTOApiV1 reqDto) {
//        UserEntity userEntity = getUserEntityById(userId);
//        Long count = nstoreRankProductTrackInfoRepository.countByNstoreRankProductEntity_UserEntityAndNomadscrapNstoreRankTrackInfoIdIn(
//                userEntity,
//                reqDto.getNstoreRankTrackInfoList()
//                        .stream()
//                        .map(ReqNstoreRankPostTrackChartDTOApiV1.NstoreRankTrackInfo::getNomadscrapNstoreRankTrackInfoId)
//                        .toList()
//        );
//        if (count != reqDto.getNstoreRankTrackInfoList().size()) {
//            throw new BadRequestException("유효하지 않은 요청입니다.");
//        }
//        ResNomadscrapNstoreRankPostTrackChartDTO resNomadscrapNstoreRankPostTrackChartDTO = nomadscrapNstoreRankTrackChartRepository.postTrackChart(reqDto.toNomadscrapDTO());
//        return new ResponseEntity<>(
//                ResDTO.builder()
//                        .code(0)
//                        .message("success")
//                        .data(resNomadscrapNstoreRankPostTrackChartDTO.getData())
//                        .build(),
//                HttpStatus.OK
//        );
//    }

    @Transactional
    public HttpEntity<?> deleteTrack(Long userId, Long id) {
        UserEntity userEntity = getUserEntityById(userId);

        Optional<NstoreRankProductTrackInfoEntity> nstoreRankProductTrackInfoEntityOptional = nstoreRankProductTrackInfoRepository.findById(id);
        if (nstoreRankProductTrackInfoEntityOptional.isEmpty()) {
            throw new BadRequestException("존재하지 않는 추적 정보입니다.");
        }
        NstoreRankProductTrackInfoEntity nstoreRankProductTrackInfoEntity = nstoreRankProductTrackInfoEntityOptional.get();
        if (!nstoreRankProductTrackInfoEntity.getNstoreRankProductEntity().getUserEntity().getId().equals(userEntity.getId())) {
            throw new AuthenticationException("권한이 없습니다.");
        }
        List<NstoreRankProductTrackInfoEntity> nstoreRankProductTrackInfoEntityList = nstoreRankProductTrackInfoRepository.findByNomadscrapNstoreRankTrackInfoId(nstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId());
        if (nstoreRankProductTrackInfoEntityList.size() < 2) {
            nomadscrapNstoreRankTrackRepository.deleteTrack(nstoreRankProductTrackInfoEntity.getNomadscrapNstoreRankTrackInfoId());
        }
        nstoreRankProductTrackInfoRepository.delete(nstoreRankProductTrackInfoEntity);
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

}
