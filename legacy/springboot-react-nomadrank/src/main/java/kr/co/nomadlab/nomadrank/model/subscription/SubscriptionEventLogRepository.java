package kr.co.nomadlab.nomadrank.model.subscription;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionEventLogRepository extends JpaRepository<SubscriptionEventLog, String> {

    Optional<SubscriptionEventLog> findByEventId(String eventId);
}
