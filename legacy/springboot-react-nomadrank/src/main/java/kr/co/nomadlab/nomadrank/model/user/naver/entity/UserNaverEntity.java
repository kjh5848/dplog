package kr.co.nomadlab.nomadrank.model.user.naver.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.config.security.TextEncryptorAttributeConverter;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`USER_NAVER`")
@DynamicInsert
@DynamicUpdate
public class UserNaverEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private UserEntity userEntity;

    @Column(name = "naver_id", nullable = false, unique = true)
    private String naverId;

    @Convert(converter = TextEncryptorAttributeConverter.class)
    @Column(name = "naver_pw", nullable = false)
    private String naverPw;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

}
