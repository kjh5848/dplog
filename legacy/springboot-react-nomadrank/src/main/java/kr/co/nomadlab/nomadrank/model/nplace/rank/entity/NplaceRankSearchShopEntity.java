package kr.co.nomadlab.nomadrank.model.nplace.rank.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankGetRealtimeDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "NPLACE_RANK_SEARCH_SHOP")
@DynamicInsert
@DynamicUpdate
public class NplaceRankSearchShopEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Embedded
    private SearchKeyword searchKeyword;

    @Embedded
    private TrackInfo trackInfo;

    @Embedded
    private RankInfo rankInfo;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    public static List<NplaceRankSearchShopEntity> createFromDto(ResNomadscrapNplaceRankGetRealtimeDTO resDto, String keyword, String province) {
        return resDto.getData().getNplaceRankSearchShopList().stream().map(jsonNode -> {
            SearchKeyword searchKeyword = SearchKeyword.builder()
                    .keyword(keyword)
                    .province(province)
                    .build();
            TrackInfo trackInfo = TrackInfo.builder()
                    .shopId(jsonNode.get("trackInfo").get("shopId").asText())
                    .shopName(jsonNode.get("trackInfo").get("shopName").asText())
                    .shopImageUrl(jsonNode.get("trackInfo").get("shopImageUrl").asText())
                    .category(jsonNode.get("trackInfo").get("category").asText())
                    .address(jsonNode.get("trackInfo").get("address").asText())
                    .roadAddress(jsonNode.get("trackInfo").get("roadAddress").asText())
                    .visitorReviewCount(jsonNode.get("trackInfo").get("visitorReviewCount").asText())
                    .blogReviewCount(jsonNode.get("trackInfo").get("blogReviewCount").asText())
                    .scoreInfo(jsonNode.get("trackInfo").get("scoreInfo").asText())
                    .saveCount(jsonNode.get("trackInfo").get("saveCount").asText())
                    .build();
            RankInfo rankInfo = RankInfo.builder()
                    .rank(jsonNode.get("rankInfo").get("rank").asInt())
                    .totalCount(jsonNode.get("rankInfo").get("totalCount").asInt())
                    .build();
            return NplaceRankSearchShopEntity.builder()
                    .searchKeyword(searchKeyword)
                    .trackInfo(trackInfo)
                    .rankInfo(rankInfo)
                    .build();
        }).toList();
    }

    public String getShopId() {
        return this.trackInfo.getShopId();
    }
    public String getShopName() {
        return this.trackInfo.getShopName();
    }
    public String getShopImageUrl() {
        return this.trackInfo.getShopImageUrl();
    }
    public String getCategory() {
        return this.trackInfo.getCategory();
    }
    public String getAddress() {
        return this.trackInfo.getAddress();
    }
    public String getRoadAddress() {
        return this.trackInfo.getRoadAddress();
    }
    public String getVisitorReviewCount() {
        return this.trackInfo.getVisitorReviewCount();
    }
    public String getBlogReviewCount() {
        return this.trackInfo.getBlogReviewCount();
    }
    public String getScoreInfo() {
        return this.trackInfo.getScoreInfo();
    }
    public String getSaveCount() {
        return this.trackInfo.getSaveCount();
    }
    public Integer getRank() {
        return this.rankInfo.getRank();
    }
    public Integer getTotalCount() {
        return this.rankInfo.getTotalCount();
    }


}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class SearchKeyword {

    @Column(name = "keyword")
    private String keyword;

    @Column(name = "province")
    private String province;
}

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class TrackInfo {

    @Column(name = "shop_id")
    private String shopId;

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_image_url", length = 1000)
    private String shopImageUrl;

    @Column(name = "category")
    private String category;

    @Column(name = "address")
    private String address;

    @Column(name = "road_address")
    private String roadAddress;

    @Column(name = "visitor_review_count")
    private String visitorReviewCount;

    @Column(name = "blog_review_count")
    private String blogReviewCount;

    @Column(name = "score_info")
    private String scoreInfo;

    @Column(name = "save_count")
    private String saveCount;
}

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class RankInfo {

    @Column(name = "rank_value")
    private Integer rank;

    @Column(name = "total_count")
    private Integer totalCount;
}