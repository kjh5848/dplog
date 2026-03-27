package kr.co.nomadlab.nomadrank.domain.payment.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceStatus;
import kr.co.nomadlab.nomadrank.model.payment.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Transactional
    public InvoiceEntity createInvoice(String subscriptionId,
            Long userId,
            LocalDate periodStart,
            LocalDate periodEnd,
            BigDecimal amountDue,
            String currency,
            boolean markPaid) {

        InvoiceEntity invoice = InvoiceEntity.builder()
                .invoiceId(generateInvoiceId(subscriptionId))
                .subscriptionId(subscriptionId)
                .userId(userId)
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .amountDue(amountDue)
                .currency(currency != null ? currency : "KRW")
                .status(markPaid ? InvoiceStatus.PAID : InvoiceStatus.PENDING)
                .issuedAt(OffsetDateTime.now())
                .paidAt(markPaid ? OffsetDateTime.now() : null)
                .build();

        InvoiceEntity saved = invoiceRepository.save(invoice);
        log.info("[Invoice] 생성 - invoiceId={}, subscriptionId={}, status={}", saved.getInvoiceId(),
                saved.getSubscriptionId(), saved.getStatus());
        return saved;
    }

    @Transactional(readOnly = true)
    public Optional<InvoiceEntity> findById(String invoiceId) {
        return invoiceRepository.findById(invoiceId);
    }

    @Transactional
    public InvoiceEntity markPaid(String invoiceId, OffsetDateTime paidAt) {
        InvoiceEntity invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(paidAt != null ? paidAt : OffsetDateTime.now());
        return invoiceRepository.save(invoice);
    }

    private String generateInvoiceId(String subscriptionId) {
        return "inv-" + (subscriptionId != null ? subscriptionId : "sub") + "-" + UUID.randomUUID();
    }
}
