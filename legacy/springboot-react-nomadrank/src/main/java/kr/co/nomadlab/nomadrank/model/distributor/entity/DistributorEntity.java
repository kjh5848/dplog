package kr.co.nomadlab.nomadrank.model.distributor.entity;

import jakarta.persistence.Table;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`DISTRIBUTOR`")
@DynamicInsert
@DynamicUpdate
public class DistributorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(length = 100, name = "email")
    private String email;

    @Comment("계좌번호")
    @Column(length = 30, name = "account_number")
    private String accountNumber;

    @Comment("예금주")
    @Column(name = "deposit")
    private String deposit;

    @Comment("은행 이름")
    @Column(name = "bank_name")
    private String bankName;

    @Comment("구글 시트 URL")
    @Column(name = "google_sheet_url")
    private String googleSheetUrl;

    @Comment("구글 인증 JSON")
    @Lob
    @Column(name = "google_credential_json", columnDefinition = "TEXT")
    private String googleCredentialJson;

    @Column(length = 100, name = "memo")
    private String memo;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @Column(name = "delete_date")
    private LocalDateTime deleteDate;
}
