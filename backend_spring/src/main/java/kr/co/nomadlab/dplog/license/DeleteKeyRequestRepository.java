package kr.co.nomadlab.dplog.license;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeleteKeyRequestRepository extends JpaRepository<DeleteKeyRequest, UUID> {
    Optional<DeleteKeyRequest> findByLicense(License license);

    long countByStatus(DeleteKeyRequestStatus status);

    List<DeleteKeyRequest> findTop20ByOrderByRequestedAtDesc();
}
