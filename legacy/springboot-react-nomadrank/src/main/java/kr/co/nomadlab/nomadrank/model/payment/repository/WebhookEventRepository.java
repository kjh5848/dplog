package kr.co.nomadlab.nomadrank.model.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.nomadlab.nomadrank.model.payment.entity.WebhookEventEntity;

public interface WebhookEventRepository extends JpaRepository<WebhookEventEntity, String> {
}
