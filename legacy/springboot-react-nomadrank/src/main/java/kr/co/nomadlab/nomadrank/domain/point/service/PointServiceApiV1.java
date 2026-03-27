package kr.co.nomadlab.nomadrank.domain.point.service;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.enums.NplaceRankShopTrackInfoStatus;
import kr.co.nomadlab.nomadrank.domain.point.dto.request.ReqPointApplyPatchDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.point.dto.request.ReqPointApplyPostDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.point.dto.response.ResPointApplyListApiV1;
import kr.co.nomadlab.nomadrank.domain.point.dto.response.ResPointChangeListApiV1;
import kr.co.nomadlab.nomadrank.domain.point.enums.PointChargeStatus;
import kr.co.nomadlab.nomadrank.domain.product.enums.ProductSort;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopTrackInfoEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopTrackInfoPointHistoryEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankShopTrackInfoPointHistoryRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankShopTrackInfoRepository;
import kr.co.nomadlab.nomadrank.model.point.entity.PointChargeEntity;
import kr.co.nomadlab.nomadrank.model.point.repository.PointChargeRepository;
import kr.co.nomadlab.nomadrank.model.product.repository.ProductRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PointServiceApiV1 {

    private final UserRepository userRepository;
    private final PointChargeRepository pointChargeRepository;
    private final NplaceRankShopTrackInfoRepository trackInfoRepository;
    private final ProductRepository productRepository;
    private final NplaceRankShopTrackInfoPointHistoryRepository nplaceRankShopTrackInfoPointHistoryRepository;

    @Transactional
    public void monthlyPayment() {
        List<UserEntity> users = userRepository.findAllWithRunningTrackInfo();

        for (UserEntity user : users) {
            int nplaceRankPoint = productRepository.findByDistributorEntityAndProductSort(user.getDistributorEntity(), ProductSort.NPLACE_RANK)
                    .orElseThrow(() -> new BadRequestException("Distributor ID " + user.getDistributorEntity().getId() + "의 순위추적 포인트가 설정되지 않았습니다. "))
                    .getPrice();

            List<NplaceRankShopTrackInfoEntity> runningTrackInfoList = trackInfoRepository.findByNplaceRankShopEntity_UserEntityAndNplaceRankShopTrackInfoStatus(user, NplaceRankShopTrackInfoStatus.RUNNING);

            int runningCount = runningTrackInfoList.size();
            if (runningCount > 0) {
                int totalDeduction = runningCount * nplaceRankPoint;
                user.setBalance(user.getBalance() - totalDeduction);
                userRepository.save(user);

                PointChargeEntity pointChargeEntity = PointChargeEntity.builder()
                        .userEntity(user)
                        .amount(totalDeduction)
                        .balance(user.getBalance() - totalDeduction)
                        .status(PointChargeStatus.USE)
                        .build();

                pointChargeRepository.save(pointChargeEntity);

                for (NplaceRankShopTrackInfoEntity nplaceRankShopTrackInfoEntity : runningTrackInfoList) {
                    NplaceRankShopTrackInfoPointHistoryEntity nplaceRankShopTrackInfoPointHistoryEntity = NplaceRankShopTrackInfoPointHistoryEntity.builder()
                            .nplaceRankShopTrackInfoEntity(nplaceRankShopTrackInfoEntity)
                            .pointChargeEntity(pointChargeEntity)
                            .build();

                    nplaceRankShopTrackInfoPointHistoryRepository.save(nplaceRankShopTrackInfoPointHistoryEntity);
                }
            }
        }
    }

    @Transactional
    public PointChargeEntity rankPointPayment(UserEntity userEntity) {
        int nplaceRankPoint = productRepository.findByDistributorEntityAndProductSort(userEntity.getDistributorEntity(), ProductSort.NPLACE_RANK)
                .orElseThrow(() -> new BadRequestException("Distributor ID " + userEntity.getDistributorEntity().getId() + "의 순위추적 포인트가 설정되지 않았습니다. "))
                .getPrice();

        PointChargeEntity pointChargeEntity = PointChargeEntity.builder()
                .userEntity(userEntity)
                .amount(nplaceRankPoint)
                .balance(userEntity.getBalance() - nplaceRankPoint)
                .status(PointChargeStatus.USE)
                .build();

        return pointChargeRepository.save(pointChargeEntity);
    }

    public HttpEntity<?> getPointChangeList(Long id) {
        UserEntity userEntity = userRepository.findById(id).orElseThrow(() -> new BadRequestException("사용자 정보가 존재하지 않습니다."));
        List<PointChargeEntity> pointChangeEntityList;
        List<PointChargeStatus> pointChangeStatusFilterList = List.of(PointChargeStatus.DEPOSIT, PointChargeStatus.WITHDRAW, PointChargeStatus.USE);
        if (userEntity.getAuthority().contains(UserAuthoritySort.ADMIN)) {
            pointChangeEntityList = pointChargeRepository.findByStatusInOrderByCreateDateDesc(pointChangeStatusFilterList);
        } else if (userEntity.getAuthority().contains(UserAuthoritySort.DISTRIBUTOR_MANAGER)) {
            pointChangeEntityList = pointChargeRepository.findByUserEntity_DistributorEntityAndStatusInOrderByCreateDateDesc(userEntity.getDistributorEntity(), pointChangeStatusFilterList);
        } else {
            pointChangeEntityList = pointChargeRepository.findByUserEntityAndStatusInOrderByCreateDateDesc(userEntity, pointChangeStatusFilterList);
        }

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResPointChangeListApiV1.of(pointChangeEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> postPoint(ReqPointApplyPostDTOApiV1 reqDto, Long id) {
        UserEntity userEntity = userRepository.findById(id).orElseThrow(() -> new BadRequestException("사용자 정보가 존재하지 않습니다."));

        pointChargeRepository.save(reqDto.toPointChargeEntity(userEntity));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> confirmPointApply(ReqPointApplyPatchDTOApiV1 reqDto, Long id) {

        PointChargeEntity pointChargeEntity = pointChargeRepository.findById(reqDto.getPoint().getId()).get();
        UserEntity applyUserEntity = userRepository.findById(pointChargeEntity.getUserEntity().getId()).orElseThrow(() -> new BadRequestException("사용자 정보가 존재하지 않습니다."));
        UserEntity loginUserEntity = userRepository.findById(id).get();

        if (!Objects.equals(applyUserEntity.getDistributorEntity().getId(), loginUserEntity.getDistributorEntity().getId())) {
            throw new AuthenticationException("포인트 승인/거절 권한이 없습니다.");
        }

        if (reqDto.getPoint().getPointChargeStatus().equals(PointChargeStatus.CONFIRM)) {
            PointChargeEntity savedPointChargeEntity = pointChargeRepository.save(PointChargeEntity.builder()
                            .userEntity(pointChargeEntity.getUserEntity())
                            .amount(pointChargeEntity.getAmount())
                            .balance(applyUserEntity.getBalance() + pointChargeEntity.getAmount())
                            .status(PointChargeStatus.DEPOSIT)
                            .build());
            pointChargeEntity.setStatus(PointChargeStatus.CONFIRM);

            applyUserEntity.setBalance(savedPointChargeEntity.getBalance());
        } else {
            pointChargeRepository.save(PointChargeEntity.builder()
                    .userEntity(pointChargeEntity.getUserEntity())
                    .amount(pointChargeEntity.getAmount())
                    .balance(pointChargeEntity.getBalance() + pointChargeEntity.getAmount())
                    .status(PointChargeStatus.REJECT)
                    .build());
        }

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getPointApplyList(Long id) {
        UserEntity userEntity = userRepository.findById(id).orElseThrow(() -> new BadRequestException("사용자 정보가 존재하지 않습니다."));

        List<PointChargeEntity> pointApplyEntityList;
        List<PointChargeStatus> pointApplyStatusApplyFilterList = List.of(PointChargeStatus.WAIT, PointChargeStatus.REJECT, PointChargeStatus.CONFIRM);
        if (userEntity.getAuthority().contains(UserAuthoritySort.ADMIN)) {
            pointApplyEntityList = pointChargeRepository.findByStatusInOrderByCreateDateDesc(pointApplyStatusApplyFilterList);
        } else if (userEntity.getAuthority().contains(UserAuthoritySort.DISTRIBUTOR_MANAGER)) {
            pointApplyEntityList = pointChargeRepository.findByUserEntity_DistributorEntityAndStatusInOrderByCreateDateDesc(userEntity.getDistributorEntity(), pointApplyStatusApplyFilterList);
        } else {
            pointApplyEntityList = pointChargeRepository.findByUserEntityAndStatusInOrderByCreateDateDesc(userEntity, pointApplyStatusApplyFilterList);
        }

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResPointApplyListApiV1.of(pointApplyEntityList))
                        .build(),
                HttpStatus.OK
        );
    }
}
