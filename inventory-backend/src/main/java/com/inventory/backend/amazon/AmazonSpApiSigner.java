package com.inventory.backend.amazon;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Component
public class AmazonSpApiSigner {

    private static final DateTimeFormatter AMZ_DATE = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'")
            .withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyyMMdd")
            .withZone(ZoneOffset.UTC);

    private final Clock clock;

    public AmazonSpApiSigner() {
        this.clock = Clock.systemUTC();
    }

    public SignedAmazonRequest sign(
            AmazonProperties properties,
            String method,
            URI uri,
            Map<String, String> query,
            String accessToken
    ) {
        Instant now = clock.instant();
        String amzDate = AMZ_DATE.format(now);
        String date = DATE.format(now);
        String host = uri.getHost();
        String canonicalQuery = canonicalQuery(query);
        String payloadHash = sha256Hex("");

        TreeMap<String, String> headers = new TreeMap<>();
        headers.put("host", host);
        headers.put("x-amz-access-token", accessToken);
        headers.put("x-amz-date", amzDate);
        if (present(properties.awsSessionToken())) {
            headers.put("x-amz-security-token", properties.awsSessionToken());
        }

        String canonicalHeaders = headers.entrySet().stream()
                .map(entry -> entry.getKey() + ":" + entry.getValue().trim() + "\n")
                .collect(Collectors.joining());
        String signedHeaders = String.join(";", headers.keySet());
        String canonicalRequest = method + "\n"
                + uri.getPath() + "\n"
                + canonicalQuery + "\n"
                + canonicalHeaders + "\n"
                + signedHeaders + "\n"
                + payloadHash;

        String scope = date + "/" + properties.region() + "/execute-api/aws4_request";
        String stringToSign = "AWS4-HMAC-SHA256\n"
                + amzDate + "\n"
                + scope + "\n"
                + sha256Hex(canonicalRequest);

        byte[] signingKey = signingKey(properties.awsSecretAccessKey(), date, properties.region());
        String signature = hmacHex(signingKey, stringToSign);
        String authorization = "AWS4-HMAC-SHA256 Credential=" + properties.awsAccessKeyId() + "/" + scope
                + ", SignedHeaders=" + signedHeaders
                + ", Signature=" + signature;

        headers.put("authorization", authorization);
        return new SignedAmazonRequest(uri.resolve(uri.getPath() + (canonicalQuery.isBlank() ? "" : "?" + canonicalQuery)), headers);
    }

    private String canonicalQuery(Map<String, String> query) {
        return new TreeMap<>(query).entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private byte[] signingKey(String secret, String date, String region) {
        byte[] kDate = hmac(("AWS4" + secret).getBytes(StandardCharsets.UTF_8), date);
        byte[] kRegion = hmac(kDate, region);
        byte[] kService = hmac(kRegion, "execute-api");
        return hmac(kService, "aws4_request");
    }

    private static String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8)
                .replace("+", "%20")
                .replace("*", "%2A")
                .replace("%7E", "~");
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new AmazonApiException("Unable to hash Amazon request", ex);
        }
    }

    private static byte[] hmac(byte[] key, String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new AmazonApiException("Unable to sign Amazon request", ex);
        }
    }

    private static String hmacHex(byte[] key, String value) {
        return HexFormat.of().formatHex(hmac(key, value));
    }

    private static boolean present(String value) {
        return value != null && !value.isBlank();
    }
}
