package kr.co.nomadlab.nomadrank.domain.nstore.keyword.service;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.nstore.keyword.constraint.NstoreKeywordRequestType;
import kr.co.nomadlab.nomadrank.domain.nstore.keyword.dto.response.ResNstoreKeywordGetNblogSearchInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nstore.keyword.dto.response.ResNstoreKeywordGetNsearchadKeywordstoolDTOApiV1;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import kr.co.nomadlab.nomadrank.model_external.nblog.dto.response.ResNblogSearchInfoDTO;
import kr.co.nomadlab.nomadrank.model_external.nblog.repository.NblogRepository;
import kr.co.nomadlab.nomadrank.model_external.nsearchad.dto.response.ResNsearchadKeywordstoolDTO;
import kr.co.nomadlab.nomadrank.model_external.nsearchad.repository.NsearchadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NstoreKeywordServiceApiV1 {

    private final UserRepository userRepository;

    private final NsearchadRepository nsearchadRepository;
    private final NblogRepository nblogRepository;

    public HttpEntity<?> getNsearchadKeywordstool(List<String> keywordList, NstoreKeywordRequestType requestType) {
        if (keywordList.stream().anyMatch(thisKeyword -> thisKeyword == null || thisKeyword.isBlank())) {
            throw new BadRequestException("키워드가 비어있습니다.");
        }
        String keyword;
        if (NstoreKeywordRequestType.RELATION.equals(requestType)) {
            keyword = keywordList.get(0);
        } else {
            keyword = String.join(",", keywordList.stream().map(thisKeyword -> thisKeyword.replaceAll(" ", "")).toList());
        }
        ResNsearchadKeywordstoolDTO resNsearchadKeywordstoolDTO = nsearchadRepository.getKeywordstool(keyword);
        List<ResNsearchadKeywordstoolDTO.Keyword> resNsearchadKeywordstoolKeywordList;
        if (NstoreKeywordRequestType.RELATION.equals(requestType)) {
            resNsearchadKeywordstoolKeywordList = resNsearchadKeywordstoolDTO.getKeywordList();
        } else {
            resNsearchadKeywordstoolKeywordList = resNsearchadKeywordstoolDTO.getKeywordList().subList(0, keywordList.size());
        }
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNstoreKeywordGetNsearchadKeywordstoolDTOApiV1.of(resNsearchadKeywordstoolKeywordList))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getNblogSearchInfo(String keyword) {
        ResNblogSearchInfoDTO resNblogSearchInfoDTO = nblogRepository.getNblogSearchInfo(keyword);
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(
                                ResNstoreKeywordGetNblogSearchInfoDTOApiV1.of(resNblogSearchInfoDTO.getResult())
                        )
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
