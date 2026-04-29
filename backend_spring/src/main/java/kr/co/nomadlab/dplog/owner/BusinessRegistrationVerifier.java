package kr.co.nomadlab.dplog.owner;

public interface BusinessRegistrationVerifier {
    BusinessRegistrationResult verify(String businessNumber, String openingDate, String representativeName);
}
