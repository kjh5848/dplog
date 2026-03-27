package kr.co.nomadlab.nomadrank.domain.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ResCheckUsernameDTOApiV1 {
    private String username;
    private boolean available;
} 