package kr.co.nomadlab.nomadrank.domain.product.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.product.dto.request.ReqProductPriceUpdateDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.product.service.ProductServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/product")
@Validated
public class ProductControllerApiV1 {

    private final ProductServiceApiV1 productServiceApiV1;

    @GetMapping("{id}")
    public HttpEntity<?> productPrice(
            @PathVariable(name = "id") Long id,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (!resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return productServiceApiV1.getProduct(id);
    }

    @PostMapping()
    public HttpEntity<?> update(
            @RequestBody @Valid ReqProductPriceUpdateDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (!resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return productServiceApiV1.updatePrice(reqDto);
    }

}
