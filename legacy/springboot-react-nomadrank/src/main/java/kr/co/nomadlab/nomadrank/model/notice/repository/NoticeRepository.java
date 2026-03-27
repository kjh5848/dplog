package kr.co.nomadlab.nomadrank.model.notice.repository;

import kr.co.nomadlab.nomadrank.domain.notice.enums.Category;
import kr.co.nomadlab.nomadrank.model.notice.entity.NoticeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<NoticeEntity, Long> {

    List<NoticeEntity> findByCategoryOrderByCreateDateDesc(Category category);
}
