package kr.co.nomadlab.nomadrank.domain.payment.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import kr.co.nomadlab.nomadrank.model.payment.entity.ChargeEntity;
import kr.co.nomadlab.nomadrank.model.payment.repository.ChargeRepository;
import lombok.RequiredArgsConstructor;

/**
 * Charge 기반 Charge 어댑터 (전환 단계용)
 */
@Service
@RequiredArgsConstructor
public class ChargeAdapterService {

    private final ChargeRepository ChargeRepository;

    public Optional<ChargeEntity> findChargeById(String paymentId) {
        return ChargeRepository.findById(paymentId).map(this::toCharge);
    }

    public List<ChargeEntity> findChargesByInvoiceId(String invoiceId) {
        return ChargeRepository.findAll().stream()
                .filter(ph -> invoiceId.equals(ph.getInvoiceId()))
                .map(this::toCharge)
                .toList();
    }

    public Optional<ChargeEntity> findPaymentById(String paymentId) {
        return ChargeRepository.findById(paymentId);
    }

    public Optional<ChargeEntity> findByMerchantUid(String merchantUid) {
        return ChargeRepository.findByMerchantUid(merchantUid);
    }

    public Optional<ChargeEntity> findFirstBySubscriptionIdOrderByCreatedAtDesc(String subscriptionId) {
        return ChargeRepository.findFirstBySubscriptionIdOrderByCreatedAtDesc(subscriptionId);
    }

    public Optional<ChargeEntity> findLatestPaidBySubscription(String subscriptionId,
            kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus status) {
        return ChargeRepository.findFirstBySubscriptionIdAndStatusAndPortonePaymentIdIsNotNullOrderByPaidAtDesc(
                subscriptionId, status);
    }

    public List<ChargeEntity> findBySubscriptionIdOrderByCreatedAtDesc(String subscriptionId) {
        return ChargeRepository.findBySubscriptionIdOrderByCreatedAtDesc(subscriptionId);
    }

    public List<ChargeEntity> findFailedPaymentsSince(
            kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus status,
            java.time.LocalDateTime since) {
        return ChargeRepository.findFailedPaymentsSince(status, since);
    }

    public List<ChargeEntity> findSuccessfulPaymentsBySubscription(String subscriptionId,
            kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus status) {
        return ChargeRepository.findSuccessfulPaymentsBySubscription(subscriptionId, status);
    }

    public org.springframework.data.domain.Page<ChargeEntity> findByUserIdOrderByCreatedAtDesc(Long userId,
            org.springframework.data.domain.Pageable pageable) {
        return ChargeRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public List<ChargeEntity> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId,
            kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus status) {
        return ChargeRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
    }

    public ChargeEntity savePayment(ChargeEntity entity) {
        return ChargeRepository.save(entity);
    }

    public void deleteById(String paymentId) {
        ChargeRepository.deleteById(paymentId);
    }

    private ChargeEntity toCharge(ChargeEntity ph) {
        ChargeEntity charge = new ChargeEntity();
        charge.setPaymentId(ph.getPaymentId());
        charge.setInvoiceId(ph.getInvoiceId());
        charge.setSubscriptionId(ph.getSubscriptionId());
        charge.setUserId(ph.getUserId());
        charge.setAmount(ph.getAmount());
        charge.setCurrency(ph.getCurrency());
        charge.setPaymentMethod(ph.getPaymentMethod());
        charge.setStatus(ph.getStatus());
        charge.setPaymentType(ph.getPaymentType());
        charge.setChargeType(ph.getChargeType());
        charge.setPaidAt(ph.getPaidAt());
        return charge;
    }
}
