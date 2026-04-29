package kr.co.nomadlab.dplog.license;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;
import kr.co.nomadlab.dplog.config.DplogProperties;
import org.springframework.stereotype.Service;

@Service
public class KeyHashService {
    private static final char[] KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();

    private final DplogProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();

    public KeyHashService(DplogProperties properties) {
        this.properties = properties;
    }

    public String generateProductKey() {
        return properties.getLicense().getProductKeyPrefix() + "-" + randomGroup() + "-" + randomGroup()
                + "-" + randomGroup() + "-" + randomGroup();
    }

    public String generateDeleteKey() {
        return "DEL-" + randomGroup() + "-" + randomGroup() + "-" + randomGroup() + "-" + randomGroup();
    }

    public String hashKey(String value) {
        return sha256(properties.getLicense().getHashPepper() + ":license:" + value);
    }

    public String hashSensitive(String value) {
        return sha256(properties.getLicense().getHashPepper() + ":sensitive:" + value);
    }

    public String prefix(String key) {
        return key.length() <= 7 ? key : key.substring(0, 7);
    }

    public String last4(String key) {
        return key.length() <= 4 ? key : key.substring(key.length() - 4);
    }

    private String randomGroup() {
        StringBuilder builder = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            builder.append(KEY_ALPHABET[secureRandom.nextInt(KEY_ALPHABET.length)]);
        }
        return builder.toString();
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }
}
