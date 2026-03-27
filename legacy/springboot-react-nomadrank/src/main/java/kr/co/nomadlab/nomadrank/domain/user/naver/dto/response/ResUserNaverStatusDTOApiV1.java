package kr.co.nomadlab.nomadrank.domain.user.naver.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResUserNaverStatusDTOApiV1 {

    private boolean exists;

    public static ResUserNaverStatusDTOApiV1 of(
            boolean exists
    ) {
        return ResUserNaverStatusDTOApiV1.builder()
                .exists(exists)
                .build();
    }

}
