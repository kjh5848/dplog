package kr.co.nomadlab.dplog.owner;

public record BusinessRegistrationResult(boolean valid, boolean unavailable, String message) {
    public static BusinessRegistrationResult verified() {
        return new BusinessRegistrationResult(true, false, "사업자 진위확인에 성공했습니다.");
    }

    public static BusinessRegistrationResult invalid(String message) {
        return new BusinessRegistrationResult(false, false, message);
    }

    public static BusinessRegistrationResult unavailable(String message) {
        return new BusinessRegistrationResult(false, true, message);
    }
}
