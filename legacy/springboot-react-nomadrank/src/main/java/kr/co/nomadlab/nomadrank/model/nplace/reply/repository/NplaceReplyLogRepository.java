package kr.co.nomadlab.nomadrank.model.nplace.reply.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reply.entity.NplaceReplyEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reply.entity.NplaceReplyLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NplaceReplyLogRepository extends JpaRepository<NplaceReplyLogEntity, Long> {

    long deleteByNplaceReplyEntity(NplaceReplyEntity nplaceReplyEntity);
}
