package kr.co.nomadlab.nomadrank.domain.group.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqConnectGroupAndShopDTOApiV1 {

    @Valid
    @NotNull(message = "group를 입력하세요.")
    private Group group;

    @Valid
    @NotNull(message = "shop를 입력하세요.")
    private List<Shop> shopList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Group {

        @NotNull(message = "id은 필수입니다.")
        private Long id;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Shop {

        @NotNull(message = "id은 필수입니다.")
        private Long id;
    }

}
