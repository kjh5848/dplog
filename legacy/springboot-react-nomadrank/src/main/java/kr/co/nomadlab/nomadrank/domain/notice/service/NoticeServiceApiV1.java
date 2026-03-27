package kr.co.nomadlab.nomadrank.domain.notice.service;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.notice.dto.request.ReqNoticeAddDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.notice.dto.request.ReqNoticeUpdateDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.notice.dto.response.ResNoticeCategoryDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.notice.dto.response.ResNoticeListDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.notice.dto.response.ResNoticeWithIdDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.notice.enums.Category;
import kr.co.nomadlab.nomadrank.model.notice.entity.NoticeEntity;
import kr.co.nomadlab.nomadrank.model.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeServiceApiV1 {

    private final NoticeRepository noticeRepository;

    public HttpEntity<?> getNoticeList() {

        List<NoticeEntity> noticeEntityList = noticeRepository.findAll(Sort.by(Sort.Direction.DESC, "createDate"));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNoticeListDTOApiV1.of(noticeEntityList))
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getNoticeWithId(Long id) {
        NoticeEntity noticeEntity = noticeRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("해당 공지가 존재하지 않습니다."));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResNoticeWithIdDTOApiV1.of(noticeEntity))
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> saveNotice(ReqNoticeAddDTOApiV1 reqDto) {
        noticeRepository.save(reqDto.toNoticeEntity(reqDto));

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> updateNotice(ReqNoticeUpdateDTOApiV1 reqDto) {
        NoticeEntity noticeEntity = noticeRepository.findById(reqDto.getNotice().getId())
                .orElseThrow(() -> new BadRequestException("해당 공지가 존재하지 않습니다."));
        System.out.println(reqDto.getNotice().getCategory());
        noticeEntity.setCategory(reqDto.getNotice().getCategory());
        noticeEntity.setSubject(reqDto.getNotice().getSubject());
        noticeEntity.setContent(reqDto.getNotice().getContent());

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );
    }

    @Transactional
    public HttpEntity<?> deleteNotice(Long id) {
        NoticeEntity noticeEntity = noticeRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("해당 공지가 존재하지 않습니다."));

        noticeRepository.delete(noticeEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }

    public HttpEntity<?> getCategory() {
        ResNoticeCategoryDTOApiV1 resDto = ResNoticeCategoryDTOApiV1.builder()
                .categoryList(Arrays.stream(Category.values())
                        .map(category -> ResNoticeCategoryDTOApiV1.Category.builder()
                                .categoryName(category.name())
                                .categoryValue(category.getValue())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(resDto)
                        .build(),
                HttpStatus.OK
        );
    }
}
