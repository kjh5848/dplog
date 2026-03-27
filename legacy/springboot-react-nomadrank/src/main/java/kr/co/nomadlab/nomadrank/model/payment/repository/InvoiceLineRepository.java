package kr.co.nomadlab.nomadrank.model.payment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceLineEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceLineType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceLineRepository extends JpaRepository<InvoiceLineEntity, String> {
    List<InvoiceLineEntity> findByInvoiceId(String invoiceId);
    long countByInvoiceId(String invoiceId);

    @Query("SELECT DISTINCT l.invoiceId FROM InvoiceLineEntity l WHERE l.lineType = :lineType")
    List<String> findDistinctInvoiceIdsByLineType(@Param("lineType") InvoiceLineType lineType);

    @Query("SELECT DISTINCT l.invoiceId FROM InvoiceLineEntity l WHERE l.lineType = :lineType AND l.description LIKE %:keyword%")
    List<String> findDistinctInvoiceIdsByLineTypeAndDescriptionContaining(@Param("lineType") InvoiceLineType lineType,
            @Param("keyword") String keyword);
}
