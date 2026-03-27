package kr.co.nomadlab.nomadrank.domain.product.enums;

import lombok.Getter;

@Getter
public enum ProductSort {
     NPLACE_CAMPAIGN_TRAFFIC("N플레이스 유저 유입"),
     NPLACE_RANK("N플레이스 순위추적");

     private final String value;

     ProductSort(String value) {
          this.value = value;
     }
}
