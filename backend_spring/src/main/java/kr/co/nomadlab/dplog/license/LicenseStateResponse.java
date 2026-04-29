package kr.co.nomadlab.dplog.license;

public record LicenseStateResponse(
        boolean hasVerifiedOwner,
        LicenseResponse license
) {
}
