package kr.co.nomadlab.nomadrank.model.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.nomadlab.nomadrank.model.payment.entity.PaymentScheduleEventEntity;

public interface PaymentScheduleEventRepository extends JpaRepository<PaymentScheduleEventEntity, String> {
}
