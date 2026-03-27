package kr.co.nomadlab.nomadrank.util;

import jakarta.xml.bind.DatatypeConverter;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import java.security.Security;

public class NsearchadSignatures {

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    private static final String PROVIDER = "BC";
    private static final String HMAC_SHA256 = "HMac-SHA256";

    public static String of(String timestamp, String method, String resource, String key) {
        return of(timestamp + "." + method + "." + resource, key);
    }

    private static String of(String data, String key) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256, PROVIDER);
            mac.init(new SecretKeySpec(key.getBytes(), HMAC_SHA256));
            return DatatypeConverter.printBase64Binary(mac.doFinal(data.getBytes()));
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Failed to generate signature.", e);
        }
    }

}
