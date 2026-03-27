package kr.co.nomadlab.nomadrank.model.nplace.reply.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reply.entity.NplaceReplyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NplaceReplyRepository extends JpaRepository<NplaceReplyEntity, Long> {

    List<NplaceReplyEntity> findByUserEntityId(Long userId);
}
