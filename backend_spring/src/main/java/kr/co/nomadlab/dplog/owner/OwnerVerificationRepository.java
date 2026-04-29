package kr.co.nomadlab.dplog.owner;

import java.util.List;
import java.util.UUID;
import kr.co.nomadlab.dplog.auth.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerVerificationRepository extends JpaRepository<OwnerVerification, UUID> {
    List<OwnerVerification> findTop5ByUserOrderByCreatedAtDesc(AppUser user);

    boolean existsByUserAndStatus(AppUser user, OwnerVerificationStatus status);
}
