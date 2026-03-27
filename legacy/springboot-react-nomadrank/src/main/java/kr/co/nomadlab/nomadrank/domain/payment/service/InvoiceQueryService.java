package kr.co.nomadlab.nomadrank.domain.payment.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.model.payment.entity.ChargeEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceLineEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceLineType;
import kr.co.nomadlab.nomadrank.model.payment.repository.InvoiceLineRepository;
import kr.co.nomadlab.nomadrank.model.payment.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.Value;

@Service
@RequiredArgsConstructor
public class InvoiceQueryService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineRepository invoiceLineRepository;
    private final ChargeAdapterService chargeAdapterService;

    @Transactional(readOnly = true)
    public Page<InvoiceEntity> findInvoices(String status, LocalDate from, LocalDate to, Long userId,
            String subscriptionId,
            String lineType,
            String lineDescriptionContains,
            Pageable pageable) {
        Specification<InvoiceEntity> spec = Specification.where(null);
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.upper(root.get("status")), status.toUpperCase()));
        }
        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("issuedAt"), from.atStartOfDay()));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("issuedAt"), to.atTime(23, 59, 59)));
        }
        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), userId));
        }
        if (subscriptionId != null && !subscriptionId.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("subscriptionId"), subscriptionId));
        }
        if (lineType != null && !lineType.isBlank()) {
            InvoiceLineType typeEnum = InvoiceLineType.fromName(lineType);
            if (typeEnum == null) {
                return Page.empty(pageable);
            }
            List<String> invoiceIds = lineDescriptionContains != null && !lineDescriptionContains.isBlank()
                    ? invoiceLineRepository.findDistinctInvoiceIdsByLineTypeAndDescriptionContaining(typeEnum,
                            lineDescriptionContains)
                    : invoiceLineRepository.findDistinctInvoiceIdsByLineType(typeEnum);
            if (invoiceIds.isEmpty()) {
                return Page.empty(pageable);
            }
            spec = spec.and((root, query, cb) -> root.get("invoiceId").in(invoiceIds));
        }
        return invoiceRepository.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public InvoiceDetail getInvoiceDetail(String invoiceId) {
        InvoiceEntity invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));
        List<InvoiceLineEntity> lines = invoiceLineRepository.findByInvoiceId(invoiceId);
        List<ChargeEntity> charges = chargeAdapterService.findChargesByInvoiceId(invoiceId);
        return new InvoiceDetail(invoice, lines, charges);
    }

    @Transactional(readOnly = true)
    public String exportCsv(String status, LocalDate from, LocalDate to, Long userId, String subscriptionId,
            String lineType,
            String lineDescriptionContains) {
        StringBuilder sb = new StringBuilder();
        sb.append(
                "invoice_id,subscription_id,user_id,status,amount_due,currency,issued_at,due_at,paid_at,line_count,line_amount_sum\n");
        findInvoices(status, from, to, userId, subscriptionId, lineType, lineDescriptionContains, Pageable.unpaged())
                .forEach(inv -> {
                    var lineTotal = invoiceLineRepository.findByInvoiceId(inv.getInvoiceId()).stream()
                            .map(InvoiceLineEntity::getAmount)
                            .filter(a -> a != null)
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            sb.append(safe(inv.getInvoiceId())).append(",")
                    .append(safe(inv.getSubscriptionId())).append(",")
                    .append(inv.getUserId()).append(",")
                    .append(inv.getStatus()).append(",")
                    .append(inv.getAmountDue()).append(",")
                    .append(safe(inv.getCurrency())).append(",")
                    .append(inv.getIssuedAt()).append(",")
                    .append(inv.getDueAt()).append(",")
                    .append(inv.getPaidAt()).append(",")
                    .append(invoiceLineRepository.countByInvoiceId(inv.getInvoiceId())).append(",")
                    .append(lineTotal)
                    .append("\n");
        });
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public List<Summary> getSummary(LocalDate from, LocalDate to, String status) {
        var invoices = findInvoices(status, from, to, null, null, null, null, Pageable.unpaged()).getContent();
        Map<String, List<InvoiceEntity>> grouped = invoices.stream()
                .collect(Collectors.groupingBy(inv -> inv.getIssuedAt() != null
                        ? inv.getIssuedAt().toLocalDate().withDayOfMonth(1).toString()
                        : "unknown"));

        return grouped.entrySet().stream()
                .map(entry -> {
                    var list = entry.getValue();
                    var total = list.stream().map(InvoiceEntity::getAmountDue)
                            .filter(a -> a != null)
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                    long count = list.size();
                    return new Summary(entry.getKey(), total, count);
                })
                .sorted((a, b) -> b.getMonth().compareTo(a.getMonth()))
                .toList();
    }

    private String safe(Object v) {
        return v == null ? "" : v.toString().replace(",", " ");
    }

    @Value
    public static class InvoiceDetail {
        InvoiceEntity invoice;
        List<InvoiceLineEntity> lines;
        List<ChargeEntity> charges;
    }

    @Value
    public static class Summary {
        String month;
        java.math.BigDecimal totalAmount;
        long count;
    }
}
