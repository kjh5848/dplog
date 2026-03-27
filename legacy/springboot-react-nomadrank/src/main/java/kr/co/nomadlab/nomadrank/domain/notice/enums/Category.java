package kr.co.nomadlab.nomadrank.domain.notice.enums;

import lombok.Getter;

@Getter
public enum Category {
     GENERAL("일반"),
     REWARD_PLACE("리워드 플레이스");

     private final String value;

     Category(String value) {
          this.value = value;
     }
}
