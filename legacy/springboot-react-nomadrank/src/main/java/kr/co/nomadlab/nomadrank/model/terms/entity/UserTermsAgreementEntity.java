package kr.co.nomadlab.nomadrank.model.terms.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(
        name = "USER_TERMS_AGREEMENT",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_user_term", columnNames = {"user_id", "term_code"})
        }
)
public class UserTermsAgreementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, columnDefinition = "BIGINT COMMENT '약관 동의 고유 ID'")
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            referencedColumnName = "id",
            nullable = false,
            columnDefinition = "BIGINT NOT NULL COMMENT '사용자 고유 ID(FK)'"
    )
    private UserEntity userEntity;

    @Column(name = "provider", length = 20, nullable = false, columnDefinition = "VARCHAR(20) NOT NULL COMMENT '제공자 (예: KAKAO)'")
    private String provider;

    @Column(name = "term_code", length = 100, nullable = false, columnDefinition = "VARCHAR(100) NOT NULL COMMENT '약관 코드'")
    private String termCode;

    @Column(name = "required", nullable = false, columnDefinition = "TINYINT(1) NOT NULL COMMENT '필수 여부(1/0)'")
    private Boolean required;

    @Column(name = "agreed", nullable = false, columnDefinition = "TINYINT(1) NOT NULL COMMENT '동의 여부(1/0)'")
    private Boolean agreed;

    @Column(name = "version", length = 64, columnDefinition = "VARCHAR(64) COMMENT '약관 버전(revision_time)'")
    private String version;

    @Column(name = "agreed_at", columnDefinition = "DATETIME COMMENT '동의 시각'")
    private LocalDateTime agreedAt;

    @CreationTimestamp
    @Column(name = "create_date", updatable = false, columnDefinition = "DATETIME NOT NULL COMMENT '생성 시각'")
    private LocalDateTime createDate;

    @UpdateTimestamp
    @Column(name = "update_date", columnDefinition = "DATETIME COMMENT '수정 시각'")
    private LocalDateTime updateDate;
}
