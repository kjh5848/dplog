package kr.co.nomadlab.dplog.ranking.dto;

import kr.co.nomadlab.dplog.integration.nomadscrap.NomadscrapService;

/**
 * 트래킹 등록 응답 DTO
 */
public record TrackRegistrationResponse(
        Long id,
        String keyword,
        String province,
        String businessSector,
        String shopId,
        Integer rankChange
) {
    /** NomadscrapService.TrackRegistration → DTO 변환 */
    public static TrackRegistrationResponse from(NomadscrapService.TrackRegistration reg) {
        return new TrackRegistrationResponse(
                reg.id(), reg.keyword(), reg.province(),
                reg.businessSector(), reg.shopId(), reg.rankChange()
        );
    }
}
