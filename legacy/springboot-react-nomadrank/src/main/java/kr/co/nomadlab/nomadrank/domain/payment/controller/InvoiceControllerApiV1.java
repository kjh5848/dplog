package kr.co.nomadlab.nomadrank.domain.payment.controller;

import java.time.LocalDate;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.nomadlab.nomadrank.domain.payment.dto.InvoiceDtos;
import kr.co.nomadlab.nomadrank.domain.payment.service.InvoiceQueryService;
import kr.co.nomadlab.nomadrank.model.payment.entity.ChargeEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceLineEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceStatus;
import kr.co.nomadlab.nomadrank.util.DateTimeFormatUtils;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class InvoiceControllerApiV1 {

    private final InvoiceQueryService invoiceQueryService;
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String subscriptionId,
            @RequestParam(required = false) String lineType,
            @RequestParam(required = false) String lineDescription,
            @RequestParam(defaultValue = "json") String format,
            Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "issuedAt"));
        }
        if ("csv".equalsIgnoreCase(format)) {
            String csv = invoiceQueryService.exportCsv(status, from, to, userId, subscriptionId, lineType,
                    lineDescription);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(csv);
        }
        Page<InvoiceDtos.InvoiceListItem> page = invoiceQueryService.findInvoices(status, from, to, userId,
                subscriptionId, lineType, lineDescription, pageable)
                .map(this::toListItem);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceDtos.InvoiceDetailResponse> detail(@PathVariable String invoiceId) {
        var detail = invoiceQueryService.getInvoiceDetail(invoiceId);
        InvoiceDtos.InvoiceDetailResponse response = InvoiceDtos.InvoiceDetailResponse.builder()
                .invoice(toListItem(detail.getInvoice()))
                .lines(detail.getLines().stream().map(this::toLineResponse).collect(Collectors.toList()))
                .charges(detail.getCharges().stream().map(this::toChargeResponse).collect(Collectors.toList()))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> summary(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) String status) {
        InvoiceStatus statusEnum = InvoiceStatus.fromName(status);
        String statusLabel = statusEnum != null ? statusEnum.getLabel() : null;
        var summaries = invoiceQueryService.getSummary(from, to, status).stream()
                .map(s -> InvoiceDtos.InvoiceSummaryResponse.builder()
                        .month(s.getMonth())
                        .totalAmount(s.getTotalAmount())
                        .count(s.getCount())
                        .status(statusEnum != null ? statusEnum.name() : null)
                        .statusLabel(statusLabel)
                        .build())
                .toList();
        return ResponseEntity.ok(summaries);
    }

    private InvoiceDtos.InvoiceListItem toListItem(InvoiceEntity inv) {
        InvoiceStatus status = inv.getStatus();
        return InvoiceDtos.InvoiceListItem.builder()
                .invoiceId(inv.getInvoiceId())
                .subscriptionId(inv.getSubscriptionId())
                .userId(inv.getUserId())
                .status(status != null ? status.name() : null)
                .statusLabel(status != null ? status.getLabel() : null)
                .amountDue(inv.getAmountDue())
                .currency(inv.getCurrency())
                .issuedAt(DateTimeFormatUtils.formatToMinute(inv.getIssuedAt()))
                .dueAt(DateTimeFormatUtils.formatToMinute(inv.getDueAt()))
                .paidAt(DateTimeFormatUtils.formatToMinute(inv.getPaidAt()))
                .build();
    }

    private InvoiceDtos.ChargeResponse toChargeResponse(ChargeEntity charge) {
        return InvoiceDtos.ChargeResponse.builder()
                .paymentId(charge.getPaymentId())
                .invoiceId(charge.getInvoiceId())
                .userId(charge.getUserId())
                .chargeType(charge.getChargeType() != null ? charge.getChargeType().name() : null)
                .paymentType(charge.getPaymentType() != null ? charge.getPaymentType().name() : null)
                .status(charge.getStatus() != null ? charge.getStatus().name() : null)
                .amount(charge.getAmount())
                .currency(charge.getCurrency())
                .paidAt(charge.getPaidAt() != null ? charge.getPaidAt().toString() : null)
                .build();
    }

    private InvoiceDtos.InvoiceLineResponse toLineResponse(InvoiceLineEntity line) {
        var lineType = line.getLineType();
        return InvoiceDtos.InvoiceLineResponse.builder()
                .lineId(line.getLineId())
                .invoiceId(line.getInvoiceId())
                .lineType(lineType != null ? lineType.name() : null)
                .lineTypeLabel(lineType != null ? lineType.getLabel() : null)
                .description(line.getDescription())
                .amount(line.getAmount())
                .currency(line.getCurrency())
                .build();
    }
}
