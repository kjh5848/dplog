package kr.co.nomadlab.nomadrank.model.payment.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invoice_lines")
public class InvoiceLineEntity {

    @Id
    @Column(name = "line_id", length = 120)
    private String lineId;

    @Column(name = "invoice_id", length = 100, nullable = false)
    private String invoiceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "line_type", length = 30, nullable = false)
    private InvoiceLineType lineType;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "amount", precision = 12, scale = 0, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 10, nullable = false)
    private String currency;
}
