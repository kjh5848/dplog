package kr.co.nomadlab.scrap.domain.kgift.mission.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import kr.co.nomadlab.scrap.common.dto.ResDTO;
import kr.co.nomadlab.scrap.common.exception.AuthenticationException;
import kr.co.nomadlab.scrap.common.exception.BadRequestException;
import kr.co.nomadlab.scrap.domain.kgift.mission.dto.response.ResKgiftMissionGetProductWishDTOApiV1;
import kr.co.nomadlab.scrap.domain.kgift.mission.dto.response.ResKgiftMissionGetReviewEmpathyDTOApiV1;
import kr.co.nomadlab.scrap.model.db.user.entity.UserEntity;
import kr.co.nomadlab.scrap.model.db.user.repository.UserRepository;
import kr.co.nomadlab.scrap.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KgiftMissionServiceApiV1 {

    @Value("${scrap-mall-vpn}")
    private String scrapMallVpn;

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    public HttpEntity<?> getProductWish(String apiKey, String productId) {
        getUserEntityByApiKey(apiKey);
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("https://gift.kakao.com/product/%s".formatted(productId))
                .build();
        Mono<ResponseEntity<String>> responseEntityMono = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888)
                .get()
                .uri(uriComponents.toUriString())
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode() != HttpStatus.OK) {
                        throw new BadRequestException("html을 가져오지 못했습니다.");
                    } else {
                        return clientResponse.toEntity(String.class);
                    }
                });
        final Document document = Jsoup.parse(responseEntityMono.block().getBody());
        ObjectNode objectNode = new ObjectNode(objectMapper.getNodeFactory());
        if (document.selectFirst("meta[property='og:title']").attr("content").equals("카카오톡 선물하기")) {
            throw new BadRequestException("존재하지 않는 상품입니다.");
        }
        objectNode.put("productName", document.selectFirst("meta[property='og:title']").attr("content"));
        objectNode.put("productUrl", "https://gift.kakao.com/product/%s".formatted(productId));
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResKgiftMissionGetProductWishDTOApiV1.of(objectNode))
                        .build()
                , HttpStatus.OK);
    }

    public HttpEntity<?> getReviewEmpathy(String apiKey, String url) {
        getUserEntityByApiKey(apiKey);
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl(url)
                .build();
        String redirectUrl = UtilFunction.getRedirectUrl(UtilFunction.getWebClientWithProxy(scrapMallVpn, 8888), uriComponents.toUriString()).block();
        Mono<ResponseEntity<String>> responseEntityMono = UtilFunction.getWebClientAutoRedirectWithProxy(scrapMallVpn, 8888)
                .get()
                .uri(redirectUrl)
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode() != HttpStatus.OK) {
                        throw new BadRequestException("html을 가져오지 못했습니다.");
                    } else {
                        return clientResponse.toEntity(String.class);
                    }
                });
        final Document document = Jsoup.parse(responseEntityMono.block().getBody());
        ObjectNode objectNode = new ObjectNode(objectMapper.getNodeFactory());
        if (document.selectFirst("meta[property='og:title']").attr("content").equals("카카오톡 선물하기")) {
            throw new BadRequestException("존재하지 않는 상품입니다.");
        }
        objectNode.put("productName", document.selectFirst("meta[property='og:title']").attr("content"));
        objectNode.put("reviewId", UtilFunction.parseQueryString(redirectUrl).get("reviewId"));
        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResKgiftMissionGetReviewEmpathyDTOApiV1.of(objectNode))
                        .build()
                , HttpStatus.OK);
    }


    private UserEntity getUserEntityByApiKey(String apiKey) {
        Optional<UserEntity> userEntityOptional = userRepository.findByApiKeyAndDeleteDateIsNull(apiKey);
        if (userEntityOptional.isEmpty()) {
            throw new AuthenticationException("존재하지 않는 apiKey입니다.");
        }
        return userEntityOptional.get();
    }
}
