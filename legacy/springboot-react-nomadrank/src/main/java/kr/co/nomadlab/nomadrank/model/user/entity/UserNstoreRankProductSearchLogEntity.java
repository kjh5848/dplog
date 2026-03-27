//package kr.co.nomadlab.nomadrank.model.user.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import org.hibernate.annotations.DynamicInsert;
//import org.hibernate.annotations.DynamicUpdate;
//
//@Getter
//@Builder
//@AllArgsConstructor
//@NoArgsConstructor
//@EqualsAndHashCode(of = "id")
//@Entity
//@Table(name = "USER_NSTORE_RANK_PRODUCT_SEARCH_LOG")
//@DynamicInsert
//@DynamicUpdate
//public class UserNstoreRankProductSearchLogEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "id", updatable = false)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id", referencedColumnName = "id", updatable = false, nullable = false)
//    private UserEntity userEntity;
//
//    @Column(name = "keyword")
//    private String keyword;
//
//    @Column(name = "filter_value")
//    private String filterValue;
//
//    @Column(name = "filter_type")
//    private String filterType;
//
//}
