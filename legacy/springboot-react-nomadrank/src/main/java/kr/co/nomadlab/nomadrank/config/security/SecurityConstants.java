package kr.co.nomadlab.nomadrank.config.security;

public final class SecurityConstants {
    public static final String TOKEN_HEADER = "Authorization";
    public static final String RULE_KEY = "scope";
    public static final String TOKEN_TYPE = "type";
    public static final String TOKEN_PREFIX = "Bearer ";

    public static long accessTokenDurationHour = 12L;
    public static long refreshTokenDurationDay = 7L;
    public static String SECRET_KEY = "nomadlab";

    public static final String[] ADMIN = {
        "/actuator/**",
        "/actuator",
    };

    public static final String[] DISTRIBUTOR_MANAGER = {
    };

    public static final String[] EMPLOYEE = {
    };

    public static final String[] WHITELIST = {
            "/v1/account/login",
            "/v1/**",
            "/assets/**",
            "/",
            "/error",
            "/login",
            "/account",
            "/account-add",
            "/account/**",
            "/account/product/**",
            "/payment",
            "/payment/**",
            "/settlement",
            "/distributor",
            "/distributor/**",
            "/product",
            "/product/**",
            "/my",
            "/my/**",
            "/favicon.ico",
            "/docs/**",
            "/h2-console/**",
            "/h2-console",
    };

//    public static final List<AccountAuthoritySort> employeeAuthorities = List.of(AccountAuthoritySort.USER);
//    public static final List<AccountAuthoritySort> distributorAuthorities = List.of(AccountAuthoritySort.USER, AccountAuthoritySort.EMPLOYEE);
//    public static final List<AccountAuthoritySort> adminAuthorities = List.of(AccountAuthoritySort.USER, AccountAuthoritySort.DISTRIBUTOR_MANAGER, AccountAuthoritySort.EMPLOYEE,AccountAuthoritySort.ADMIN);

    private SecurityConstants() {
    }

}
