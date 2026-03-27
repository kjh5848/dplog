package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.service;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.google.service.GoogleServiceApiV1;
import kr.co.nomadlab.nomadrank.domain.notice.enums.Category;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardShopKeywordRegisterStatus;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request.*;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.response.*;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.distributor.repository.DistributorRepository;
import kr.co.nomadlab.nomadrank.model.notice.entity.NoticeEntity;
import kr.co.nomadlab.nomadrank.model.notice.repository.NoticeRepository;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.*;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.repository.*;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.ndatalab.repository.NomadscrapNdatalabSearchKeywordTrafficRepository;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.mission.repository.NomadscrapNplaceMissionRepository;
import kr.co.nomadlab.nomadrank.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NplaceRewardPlaceServiceApiV1 {

    private final NplaceRewardShopRepository nplaceRewardShopRepository;
    private final NplaceRewardShopKeywordRepository nplaceRewardShopKeywordRepository;
    private final NplaceCampaignTrafficRegisterRepository nplaceCampaignTrafficRegisterRepository;
    private final NplaceRewardShopKeywordRegisterRepository nplaceRewardShopKeywordRegisterRepository;
    private final NplaceRewardShopKeywordRegisterStatusLogRepository nplaceRewardShopKeywordRegisterStatusLogRepository;
    private final UserRepository userRepository;
    private final NplaceRewardNotificationRepository nplaceRewardNotificationRepository;

    private final NomadscrapNdatalabSearchKeywordTrafficRepository nomadscrapNdatalabSearchKeywordTrafficRepository;
    private final NomadscrapNplaceMissionRepository nomadscrapNplaceMissionRepository;

    private final GoogleServiceApiV1 googleServiceApiV1;
    private final DistributorRepository distributorRepository;
    private final NoticeRepository noticeRepository;
    private final NplaceRewardPlaceRepository nplaceRewardPlaceRepository;

    public HttpEntity<?> getShopTable(Long userId, NplaceRewardProduct nplaceRewardProduct) {
        UserEntity userEntity = getUserEntityById(userId);
        List<NplaceRewardShopEntity> nplaceRewardShopEntityList = nplaceRewardShopRepository.findByUserEntityAndNplaceRewardProduct(userEntity, nplaceRewardProduct);
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRewardShopTableDTOApiV1.of(
                                nplaceRewardShopEntityList)
                        )
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> postShopTable(Long userId, ReqNplaceRewardPostShopDTOApiV1 reqDto) {
        UserEntity userEntity = getUserEntityById(userId);
        nplaceRewardShopRepository.findByUserEntityAndShopIdAndNplaceRewardProduct(userEntity, reqDto.getNplaceRewardShop().getShopId(), reqDto.getNplaceRewardShop().getNplaceRewardProduct())
                .ifPresent(thisNplaceRewardShopEntity -> {
                    throw new BadRequestException("이미 등록된 샵입니다.");
                });
        NplaceRewardShopEntity nplaceRewardShopEntity = nplaceRewardShopRepository.save(reqDto.getNplaceRewardShop().toEntity(userEntity));
        nplaceRewardShopKeywordRepository.save(reqDto.getNplaceRewardShopKeyword().toEntity(nplaceRewardShopEntity));
        List<NplaceRewardShopEntity> nplaceRewardShopEntityList = nplaceRewardShopRepository.findByUserEntity(userEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRewardShopTableDTOApiV1.of(
                                nplaceRewardShopEntityList)
                        )
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> getShopWithId(Long userId, Long id) {
        UserEntity userEntity = getUserEntityById(userId);
        Optional<NplaceRewardShopEntity> nplaceRewardShopEntityOptional = nplaceRewardShopRepository.findById(id);
        if (nplaceRewardShopEntityOptional.isEmpty()) {
            throw new RuntimeException("존재하지 않는 샵입니다.");
        }
        if (!nplaceRewardShopEntityOptional.get().getUserEntity().getId().equals(userEntity.getId())) {
            throw new AuthenticationException("권한이 없습니다.");
        }
        NplaceRewardShopEntity nplaceRewardShopEntity = nplaceRewardShopEntityOptional.get();

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRewardGetShopWithIdDTOApiV1.of(nplaceRewardShopEntity))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> postKeyword(Long userId, ReqNplaceCampaignTrafficPostKeywordDTOApiV1 reqDto) {
        UserEntity userEntity = getUserEntityById(userId);
//        Optional<NplaceCampaignTrafficShopEntity> nplaceCampaignTrafficShopEntityOptional = nplaceRewardShopRepository.findByUserEntityAndShopId(userEntity, reqDto.getNplaceCampaignTrafficKeyword().getShopId());
//        if (nplaceCampaignTrafficShopEntityOptional.isEmpty()) {
//            throw new RuntimeException("존재하지 않는 샵입니다.");
//        }
//        if (!nplaceCampaignTrafficShopEntityOptional.get().getUserEntity().getId().equals(userEntity.getId())) {
//            throw new AuthenticationException("권한이 없습니다.");
//        }
//        NplaceCampaignTrafficShopEntity nplaceCampaignTrafficShopEntity = nplaceCampaignTrafficShopEntityOptional.get();
//
//        nplaceCampaignTrafficKeywordRepository.findByNplaceCampaignTrafficShopEntityAndKeyword(nplaceCampaignTrafficShopEntity, reqDto.getNplaceCampaignTrafficKeyword().getKeyword())
//                .ifPresent(thisNplaceCampaignTrafficKeywordEntity -> {
//                    throw new BadRequestException("이미 등록된 키워드입니다.");
//                });
//
//        nplaceCampaignTrafficKeywordRepository.save(reqDto.getNplaceCampaignTrafficKeyword().toEntity(nplaceCampaignTrafficShopEntity));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
//                        .data(ResNplaceCampaignTrafficPostKeywordDTOApiV1.of(
//                                nplaceCampaignTrafficShopEntity)
//                        )
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> postKeywordTraffic(Long userId, ReqNplaceCampaignTrafficPostKeywordTrafficDTOApiV1 reqDto) {
        UserEntity userEntity = getUserEntityById(userId);
//        Optional<NplaceCampaignTrafficShopEntity> nplaceCampaignTrafficShopEntityOptional = nplaceRewardShopRepository.findByUserEntityAndShopId(userEntity, reqDto.getNplaceCampaignTrafficKeywordTraffic().getShopId());
//        if (nplaceCampaignTrafficShopEntityOptional.isEmpty()) {
//            throw new RuntimeException("존재하지 않는 샵입니다.");
//        }
//        if (!nplaceCampaignTrafficShopEntityOptional.get().getUserEntity().getId().equals(userEntity.getId())) {
//            throw new AuthenticationException("권한이 없습니다.");
//        }
//
//        NplaceCampaignTrafficKeywordEntity nplaceCampaignTrafficKeywordEntity = nplaceCampaignTrafficKeywordRepository.findById(reqDto.getNplaceCampaignTrafficKeywordTraffic().getKeywordId())
//                .orElseThrow(() -> new RuntimeException("존재하지 않는 키워드입니다."));
//
//        nplaceCampaignTrafficKeywordTrafficRepository.save(reqDto.getNplaceCampaignTrafficKeywordTraffic().toEntity(nplaceCampaignTrafficKeywordEntity));
//
//        List<NplaceCampaignTrafficKeywordTrafficEntity> nplaceCampaignTrafficKeywordTrafficEntityList = nplaceCampaignTrafficKeywordTrafficRepository.findByNplaceCampaignTrafficKeywordEntity(nplaceCampaignTrafficKeywordEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
//                        .data(ResNplaceCampaignTrafficPostKeywordTrafficDTOApiV1.of(
//                                nplaceCampaignTrafficKeywordTrafficEntityList)
//                        )
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> searchKeywordTraffic(
            String keyword,
            String keywordTraffic
    ) {
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(nomadscrapNdatalabSearchKeywordTrafficRepository.searchKeywordTraffic(keyword, keywordTraffic).getData())
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

    @Transactional
    public HttpEntity<?> postRegister(Long userId, ReqNplaceRewardPostRegisterDTOApiV1 reqDto) {
        UserEntity userEntity = getUserEntityById(userId);
        Optional<NplaceRewardShopEntity> nplaceRewardShopEntityOptional = nplaceRewardShopRepository.findById(reqDto.getNplaceRewardShopKeywordRegister().getNplaceRewardShopId());
        if (nplaceRewardShopEntityOptional.isEmpty()) {
            throw new RuntimeException("존재하지 않는 샵입니다.");
        }
        if (!nplaceRewardShopEntityOptional.get().getUserEntity().getId().equals(userEntity.getId())) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        NplaceRewardShopEntity nplaceRewardShopEntity = nplaceRewardShopEntityOptional.get();

        NplaceRewardShopKeywordRegisterEntity savedNplaceRewardShopKeywordRegisterEntity = nplaceRewardShopKeywordRegisterRepository.save(reqDto.toNplaceRewardShopKeywordRegisterEntity(nplaceRewardShopEntity.getNplaceRewardShopKeywordEntityList().get(0)));
        HttpEntity<?> response = registerGoogleSheet(savedNplaceRewardShopKeywordRegisterEntity, userEntity);

        if (response instanceof ResponseEntity) {
            ResponseEntity<?> responseEntity = (ResponseEntity<?>) response;
            ResDTO resDTO = (ResDTO) responseEntity.getBody();
            if (resDTO == null || resDTO.getCode() != 0) {
                throw new RuntimeException("Google Sheet 등록 실패: " + (resDTO != null ? resDTO.getMessage() : "알 수 없는 오류"));
            }
        }

        return response;
    }

    public HttpEntity<?> getNotification() {
        List<NoticeEntity> noticeEntityList = noticeRepository.findByCategoryOrderByCreateDateDesc(Category.REWARD_PLACE);
//        List<NplaceRewardNotificationEntity> nplaceRewardNotificationEntityList = nplaceRewardNotificationRepository.findByDeleteDateNullOrderByCreateDateDesc();

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRewardGetNotificationDTOApiV1.of(noticeEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public void confirmRegister() {

        List<DistributorEntity> distributorEntityList = distributorRepository.findAll();
        List<DistributorEntity> distributorEntityListWithGoogleSheet = distributorEntityList.stream()
                .filter(distributor -> StringUtils.hasText(distributor.getGoogleSheetUrl())
                        && StringUtils.hasText(distributor.getGoogleCredentialJson()))
                .toList();

        for (DistributorEntity distributorEntity : distributorEntityListWithGoogleSheet) {
            String spreadsheetId = UtilFunction.getSheetIdFromUrl(distributorEntity.getGoogleSheetUrl());
            String credentialJson = distributorEntity.getGoogleCredentialJson();
            try {
                List<ResNplaceRewardGetGoogleRegisterDTOApiV1> sheetsUpdateList = collectUpdateDataBatch(spreadsheetId, credentialJson);
                updateRegister(sheetsUpdateList);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    private List<ResNplaceRewardGetGoogleRegisterDTOApiV1> collectUpdateDataBatch(String spreadsheetId, String credentialJson) throws Exception {
//        System.out.println("collectUpdateDataBatch start!");
        final int START_ROW = 9;
        final int BATCH_SIZE = 100;
        Sheets sheetsService = googleServiceApiV1.getSheetsService(credentialJson);

        List<ResNplaceRewardGetGoogleRegisterDTOApiV1> updateDataList = new ArrayList<>();
        int currentRow = START_ROW;
        boolean hasMoreData = true;

        while (hasMoreData) {
            String range = String.format("A!Q%d:S%d", currentRow, currentRow + BATCH_SIZE - 1);

//            System.out.println("range : " + range);

            ValueRange response = sheetsService.spreadsheets().values()
                    .get(spreadsheetId, range)
                    .execute();

            List<List<Object>> values = response.getValues();
            if (values == null || values.isEmpty()) {
                break;
            }

            boolean foundEmptyS = false;
            for (int i = 0; i < values.size(); i++) {
                List<Object> row = values.get(i);
                // R열 데이터 확인
//                System.out.println(values.get(i));
                // R열(productId) 데이터가 없으면 종료
                if (row.size() < 3 || row.get(2) == null || row.get(2).toString().trim().isEmpty()) {
                    foundEmptyS = true;
                    break;
                }

                boolean approved = Boolean.parseBoolean(row.get(0).toString());
                Long registerId = Long.valueOf(row.get(2).toString());

                updateDataList.add(new ResNplaceRewardGetGoogleRegisterDTOApiV1(registerId, approved));
            }

            if (foundEmptyS) {
                hasMoreData = false;
            } else {
                currentRow += BATCH_SIZE;
            }
        }

        return updateDataList;
    }


    private void updateRegister(List<ResNplaceRewardGetGoogleRegisterDTOApiV1> resDtoList) {
//        System.out.println("resDtoList.size = " + resDtoList.size());
        if (resDtoList.isEmpty()) {
            return;
        }

        // ID 리스트 생성
        List<Long> ids = resDtoList.stream()
                .map(ResNplaceRewardGetGoogleRegisterDTOApiV1::getRegisterId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 해당 ID를 가진 모든 신청 조회
        List<NplaceRewardShopKeywordRegisterEntity> nplaceRewardShopKeywordRegisterEntityList = nplaceRewardShopKeywordRegisterRepository.findAllById(ids);
//        System.out.println("nplaceRewardShopKeywordRegisterEntityList.size = " + nplaceRewardShopKeywordRegisterEntityList.size());

        // 신청 ID를 키로 하는 Map 생성
        Map<Long, NplaceRewardShopKeywordRegisterEntity> registerMap = nplaceRewardShopKeywordRegisterEntityList.stream()
                .collect(Collectors.toMap(NplaceRewardShopKeywordRegisterEntity::getId, register -> register));

        List<NplaceRewardShopKeywordRegisterEntity> registerListToUpdate = new ArrayList<>();
        List<NplaceRewardShopKeywordRegisterStatusLogEntity> registerStatusLogList = new ArrayList<>();

        // 상태 비교 및 업데이트 대상 수집
        for (ResNplaceRewardGetGoogleRegisterDTOApiV1 resDto : resDtoList) {
            Long registerId = resDto.getRegisterId();
            NplaceRewardShopKeywordRegisterEntity existingRegister = registerMap.get(registerId);

//            System.out.println("resDto.getRegisterId() = " + resDto.getRegisterId() + " / " + resDto.isApproved() + " / " + existingRegister.getStatus() );

            if (resDto.isApproved() && existingRegister.getStatus().equals(NplaceRewardShopKeywordRegisterStatus.REQUESTED)) {
                existingRegister.setStatus(NplaceRewardShopKeywordRegisterStatus.APPROVED);
                registerListToUpdate.add(existingRegister);
                registerStatusLogList.add(NplaceRewardShopKeywordRegisterStatusLogEntity.builder()
                                .prevStatus(NplaceRewardShopKeywordRegisterStatus.REQUESTED)
                                .currStatus(existingRegister.getStatus())
                                .nplaceRewardShopKeywordRegisterEntity(existingRegister)
                        .build());
            } else if (!resDto.isApproved() && existingRegister.getStatus().equals(NplaceRewardShopKeywordRegisterStatus.APPROVED)) {
                existingRegister.setStatus(NplaceRewardShopKeywordRegisterStatus.REQUESTED);
                registerListToUpdate.add(existingRegister);
                registerStatusLogList.add(NplaceRewardShopKeywordRegisterStatusLogEntity.builder()
                        .prevStatus(NplaceRewardShopKeywordRegisterStatus.APPROVED)
                        .currStatus(existingRegister.getStatus())
                        .nplaceRewardShopKeywordRegisterEntity(existingRegister)
                        .build());
            }
        }

//        System.out.println("registerListToUpdate.size = " + registerListToUpdate.size());

        if (!registerListToUpdate.isEmpty()) {
            nplaceRewardShopKeywordRegisterRepository.saveAll(registerListToUpdate);
            nplaceRewardShopKeywordRegisterStatusLogRepository.saveAll(registerStatusLogList);
        }
    }

    private HttpEntity<?> registerGoogleSheet(NplaceRewardShopKeywordRegisterEntity nplaceRewardShopKeywordRegisterEntity, UserEntity userEntity) {
        try {
            Sheets sheetsService = googleServiceApiV1.getSheetsService(userEntity.getDistributorEntity().getGoogleCredentialJson());
            String spreadsheetId = UtilFunction.getSheetIdFromUrl(userEntity.getDistributorEntity().getGoogleSheetUrl());
            String SheetName = "A";
            String checkColumn = "F";
            int startRow = 9;

            int maxAttempts = 1000;
            int attempts = 0;
            while (attempts < maxAttempts) {
                String checkRange = String.format("%s!%s%d", SheetName, checkColumn, startRow);
                ValueRange response = sheetsService.spreadsheets().values()
                        .get(spreadsheetId, checkRange)
                        .execute();
                List<List<Object>> values = response.getValues();
                if (values == null || values.isEmpty() || values.get(0).isEmpty()) {
                    break;
                } else {
                    startRow++;
                }
                attempts++;
            }
            if (attempts >= maxAttempts) {
                return new ResponseEntity<>(ResDTO.builder().code(1).message("구글시트에 빈 공간이 없습니다.\n관리자에게 문의해주세요.").build(), HttpStatus.OK);
            }

            String range = String.format("%s!C%d", SheetName, startRow);

//            ValueRange response = sheetsService.spreadsheets().values()
//                    .get(spreadsheetId, range)
//                    .execute();
//            List<List<Object>> existingData = response.getValues();
//            List<Object> existingRow = existingData.get(0);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy. MM. dd");

            NplaceRewardProduct nplaceRewardProduct = nplaceRewardShopKeywordRegisterEntity.getNplaceRewardShopKeywordEntity().getNplaceRewardShopEntity().getNplaceRewardProduct();
            String nplaceRewardProductValueForSheet;
            switch (nplaceRewardProduct) {
                case SAVE -> nplaceRewardProductValueForSheet = "저장";
                case TRAFFIC -> nplaceRewardProductValueForSheet = "유입";
                default -> throw new BadRequestException("지원하지 않는 상품입니다.");
            }

            ValueRange body = new ValueRange()
                    .setValues(Collections.singletonList(
                            Arrays.asList(
                                    nplaceRewardProductValueForSheet,
                                    nplaceRewardShopKeywordRegisterEntity.getCreateDate().format(formatter),
                                    nplaceRewardShopKeywordRegisterEntity.getNplaceRewardShopKeywordEntity().getNplaceRewardShopEntity().getShopId(),
                                    nplaceRewardShopKeywordRegisterEntity.getShopName(),
                                    nplaceRewardShopKeywordRegisterEntity.getSearch(),
                                    nplaceRewardShopKeywordRegisterEntity.getGoal(),
                                    nplaceRewardShopKeywordRegisterEntity.getStartDate().replaceAll("-", ". "),
                                    nplaceRewardShopKeywordRegisterEntity.getEndDate().replaceAll("-", ". "),
                                    String.format("=J%d-I%d", startRow, startRow),
                                    String.format("=H%d*K%d", startRow, startRow),
                                    nplaceRewardShopKeywordRegisterEntity.getUrl(),
                                    "",
                                    String.format("=if(C%d=\"저장\",45*L%d*1.1,if(C%d=\"유입\",40*L%d*1.1))", startRow, startRow, startRow, startRow),
                                    "",
                                    "FALSE",
                                    userEntity.getUsername(),
                                    nplaceRewardShopKeywordRegisterEntity.getId()
                            )
                    ));

            sheetsService.spreadsheets().values().update(spreadsheetId, range, body)
                    .setValueInputOption("USER_ENTERED")
                    .execute();

//            int answerIndex = 0;
//            ResNomadscrapNplaceMissionGetAroundDTO dto = nomadscrapNplaceMissionRepository.getAround(
//                    nplaceRewardShopKeywordRegisterEntity.getUrl().split("\\?")[0],
//                    100,
//                    null,
//                    answerIndex
//            );
//
//            String indexString = UtilFunction.getKoreaIndexString(dto.getData().getNplaceMissionAround().getIndex());
//            String answer = dto.getData().getNplaceMissionAround().getAnswer();
//            String initialConsonants = dto.getData().getNplaceMissionAround().getInitialConsonants();
//
//            String spreadsheetId = UtilFunction.getSheetIdFromUrl(userEntity.getDistributorEntity().getGoogleSheetUrl());
//            if (spreadsheetId == null) {
//                throw new BadRequestException("등록된 구글 시트가 없습니다.");
//            }
//            LocalDate startDate = LocalDate.parse(nplaceRewardShopKeywordRegisterEntity.getStartDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
//            ValueRange valueRange = sheetsService.spreadsheets().values()
//                    .get(spreadsheetId, "게재요청_%d월".formatted(startDate.getMonth().getValue()))
//                    .execute();
//            List<List<Object>> values = valueRange.getValues();
//            int insertIndex = findFirstEmptyRow(values);
//
//            String range = "게재요청_%d월!A%d:N%d".formatted(startDate.getMonth().getValue(), insertIndex, insertIndex);
//
//            // 명소, Web 만 임시로 먼저 작업
//            String frontType = "Web";
//            String missionType = "명소";
//
//            ValueRange body = new ValueRange()
//                    .setValues(Collections.singletonList(
//                            List.of(
//                                    missionType,
//                                    frontType,
//                                    nplaceRewardShopKeywordRegisterEntity.getStartDate(),
//                                    nplaceRewardShopKeywordRegisterEntity.getEndDate(),
//                                    nplaceRewardShopKeywordRegisterEntity.getSearch(),
//                                    UtilFunction.getMissionContent(
//                                            frontType, missionType, nplaceRewardShopKeywordRegisterEntity.getShopName(),
//                                            answer, indexString, null, initialConsonants
//                                    ),
//                                    answer,
//                                    "Web".equals(frontType)
//                                            ? "https://nid.naver.com/nidlogin.login?svctype=262144"
//                                            : "https://naverapp.m.naver.com/?urlScheme=naversearchapp://default?version=5",
//                                    nplaceRewardShopKeywordRegisterEntity.getShopName(),
//                                    nplaceRewardShopKeywordRegisterEntity.getGoal(),
//                                    "=LEN(G%d)".formatted(insertIndex),
//                                    "O"
//                            )
//                    ));
//
//            sheetsService.spreadsheets().values().append(spreadsheetId, range, body)
//                    .setValueInputOption("USER_ENTERED")
//                    .execute();

            return new ResponseEntity<>(ResDTO.builder().code(0).message("신청에 성공했습니다.").build(), HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error while processing Google Sheets data", e);
        }
    }

    private int findFirstEmptyRow(List<List<Object>> values) {
        int rowIndex = 1; // Starting from 1 (0-based index)
        for (List<Object> row : values) {
            if (row.isEmpty()) {
                return rowIndex;
            }
            rowIndex++;
        }
        return rowIndex; // Next row if all are filled
    }

    public HttpEntity<?> getPlaceList(Long userId) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        List<NplaceRewardPlaceEntity> nplaceRewardPlaceEntityList = nplaceRewardPlaceRepository.findByUserEntityAndDeleteDateNull(userEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRewardGetPlaceListDTOApiV1.of(nplaceRewardPlaceEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> savePlace(Long userId, ReqNplaceRewardSavePlaceDTOApiV1 reqDto) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        nplaceRewardPlaceRepository.findByUserEntityAndNplaceRewardProduct(userEntity, reqDto.getPlace().getNplaceRewardProduct())
                .ifPresent(nplaceRewardPlaceEntity -> {
                    throw new BadRequestException(reqDto.getPlace().getNplaceRewardProduct().getValue() + "은/는 이미 등록되어 있습니다.");
                });

        nplaceRewardPlaceRepository.save(reqDto.toPlaceEntity(userEntity));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> updatePlace(Long userId, ReqNplaceRewardUpdatePlaceDTOApiV1 reqDto) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        NplaceRewardPlaceEntity nplaceRewardPlaceEntity = nplaceRewardPlaceRepository.findByIdAndUserEntity(reqDto.getPlace().getId(), userEntity).orElseThrow(
                () -> new BadRequestException("해당 리워드의 결제정보가 없습니다.")
        );

        nplaceRewardPlaceEntity.setPrice(reqDto.getPlace().getPrice());
        nplaceRewardPlaceEntity.setAccountNumber(reqDto.getPlace().getAccountNumber());
        nplaceRewardPlaceEntity.setDeposit(reqDto.getPlace().getDeposit());
        nplaceRewardPlaceEntity.setBankName(reqDto.getPlace().getBankName());
        nplaceRewardPlaceRepository.save(nplaceRewardPlaceEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getPlace(Long userId, String type) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new BadRequestException("해당 유저가 없습니다.")
        );

        NplaceRewardPlaceEntity nplaceRewardPlaceEntity = nplaceRewardPlaceRepository.findByDistributorEntityAndNplaceRewardProduct(
                    userEntity.getDistributorEntity(),
                    NplaceRewardProduct.valueOf(type.toUpperCase()))
                .orElseThrow(() -> new BadRequestException("해당 리워드의 결제정보가 없습니다. 리워드 관리에서 결제정보를 등록해주세요."));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNplaceRewardGetPlaceDTOApiV1.of(nplaceRewardPlaceEntity))
                        .build(),
                HttpStatus.OK
        );
    }
}
