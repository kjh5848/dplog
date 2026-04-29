package kr.co.nomadlab.dplog.license;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import kr.co.nomadlab.dplog.auth.AppUser;
import kr.co.nomadlab.dplog.common.ApiException;
import kr.co.nomadlab.dplog.config.DplogProperties;
import kr.co.nomadlab.dplog.owner.OwnerVerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LicenseService {
    private final LicenseRepository licenseRepository;
    private final DeleteKeyRequestRepository deleteKeyRequestRepository;
    private final LicenseActivationRepository activationRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final OwnerVerificationService ownerVerificationService;
    private final KeyHashService keyHashService;
    private final DplogProperties properties;

    public LicenseService(
            LicenseRepository licenseRepository,
            DeleteKeyRequestRepository deleteKeyRequestRepository,
            LicenseActivationRepository activationRepository,
            AdminAuditLogRepository auditLogRepository,
            OwnerVerificationService ownerVerificationService,
            KeyHashService keyHashService,
            DplogProperties properties
    ) {
        this.licenseRepository = licenseRepository;
        this.deleteKeyRequestRepository = deleteKeyRequestRepository;
        this.activationRepository = activationRepository;
        this.auditLogRepository = auditLogRepository;
        this.ownerVerificationService = ownerVerificationService;
        this.keyHashService = keyHashService;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public LicenseStateResponse getMyLicense(AppUser user) {
        boolean verifiedOwner = ownerVerificationService.hasVerifiedOwner(user);
        LicenseResponse license = licenseRepository.findByOwnerAndStatus(user, LicenseStatus.ACTIVE)
                .map(existing -> LicenseResponse.from(existing, deleteKeyRequestRepository.findByLicense(existing).orElse(null), null))
                .orElse(null);
        return new LicenseStateResponse(verifiedOwner, license);
    }

    @Transactional
    public LicenseResponse requestProductKey(AppUser user) {
        if (!ownerVerificationService.hasVerifiedOwner(user)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "OWNER_NOT_VERIFIED", "사업자 진위확인과 음식점 확인이 필요합니다.");
        }

        return licenseRepository.findByOwnerAndStatus(user, LicenseStatus.ACTIVE)
                .map(existing -> LicenseResponse.from(existing, deleteKeyRequestRepository.findByLicense(existing).orElse(null), null))
                .orElseGet(() -> issueNewLicense(user));
    }

    @Transactional
    public VerifyLicenseResponse verifyLicense(VerifyLicenseRequest request) {
        String productKey = request.effectiveProductKey();
        if (productKey == null || productKey.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PRODUCT_KEY_REQUIRED", "제품키가 필요합니다.");
        }

        License license = licenseRepository.findByProductKeyHashAndStatus(keyHashService.hashKey(productKey), LicenseStatus.ACTIVE)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "LICENSE_INVALID", "유효하지 않은 제품키입니다."));
        upsertActivation(license, request);
        return new VerifyLicenseResponse(true, license.getId(), license.getPlan(), license.getStatus(), Instant.now());
    }

    @Transactional(readOnly = true)
    public DownloadArtifactsResponse getDownloadArtifacts() {
        return new DownloadArtifactsResponse(
                properties.getLicense().getMacDownloadUrl(),
                properties.getLicense().getWindowsDownloadUrl(),
                "0.1.0"
        );
    }

    @Transactional(readOnly = true)
    public AdminDashboardSummary getAdminSummary() {
        return new AdminDashboardSummary(
                licenseRepository.countByStatus(LicenseStatus.ACTIVE),
                deleteKeyRequestRepository.countByStatus(DeleteKeyRequestStatus.PENDING_ADMIN_APPROVAL),
                activationRepository.count()
        );
    }

    @Transactional(readOnly = true)
    public List<AdminLicenseDto> getAdminLicenses() {
        return licenseRepository.findAll().stream()
                .map(AdminLicenseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminDeleteKeyRequestDto> getAdminDeleteKeyRequests() {
        return deleteKeyRequestRepository.findTop20ByOrderByRequestedAtDesc().stream()
                .map(AdminDeleteKeyRequestDto::from)
                .toList();
    }

    @Transactional
    public AdminDeleteKeyApprovalResponse approveDeleteKey(UUID requestId, AppUser adminUser) {
        DeleteKeyRequest request = deleteKeyRequestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "DELETE_KEY_REQUEST_NOT_FOUND", "삭제키 요청을 찾을 수 없습니다."));
        if (request.getStatus() != DeleteKeyRequestStatus.PENDING_ADMIN_APPROVAL) {
            throw new ApiException(HttpStatus.CONFLICT, "DELETE_KEY_ALREADY_HANDLED", "이미 처리된 삭제키 요청입니다.");
        }
        String deleteKey = keyHashService.generateDeleteKey();
        request.setDeleteKeyHash(keyHashService.hashKey(deleteKey));
        request.setApprovedAt(Instant.now());
        request.setApprovedBy(adminUser);
        request.setOneTimeViewedAt(Instant.now());
        request.setStatus(DeleteKeyRequestStatus.APPROVED);
        deleteKeyRequestRepository.save(request);
        audit(adminUser, "DELETE_KEY_APPROVED", request.getId().toString(), "삭제키 승인 및 1회 표시");
        return new AdminDeleteKeyApprovalResponse(request.getId(), request.getLicense().getId(), request.getStatus(), deleteKey);
    }

    @Transactional
    public LicenseResponse revokeLicense(UUID licenseId, AppUser adminUser) {
        License license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "LICENSE_NOT_FOUND", "라이선스를 찾을 수 없습니다."));
        license.setStatus(LicenseStatus.REVOKED);
        License saved = licenseRepository.save(license);
        audit(adminUser, "LICENSE_REVOKED", licenseId.toString(), "관리자 라이선스 폐기");
        return LicenseResponse.from(saved, deleteKeyRequestRepository.findByLicense(saved).orElse(null), null);
    }

    private LicenseResponse issueNewLicense(AppUser user) {
        String productKey = keyHashService.generateProductKey();
        License license = new License();
        license.setOwner(user);
        license.setProductKeyHash(keyHashService.hashKey(productKey));
        license.setKeyPrefix(keyHashService.prefix(productKey));
        license.setKeyLast4(keyHashService.last4(productKey));
        license.setStatus(LicenseStatus.ACTIVE);
        license.setPlan("BETA");
        License savedLicense = licenseRepository.save(license);

        DeleteKeyRequest deleteKeyRequest = new DeleteKeyRequest();
        deleteKeyRequest.setLicense(savedLicense);
        deleteKeyRequest.setStatus(DeleteKeyRequestStatus.PENDING_ADMIN_APPROVAL);
        DeleteKeyRequest savedDeleteKeyRequest = deleteKeyRequestRepository.save(deleteKeyRequest);

        return LicenseResponse.from(savedLicense, savedDeleteKeyRequest, productKey);
    }

    private void upsertActivation(License license, VerifyLicenseRequest request) {
        String deviceHash = keyHashService.hashSensitive(request.deviceId());
        LicenseActivation activation = activationRepository.findByLicenseAndDeviceIdHash(license, deviceHash)
                .orElseGet(LicenseActivation::new);
        activation.setLicense(license);
        activation.setDeviceIdHash(deviceHash);
        activation.setPlatform(request.platform());
        activation.setAppVersion(request.appVersion());
        activationRepository.save(activation);
    }

    private void audit(AppUser adminUser, String action, String targetId, String memo) {
        AdminAuditLog log = new AdminAuditLog();
        log.setAdminUser(adminUser);
        log.setAction(action);
        log.setTargetId(targetId);
        log.setMemo(memo);
        auditLogRepository.save(log);
    }
}
