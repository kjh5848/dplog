package kr.co.nomadlab.dplog.license;

import java.util.Optional;
import java.util.UUID;
import kr.co.nomadlab.dplog.auth.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LicenseRepository extends JpaRepository<License, UUID> {
    Optional<License> findByOwnerAndStatus(AppUser owner, LicenseStatus status);

    Optional<License> findByProductKeyHashAndStatus(String productKeyHash, LicenseStatus status);

    long countByStatus(LicenseStatus status);
}
