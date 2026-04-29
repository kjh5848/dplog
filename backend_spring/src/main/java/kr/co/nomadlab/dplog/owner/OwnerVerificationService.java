package kr.co.nomadlab.dplog.owner;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import kr.co.nomadlab.dplog.auth.AppUser;
import kr.co.nomadlab.dplog.license.KeyHashService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OwnerVerificationService {
    private final OwnerVerificationRepository ownerVerificationRepository;
    private final BusinessRegistrationVerifier businessRegistrationVerifier;
    private final KeyHashService keyHashService;

    public OwnerVerificationService(
            OwnerVerificationRepository ownerVerificationRepository,
            BusinessRegistrationVerifier businessRegistrationVerifier,
            KeyHashService keyHashService
    ) {
        this.ownerVerificationRepository = ownerVerificationRepository;
        this.businessRegistrationVerifier = businessRegistrationVerifier;
        this.keyHashService = keyHashService;
    }

    @Transactional
    public OwnerVerificationResponse submit(AppUser user, OwnerVerificationRequest request) {
        OwnerVerification verification = new OwnerVerification();
        verification.setUser(user);
        verification.setBusinessNumberHash(keyHashService.hashSensitive(normalizeBusinessNumber(request.businessNumber())));
        verification.setOpeningDate(request.openingDate());
        verification.setRepresentativeNameHash(keyHashService.hashSensitive(request.representativeName().trim()));
        verification.setPlaceId(request.placeId().trim());
        verification.setPlaceName(request.placeName().trim());
        verification.setCategory(request.category().trim());

        if (!isRestaurantCategory(request.category())) {
            verification.setStatus(OwnerVerificationStatus.REJECTED_NOT_RESTAURANT);
            verification.setStatusReason("음식점 업종으로 확인되지 않았습니다.");
            return OwnerVerificationResponse.from(ownerVerificationRepository.save(verification));
        }

        String openingDate = request.openingDate().format(DateTimeFormatter.BASIC_ISO_DATE);
        BusinessRegistrationResult result = businessRegistrationVerifier.verify(
                normalizeBusinessNumber(request.businessNumber()),
                openingDate,
                request.representativeName().trim()
        );

        if (result.unavailable()) {
            verification.setStatus(OwnerVerificationStatus.EXTERNAL_UNAVAILABLE);
            verification.setStatusReason(result.message());
        } else if (result.valid()) {
            verification.setStatus(OwnerVerificationStatus.VERIFIED);
            verification.setStatusReason(result.message());
            verification.setVerifiedAt(Instant.now());
        } else {
            verification.setStatus(OwnerVerificationStatus.REJECTED_INVALID_BUSINESS);
            verification.setStatusReason(result.message());
        }
        return OwnerVerificationResponse.from(ownerVerificationRepository.save(verification));
    }

    @Transactional(readOnly = true)
    public List<OwnerVerificationResponse> getMine(AppUser user) {
        return ownerVerificationRepository.findTop5ByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(OwnerVerificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean hasVerifiedOwner(AppUser user) {
        return ownerVerificationRepository.existsByUserAndStatus(user, OwnerVerificationStatus.VERIFIED);
    }

    private String normalizeBusinessNumber(String businessNumber) {
        return businessNumber.replaceAll("[^0-9]", "");
    }

    private boolean isRestaurantCategory(String category) {
        String normalized = category == null ? "" : category.replaceAll("\\s+", "");
        return List.of("음식", "식당", "한식", "중식", "일식", "양식", "분식", "카페", "베이커리", "치킨", "피자", "고기", "주점")
                .stream()
                .anyMatch(normalized::contains);
    }
}
