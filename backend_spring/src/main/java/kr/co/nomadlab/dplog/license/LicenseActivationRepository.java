package kr.co.nomadlab.dplog.license;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LicenseActivationRepository extends JpaRepository<LicenseActivation, UUID> {
    Optional<LicenseActivation> findByLicenseAndDeviceIdHash(License license, String deviceIdHash);
}
