package kr.co.nomadlab.scrap.domain.ndatalab.search.service;

import kr.co.nomadlab.scrap.common.dto.ResDTO;
import kr.co.nomadlab.scrap.common.exception.AuthenticationException;
import kr.co.nomadlab.scrap.domain.ndatalab.search.dto.res.ResNdatalabSearchGetKeywordTrafficDTOApiV1;
import kr.co.nomadlab.scrap.model.db.user.entity.UserEntity;
import kr.co.nomadlab.scrap.model.db.user.repository.UserRepository;
import kr.co.nomadlab.scrap.model_external.ndatalab.dto.req.ReqNdatalabSearchDTO;
import kr.co.nomadlab.scrap.model_external.ndatalab.dto.res.ResNdatalabSearchDTO;
import kr.co.nomadlab.scrap.model_external.ndatalab.repository.NdatalabSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NdatalabSearchServiceApiV1 {

    private final UserRepository userRepository;
    private final NdatalabSearchRepository ndatalabSearchRepository;

    public HttpEntity<?> getKeywordTraffic(String apiKey, String keyword, String keywordTraffic) {
        UserEntity userEntity = getUserEntityByApiKey(apiKey);
        ReqNdatalabSearchDTO reqNdatalabSearchDTO = ReqNdatalabSearchDTO.builder()
                .startDate(LocalDate.now().minusDays(365).toString())
                .endDate(LocalDate.now().toString())
                .timeUnit("month")
                .keywordGroups(
                        List.of(
                                ReqNdatalabSearchDTO.KeywordGroup.builder()
                                        .groupName(keyword)
                                        .keywords(List.of(keywordTraffic))
                                        .build()
                        )
                )
                .build();
        ResNdatalabSearchDTO resNdatalabSearchDTO = ndatalabSearchRepository.post(reqNdatalabSearchDTO);
        if (resNdatalabSearchDTO == null) {
            throw new RuntimeException("N데이터랩과의 통신에 실패했습니다.");
        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNdatalabSearchGetKeywordTrafficDTOApiV1.of(resNdatalabSearchDTO))
                        .build(),
                HttpStatus.OK
        );
    }

    private UserEntity getUserEntityByApiKey(String apiKey) {
        Optional<UserEntity> userEntityOptional = userRepository.findByApiKeyAndDeleteDateIsNull(apiKey);
        if (userEntityOptional.isEmpty()) {
            throw new AuthenticationException("존재하지 않는 apiKey입니다.");
        }
        return userEntityOptional.get();
    }

}
