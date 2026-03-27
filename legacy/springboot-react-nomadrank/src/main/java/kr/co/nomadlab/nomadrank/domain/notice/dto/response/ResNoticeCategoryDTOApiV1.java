package kr.co.nomadlab.nomadrank.domain.notice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNoticeCategoryDTOApiV1 {

    private List<Category> categoryList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Category {
        private String categoryName;
        private String categoryValue;
    }

}
