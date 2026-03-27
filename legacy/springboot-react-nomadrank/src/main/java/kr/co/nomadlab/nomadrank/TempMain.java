package kr.co.nomadlab.nomadrank;

import jakarta.xml.bind.DatatypeConverter;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.mindrot.jbcrypt.BCrypt;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.security.SignatureException;
import java.time.LocalDate;

public class TempMain {

    // nsearchad:
    //  domain: "api.searchad.naver.com"
    //  customer-id: "3195162"
    //  api-key: "0100000000ffcae5bccf4cf8428b07c6866c930cebfaed57a61a9df2c6567d67ac64218d91"
    //  secret-key: "AQAAAAD/yuW8z0z4QosHxoZskwzrVPnXBgN7aolMIpyFhC03pw=="

    public static void main(String[] args) {

        System.out.println(BCrypt.hashpw("bbswk", BCrypt.gensalt()));
        String date = "2025-01-20";
        System.out.println(LocalDate.parse(date));

//        String timestamp = String.valueOf(System.currentTimeMillis());
//        System.out.println(timestamp);
//
//        String customerId = "3195162";
//        String apiKey = "0100000000ffcae5bccf4cf8428b07c6866c930cebfaed57a61a9df2c6567d67ac64218d91";
//        String secretKey = "AQAAAAD/yuW8z0z4QosHxoZskwzrVPnXBgN7aolMIpyFhC03pw==";
//
//        try {
//            System.out.println(
//                    Signatures.of(
//                            timestamp,
//                            "GET",
//                            "/keywordstool",
//                            secretKey
//                    )
//            );
//        } catch (SignatureException e) {
//            e.printStackTrace();
//        }
    }
}

class Signatures {

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    private static final String PROVIDER = "BC";
    private static final String HMAC_SHA256 = "HMac-SHA256";

    public static String of(String timestamp, String method, String resource, String key) throws SignatureException {
        return of(timestamp + "." + method + "." + resource, key);
    }

    public static String of(String data, String key) throws SignatureException {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256, PROVIDER);
            mac.init(new SecretKeySpec(key.getBytes(), HMAC_SHA256));
            return DatatypeConverter.printBase64Binary(mac.doFinal(data.getBytes()));
        } catch (GeneralSecurityException e) {
            throw new SignatureException("Failed to generate signature.", e);
        }
    }

}