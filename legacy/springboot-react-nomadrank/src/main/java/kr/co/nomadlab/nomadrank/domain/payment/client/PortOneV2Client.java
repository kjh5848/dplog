package kr.co.nomadlab.nomadrank.domain.payment.client;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import kr.co.nomadlab.nomadrank.config.PortOneV2Config;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.BillingKeyPaymentRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.PaymentScheduleCreateRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.BillingKeyInfoResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.BillingKeyInfoResponse.CardInfo;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleCreateResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleDeleteResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleInfo;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PortOnePreRegisterResponse;
import kr.co.nomadlab.nomadrank.domain.payment.exception.PortOneApiException;
import lombok.extern.slf4j.Slf4j;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * 포트원 V2 REST API 클라이언트
 */
@Slf4j
@Service
public class PortOneV2Client {

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final PortOneV2Config config;

    private static final MediaType JSON_MEDIA_TYPE = MediaType.parse("application/json; charset=utf-8");

    public PortOneV2Client(PortOneV2Config config, ObjectMapper objectMapper) {
        this.config = config;
        this.objectMapper = objectMapper;
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .retryOnConnectionFailure(true)
                .build();
    }

    /**
     * 결제 사전등록
     */
    public PortOnePreRegisterResponse preRegisterPayment(String paymentId,
            BigDecimal totalAmount,
            String currency) {
        try {
            long totalAmountValue = totalAmount.longValueExact();

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("totalAmount", totalAmountValue);

            if (currency != null && !currency.isBlank()) {
                requestBody.put("currency", currency);
            }

            String storeId = config.getV2().getStoreId();
            if (storeId != null && !storeId.isBlank()) {
                requestBody.put("storeId", storeId);
            }

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);

            String baseUrl = normalizeBaseUrl(config.getV2().getApiUrl());
            String url = baseUrl + "/payments/" + paymentId + "/pre-register";

            String authorizationHeader = "PortOne " + config.getV2().getApiSecret();
            String idempotencyKeyHeader = buildIdempotencyKey(paymentId);

            log.info("[PortOne] 1. 사전등록 요청 준비 - url={}, body={}, Authorization={}, Idempotency-Key={}",
                    url, jsonBody, maskSecret(authorizationHeader), idempotencyKeyHeader);

            Request request = new Request.Builder()
                    .url(url)
                    .post(body)
                    .addHeader("Authorization", authorizationHeader)
                    .addHeader("Content-Type", "application/json")
                    // .addHeader("Idempotency-Key", idempotencyKeyHeader)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";
                JsonNode jsonNode = responseBody.isBlank() ? objectMapper.createObjectNode()
                        : objectMapper.readTree(responseBody);

                if (!response.isSuccessful()) {
                    int statusCode = response.code();
                    String errorCode = jsonNode.path("code").asText();
                    String errorMessage = jsonNode.path("message").asText(response.message());

                    log.error(
                            "[PortOne] 3. 결제 사전등록 실패 - url={}, status={}, code={}, message={}, body={}, requestBody={}, headers={{Authorization={}, Idempotency-Key={}}}",
                            url, statusCode, errorCode, errorMessage, responseBody, jsonBody,
                            maskSecret(authorizationHeader), idempotencyKeyHeader);

                    throw new RuntimeException("포트원 결제 사전등록 실패: " +
                            (errorMessage != null && !errorMessage.isBlank() ? errorMessage : ("HTTP " + statusCode)));
                }

                String responseType = jsonNode.path("type").asText(null);
                if (responseType != null && !responseType.isBlank() && !"NULL".equalsIgnoreCase(responseType)) {
                    String errorMessage = jsonNode.path("message").asText("포트원 응답 확인 필요");
                    log.error(
                            "[PortOne] 3-1. 결제 사전등록 오류 응답 - type={}, message={}, body={}, requestBody={}, headers={{Authorization={}, Idempotency-Key={}}}",
                            responseType, errorMessage, responseBody, jsonBody,
                            maskSecret(authorizationHeader), idempotencyKeyHeader);

                    throw new RuntimeException("포트원 결제 사전등록 실패: " + errorMessage);
                }

                String status = jsonNode.path("status").asText("PREPARED");
                OffsetDateTime preparedAt = parseOffsetDateTime(jsonNode.path("preparedAt").asText(null));

                log.info("[PortOne] 2. 결제 사전등록 성공 - status={}, preparedAt={}", status, preparedAt);

                return PortOnePreRegisterResponse.builder()
                        .success(true)
                        .paymentId(paymentId)
                        .status(status)
                        .totalAmount(totalAmount)
                        .currency(currency != null ? currency : "KRW")
                        .preparedAt(preparedAt)
                        .rawResponse(responseBody)
                        .build();
            }

        } catch (ArithmeticException e) {
            log.error("결제 금액 변환 오류 - paymentId: {}, amount: {}", paymentId, totalAmount, e);
            throw new RuntimeException("결제 금액이 올바르지 않습니다", e);
        } catch (IOException e) {
            log.error("[PortOne] 4. 결제 사전등록 통신 오류 - paymentId={}, message={}", paymentId, e.getMessage(), e);
            throw new RuntimeException("결제 사전등록 중 오류 발생", e);
        }
    }

    private OffsetDateTime parseOffsetDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
            log.debug("PortOne OffsetDateTime 파싱 실패: {}", value);
            return null;
        }
    }

    private String normalizeBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalStateException("PortOne API URL이 설정되지 않았습니다.");
        }

        String normalized = url.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        return normalized;
    }

    private String maskSecret(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }

        if (value.length() <= 8) {
            return "****";
        }

        return value.substring(0, 4) + "****" + value.substring(value.length() - 4);
    }

    private String buildIdempotencyKey(String baseKey) {
        String source = baseKey != null ? baseKey : "";
        StringBuilder filtered = new StringBuilder();

        for (char c : source.toCharArray()) {
            if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-' || c == '_') {
                filtered.append(c);
            }
        }

        if (filtered.length() < 16) {
            String fallback = java.util.UUID.randomUUID().toString().replace("-", "");
            filtered.append(fallback);
        }

        String key = filtered.toString();
        if (key.length() > 256) {
            key = key.substring(0, 256);
        }

        return key;
    }

    /**
     * 빌링키 정보 조회
     */
    public BillingKeyInfoResponse getBillingKeyInfo(String issueId) {
        try {
            String url = normalizeBaseUrl(config.getV2().getApiUrl()) + "/billing-keys/" + issueId;

            Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .addHeader("Authorization", "PortOne " + config.getV2().getApiSecret())
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "{}";

                if (!response.isSuccessful()) {
                    log.error("빌링키 조회 실패: HTTP {}, Body: {}", response.code(), responseBody);
                    throw new RuntimeException("빌링키 조회 실패: " + response.code());
                }

                JsonNode jsonNode = objectMapper.readTree(responseBody);

                // 응답에서 빌링키 정보 추출
                return BillingKeyInfoResponse.builder()
                        .issueId(issueId)
                        .billingKey(jsonNode.path("billingKey").asText())
                        .status(jsonNode.path("status").asText())
                        .cardInfo(extractCardInfo(jsonNode.path("card")))
                        .build();

            }
        } catch (IOException e) {
            log.error("빌링키 조회 중 오류 발생", e);
            throw new RuntimeException("빌링키 조회 중 오류 발생", e);
        }
    }

    /**
     * 빌링키로 결제 실행 (PortOne V2 API)
     */
    public PaymentResponse payWithBillingKey(BillingKeyPaymentRequest request) {
        try {
            String url = normalizeBaseUrl(config.getV2().getApiUrl())
                    + "/payments/" + request.getPaymentId() + "/billing-key";

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("billingKey", request.getBillingKey());
            requestBody.put("orderName", request.getOrderName());

            long totalAmount = request.getAmount().setScale(0, java.math.RoundingMode.HALF_UP).longValue();
            requestBody.put("amount", Map.of("total", totalAmount));
            requestBody.put("currency", request.getCurrency());

            Map<String, Object> customerPayload = request.getCustomer();
            if (customerPayload != null && !customerPayload.isEmpty()) {
                requestBody.put("customer", customerPayload);
            } else {
                log.warn("[PortOne] 빌링키 결제 요청에 customer 정보가 누락되었습니다 - paymentId={}", request.getPaymentId());
            }
            requestBody.put("productCount", 1);

            // JSON 직렬화
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            MediaType JSON_MEDIA_TYPE = MediaType.parse("application/json; charset=utf-8");
            RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);

            Request httpRequest = new Request.Builder()
                    .url(url)
                    .post(body)
                    .addHeader("Authorization", "PortOne " + config.getV2().getApiSecret())
                    .addHeader("Content-Type", "application/json; charset=utf-8")
                    .build();

            log.info("[PortOne Debug] 빌링키 결제 요청 - url={}, body={}", url, jsonBody);

            try (Response response = httpClient.newCall(httpRequest).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "{}";
                log.info("[PortOne Debug] 빌링키 결제 응답 - httpStatus={}, body={}", response.code(), responseBody);

                JsonNode jsonNode = objectMapper.readTree(responseBody);

                // 1. status 직접 확인
                String status = jsonNode.path("status").asText();

                // 2. fallback: payment.pgTxId 존재하면 성공 처리
                boolean hasPgTxId = jsonNode.path("payment").has("pgTxId");

                // 3. 성공 여부 판단
                boolean isSuccess = response.isSuccessful() &&
                        ("PAID".equalsIgnoreCase(status) || hasPgTxId);

                // 4. paidAt 보정
                String paidAt = jsonNode.path("paidAt").asText();
                if (paidAt.isBlank() && jsonNode.path("payment").has("paidAt")) {
                    paidAt = jsonNode.path("payment").path("paidAt").asText();
                }

                // 5. 에러 메시지 추출 (실패 시)
                String errorMessage = null;
                if (!isSuccess) {
                    errorMessage = jsonNode.path("message").asText();
                    if (errorMessage == null || errorMessage.isBlank()) {
                        errorMessage = response.message();
                    }
                }

                // 결과 반환
                return PaymentResponse.builder()
                        .success(isSuccess)
                        .paymentId(request.getPaymentId())
                        .status(status.isBlank() && hasPgTxId ? "PAID" : status)
                        .amount(request.getAmount())
                        .paidAt(paidAt)
                        .errorMessage(errorMessage)
                        .build();
            }

        } catch (IOException e) {
            log.error("빌링키 결제 중 오류 발생", e);
            return PaymentResponse.builder()
                    .success(false)
                    .paymentId(request.getPaymentId())
                    .errorMessage("결제 처리 중 오류 발생: " + e.getMessage())
                    .build();
        }
    }

    /**
     * 포트원 결제 취소 요청
     */
    public PaymentResponse cancelPayment(String paymentId, BigDecimal cancelAmount, String reason) {
        try {
            String baseUrl = normalizeBaseUrl(config.getV2().getApiUrl());
            String url = baseUrl + "/payments/" + paymentId + "/cancel";

            Map<String, Object> requestBody = new LinkedHashMap<>();
            if (cancelAmount != null) {
                requestBody.put("amount", cancelAmount.longValueExact());
            }
            if (reason != null && !reason.isBlank()) {
                requestBody.put("reason", reason);
            }

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);

            Request httpRequest = new Request.Builder()
                    .url(url)
                    .post(body)
                    .addHeader("Authorization", "PortOne " + config.getV2().getApiSecret())
                    .addHeader("Content-Type", "application/json")
                    .build();

            log.info("[PortOne] 결제 취소 요청 - paymentId={}, body={}", paymentId, jsonBody);

            try (Response response = httpClient.newCall(httpRequest).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "{}";
                JsonNode jsonNode = objectMapper.readTree(responseBody);

                if (!response.isSuccessful()) {
                    String errorMessage = jsonNode.path("message").asText(response.message());
                    log.error("[PortOne] 결제 취소 실패 - paymentId={}, status={}, message={}, body={}",
                            paymentId, response.code(), errorMessage, responseBody);
                    return PaymentResponse.builder()
                            .success(false)
                            .paymentId(paymentId)
                            .status("CANCEL_FAILED")
                            .amount(cancelAmount)
                            .errorMessage(errorMessage)
                            .build();
                }

                String status = jsonNode.path("status").asText("CANCELLED");
                String message = jsonNode.path("message").asText(null);

                log.info("[PortOne] 결제 취소 성공 - paymentId={}, status={}", paymentId, status);

                return PaymentResponse.builder()
                        .success(true)
                        .paymentId(paymentId)
                        .status(status)
                        .amount(cancelAmount)
                        .errorMessage(message)
                        .build();
            }
        } catch (ArithmeticException arithmeticException) {
            log.error("[PortOne] 결제 취소 금액 변환 실패 - paymentId={}, message={}",
                    paymentId, arithmeticException.getMessage(), arithmeticException);
            throw new RuntimeException("결제 취소 금액이 올바르지 않습니다.", arithmeticException);
        } catch (IOException ioException) {
            log.error("[PortOne] 결제 취소 통신 오류 - paymentId={}, message={}",
                    paymentId, ioException.getMessage(), ioException);
            throw new RuntimeException("결제 취소 중 오류가 발생했습니다.", ioException);
        }
    }

    /**
     * 결제 예약 생성 (/payments/{paymentId}/schedule)
     */
    public PaymentScheduleCreateResponse createPaymentSchedule(PaymentScheduleCreateRequest request) {
        try {
            String resolvedChannelKey = config.getV2().getChannelKey();
            String resolvedStoreId = config.getV2().getStoreId();

            Map<String, Object> paymentPayload = new LinkedHashMap<>();
            if (resolvedStoreId != null && !resolvedStoreId.isBlank()) {
                paymentPayload.put("storeId", resolvedStoreId);
            }
            paymentPayload.put("billingKey", request.getBillingKey());
            paymentPayload.put("orderName", request.getOrderName());
            paymentPayload.put("amount", Map.of("total", request.getAmount().longValueExact()));
            paymentPayload.put("currency", request.getCurrency());
            paymentPayload.put("productCount", request.getProductCount());

            if (resolvedChannelKey != null && !resolvedChannelKey.isBlank()) {
                paymentPayload.put("channelKey", resolvedChannelKey);
            }

            if (request.getCustomer() != null && !request.getCustomer().isEmpty()) {
                paymentPayload.put("customer", request.getCustomer());
            }

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("payment", paymentPayload);
            requestBody.put("timeToPay", request.getTimeToPay().toString());

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);

            String baseUrl = normalizeBaseUrl(config.getV2().getApiUrl());
            String url = baseUrl + "/payments/" + request.getPaymentId() + "/schedule";

            String authorizationHeader = "PortOne " + config.getV2().getApiSecret();

            log.info("[PortOne] 결제 예약 요청 - url={}, paymentId={}, body={}",
                    url, request.getPaymentId(), jsonBody);

            Request httpRequest = new Request.Builder()
                    .url(url)
                    .post(body)
                    .addHeader("Authorization", authorizationHeader)
                    .addHeader("Content-Type", "application/json")
                    .build();

            try (Response response = httpClient.newCall(httpRequest).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "{}";
                JsonNode jsonNode = objectMapper.readTree(responseBody);

                if (!response.isSuccessful()) {
                    String errorCode = jsonNode.path("code").asText();
                    String errorMessage = jsonNode.path("message").asText(response.message());

                    log.error("[PortOne] 결제 예약 실패 - url={}, status={}, code={}, message={}, body={}",
                            url, response.code(), errorCode, errorMessage, responseBody);

                    return PaymentScheduleCreateResponse.builder()
                            .success(false)
                            .errorCode(errorCode)
                            .errorMessage(errorMessage)
                            .rawResponse(responseBody)
                            .paymentId(request.getPaymentId())
                            .build();
                }

                JsonNode scheduleNode = jsonNode.path("schedule");
                String scheduleId = jsonNode.path("id").asText(null);
                if ((scheduleId == null || scheduleId.isBlank()) && scheduleNode.isObject()) {
                    scheduleId = scheduleNode.path("id").asText(null);
                }

                String status = jsonNode.path("status").asText(null);
                if ((status == null || status.isBlank()) && scheduleNode.isObject()) {
                    status = scheduleNode.path("status").asText(null);
                }

                OffsetDateTime scheduleAt = parseOffsetDateTime(jsonNode.path("timeToPay").asText(null));
                if (scheduleAt == null && scheduleNode.isObject()) {
                    scheduleAt = parseOffsetDateTime(scheduleNode.path("timeToPay").asText(null));
                }

                log.info("[PortOne] 결제 예약 성공 - scheduleId={}, paymentId={}, timeToPay={}",
                        scheduleId, request.getPaymentId(), scheduleAt);

                return PaymentScheduleCreateResponse.builder()
                        .success(true)
                        .scheduleId(scheduleId)
                        .status(status)
                        .timeToPay(scheduleAt)
                        .paymentId(request.getPaymentId())
                        .rawResponse(responseBody)
                        .build();
            }
        } catch (ArithmeticException e) {
            log.error("[PortOne] 결제 예약 금액 변환 실패 - paymentId={}, message={}",
                    request.getPaymentId(), e.getMessage(), e);
            throw new RuntimeException("결제 예약 금액이 올바르지 않습니다", e);
        } catch (IOException e) {
            log.error("[PortOne] 결제 예약 통신 오류 - paymentId={}, message={}",
                    request.getPaymentId(), e.getMessage(), e);
            throw new RuntimeException("결제 예약 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 결제 예약 단건 조회
     */
    public PaymentScheduleInfo getPaymentSchedule(String scheduleId) {
        if (scheduleId == null || scheduleId.isBlank()) {
            throw new IllegalArgumentException("scheduleId는 필수입니다.");
        }

        try {
            String baseUrl = normalizeBaseUrl(config.getV2().getApiUrl());
            String url = baseUrl + "/payment-schedules/" + scheduleId;

            Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .addHeader("Authorization", "PortOne " + config.getV2().getApiSecret())
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "{}";
                if (!response.isSuccessful()) {
                    JsonNode errorNode = responseBody.isBlank()
                            ? objectMapper.createObjectNode()
                            : objectMapper.readTree(responseBody);
                    String errorCode = errorNode.path("code").asText();
                    String errorMessage = errorNode.path("message").asText(response.message());
                    log.error("[PortOne] 결제 예약 단건 조회 실패 - scheduleId={}, status={}, code={}, message={}, body={}",
                            scheduleId, response.code(), errorCode, errorMessage, responseBody);
                    throw new PortOneApiException(response.code(), errorCode,
                            "포트원 결제 예약 조회 실패: " + errorMessage);
                }

                JsonNode root = objectMapper.readTree(responseBody);
                PaymentScheduleInfo scheduleInfo = mapScheduleNode(root);
                log.info("[PortOne] 결제 예약 단건 조회 성공 - scheduleId={}", scheduleId);
                return scheduleInfo;
            }
        } catch (IOException e) {
            log.error("[PortOne] 결제 예약 단건 조회 중 통신 오류 - scheduleId={}, message={}",
                    scheduleId, e.getMessage(), e);
            throw new PortOneApiException(502, "IO_ERROR", "결제 예약 조회 중 통신 오류가 발생했습니다.", e);
        }
    }

    /**
     * 결제 예약 삭제 (billingKey 기준)
     */
    public PaymentScheduleDeleteResponse deletePaymentSchedules(String billingKey) {
        if (billingKey == null || billingKey.isBlank()) {
            throw new IllegalArgumentException("billingKey는 필수입니다.");
        }

        try {
            Map<String, Object> requestBody = new LinkedHashMap<>();
            String storeId = config.getV2().getStoreId();
            if (storeId != null && !storeId.isBlank()) {
                requestBody.put("storeId", storeId);
            }
            requestBody.put("billingKey", billingKey);

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);

            String baseUrl = normalizeBaseUrl(config.getV2().getApiUrl());
            String url = baseUrl + "/payment-schedules";

            Request request = new Request.Builder()
                    .url(url)
                    .delete(body)
                    .addHeader("Authorization", "PortOne " + config.getV2().getApiSecret())
                    .addHeader("Content-Type", "application/json")
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";
                if (!response.isSuccessful()) {
                    JsonNode errorNode = responseBody.isBlank()
                            ? objectMapper.createObjectNode()
                            : objectMapper.readTree(responseBody);
                    String errorCode = errorNode.path("code").asText();
                    String errorMessage = errorNode.path("message").asText(response.message());
                    log.error("[PortOne] 결제 예약 삭제 실패 - billingKey={}, status={}, code={}, message={}, body={}",
                            maskBillingKey(billingKey), response.code(), errorCode, errorMessage, responseBody);
                    throw new PortOneApiException(response.code(), errorCode,
                            "포트원 결제 예약 삭제 실패: " + errorMessage);
                }

                OffsetDateTime revokedAt = null;
                if (!responseBody.isBlank()) {
                    JsonNode root = objectMapper.readTree(responseBody);
                    revokedAt = parseOffsetDateTime(root.path("revokedAt").asText(null));
                }

                log.info("[PortOne] 결제 예약 삭제 성공 - billingKey={}, revokedAt={}",
                        maskBillingKey(billingKey), revokedAt);
                return PaymentScheduleDeleteResponse.builder()
                        .revokedAt(revokedAt)
                        .build();
            }
        } catch (IOException e) {
            log.error("[PortOne] 결제 예약 삭제 중 통신 오류 - billingKey={}, message={}",
                    maskBillingKey(billingKey), e.getMessage(), e);
            throw new PortOneApiException(502, "IO_ERROR", "결제 예약 삭제 중 통신 오류가 발생했습니다.", e);
        }
    }

    /**
     * 빌링키 삭제
     */
    public void deleteBillingKey(String billingKey, String reason) {
        String baseUrl = normalizeBaseUrl(config.getV2().getApiUrl());
        HttpUrl.Builder urlBuilder = HttpUrl.parse(baseUrl + "/billing-keys/" + billingKey).newBuilder();

        String storeId = config.getV2().getStoreId();
        if (storeId != null && !storeId.isBlank()) {
            urlBuilder.addQueryParameter("storeId", storeId);
        }
        if (reason != null && !reason.isBlank()) {
            urlBuilder.addQueryParameter("reason", reason);
        }

        Request request = new Request.Builder()
                .url(urlBuilder.build())
                .delete()
                .addHeader("Authorization", "PortOne " + config.getV2().getApiSecret())
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            if (!response.isSuccessful() && response.code() != 204) {
                JsonNode errorNode = responseBody.isBlank() ? objectMapper.createObjectNode()
                        : objectMapper.readTree(responseBody);
                String errorCode = errorNode.path("code").asText();
                String errorMessage = errorNode.path("message").asText(response.message());
                log.error("[PortOne] 빌링키 삭제 실패 - billingKey={}, status={}, code={}, message={}, body={}",
                        maskBillingKey(billingKey), response.code(), errorCode, errorMessage, responseBody);
                throw new PortOneApiException(response.code(), errorCode,
                        "포트원 빌링키 삭제 실패: " + errorMessage);
            }

            log.info("[PortOne] 빌링키 삭제 성공 - billingKey={}", maskBillingKey(billingKey));
        } catch (IOException e) {
            log.error("[PortOne] 빌링키 삭제 중 통신 오류 - billingKey={}, message={}",
                    maskBillingKey(billingKey), e.getMessage(), e);
            throw new PortOneApiException(502, "IO_ERROR", "빌링키 삭제 중 통신 오류가 발생했습니다.", e);
        }
    }

    private PaymentScheduleInfo mapScheduleNode(JsonNode item) {
        String id = item.path("id").asText(null);
        String status = item.path("status").asText(null);
        OffsetDateTime scheduleAt = parseOffsetDateTime(item.path("scheduleAt").asText(null));
        OffsetDateTime executedAt = parseOffsetDateTime(item.path("executedAt").asText(null));

        BigDecimal totalAmount = null;
        JsonNode amountNode = item.path("amount");
        if (amountNode.isNumber()) {
            totalAmount = amountNode.decimalValue();
        } else if (amountNode.isObject() && amountNode.hasNonNull("total")) {
            try {
                totalAmount = new BigDecimal(amountNode.get("total").asText());
            } catch (NumberFormatException ignored) {
                log.debug("[PortOne] 결제 예약 금액 파싱 실패 - scheduleId={}, amount={}", id,
                        amountNode.get("total").asText());
            }
        }

        return PaymentScheduleInfo.builder()
                .id(id)
                .status(status)
                .scheduleAt(scheduleAt)
                .executedAt(executedAt)
                .totalAmount(totalAmount)
                .build();
    }

    private String maskBillingKey(String billingKey) {
        if (billingKey == null || billingKey.isBlank()) {
            return "****";
        }
        int length = billingKey.length();
        if (length <= 8) {
            return "****";
        }
        return billingKey.substring(0, 4) + "****" + billingKey.substring(length - 4);
    }

    private CardInfo extractCardInfo(JsonNode cardNode) {
        if (cardNode.isMissingNode()) {
            return null;
        }

        return CardInfo.builder()
                .maskedNumber(cardNode.path("number").asText())
                .issuerName(cardNode.path("issuer").path("name").asText())
                .cardType(cardNode.path("type").asText())
                .brand(cardNode.path("brand").asText())
                .build();
    }
}
