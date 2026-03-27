package kr.co.nomadlab.nomadrank.domain.group.service;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.group.dto.request.ReqConnectGroupAndShopDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.group.dto.request.ReqDeleteGroupDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.group.dto.request.ReqSaveGroupDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.group.dto.request.ReqUpdateGroupDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.group.dto.response.ResGetGroupListDTOApiV1;
import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupEntity;
import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupNplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.group.repository.GroupRepository;
import kr.co.nomadlab.nomadrank.model.group.repository.GroupNplaceRankShopRepository;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.repository.NplaceRankShopRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupServiceApiV1 {

    private final GroupRepository groupRepository;
    private final GroupNplaceRankShopRepository groupNplaceRankShopRepository;
    private final UserRepository userRepository;
    private final NplaceRankShopRepository nplaceRankShopRepository;

    @Transactional
    public HttpEntity<?> saveGroup(Long userId, ReqSaveGroupDTOApiV1 reqDto) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        groupRepository.save(reqDto.toGroupEntity(userEntity));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );

    }

    public HttpEntity<?> getGroupList(Long userId) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        List<GroupEntity> groupEntityList = groupRepository.findByUserEntityAndDeleteDateNull(userEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResGetGroupListDTOApiV1.of(groupEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> updateGroup(Long userId, ReqUpdateGroupDTOApiV1 reqDto) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        GroupEntity groupEntity = groupRepository.findById(reqDto.getGroup().getId()).orElseThrow(
                () -> new BadRequestException("해당 그룹이 없습니다.")
        );

        groupEntity.setServiceSort(reqDto.getGroup().getServiceSort());
        groupEntity.setGroupName(reqDto.getGroup().getGroupName());
        groupEntity.setMemo(reqDto.getGroup().getMemo());
        groupRepository.save(groupEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> deleteGroup(Long userId, ReqDeleteGroupDTOApiV1 reqDto) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        GroupEntity groupEntity = groupRepository.findById(reqDto.getGroup().getId()).orElseThrow(
                () -> new BadRequestException("해당 그룹이 없습니다.")
        );

        groupEntity.setDeleteDate(LocalDateTime.now());
        groupRepository.save(groupEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> connectGroupAndShop(ReqConnectGroupAndShopDTOApiV1 reqDto) {

        GroupEntity groupEntity = groupRepository.findById(reqDto.getGroup().getId()).orElseThrow(
                () -> new BadRequestException("해당 그룹이 없습니다.")
        );

        List<NplaceRankShopEntity> nplaceRankShopEntityList = nplaceRankShopRepository.findByIdIn(reqDto.getShopList().stream().map(ReqConnectGroupAndShopDTOApiV1.Shop::getId).toList());

        List<GroupNplaceRankShopEntity> groupNplaceRankShopEntities = nplaceRankShopEntityList.stream()
                .map(shopEntity -> GroupNplaceRankShopEntity.builder()
                        .groupEntity(groupEntity)
                        .nplaceRankShopEntity(shopEntity)
                        .build()
                )
                .toList();

        groupNplaceRankShopRepository.saveAll(groupNplaceRankShopEntities);


        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }
}
