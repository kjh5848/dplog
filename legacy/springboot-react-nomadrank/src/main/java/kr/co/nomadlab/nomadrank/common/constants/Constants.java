package kr.co.nomadlab.nomadrank.common.constants;

public class Constants {

    public static class Regex {
        public static final String NSTORE_PRODUCT_ID = "^[0-9]+$";
        public static final String NSTORE_MALL_ID = "^[a-zA-Z0-9.\\-_]+$";
        public static final String NSTORE_MALL_URL = "^https://smartstore\\.naver\\.com/[a-zA-Z0-9.\\-_]+$";
        public static final String NSTORE_CATALOG_URL = "^https://search\\.shopping\\.naver\\.com/catalog/[0-9]+$";
        public static final String NSTORE_PRODUCT_URL = "^https://smartstore\\.naver\\.com/[a-zA-Z0-9.\\-_]+/products/[0-9]+$";

        public static final String NPLACE_MAP_ENTRY_SHOP_URL = "^https://map\\.naver\\.com/p/entry/place/[0-9]+$";
        public static final String NPLACE_MAP_SEARCH_SHOP_URL = "^https://map\\.naver\\.com/p/search/[^/]+/place/[0-9]+$";
        public static final String NPLACE_MAP_MOBILE_SHOP_URL = "^https://m\\.place\\.naver\\.com/[^/]+/[0-9]+";

    }

    public static class ResCode {
        public static final Integer ENTITY_ALREADY_EXIST_EXCEPTION = 1;
        public static final Integer OK = 0;
        public static final Integer BAD_REQUEST_EXCEPTION = -1;
        public static final Integer MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION = -2;
        public static final Integer BIND_EXCEPTION = -3;
        public static final Integer CONSTRAINT_VIOLATION_EXCEPTION = -3;
        public static final Integer HTTP_MESSAGE_NOT_READABLE_EXCEPTION = -4;
        public static final Integer HTTP_REQUEST_METHOD_NOT_SUPPORT_EXCEPTION = -5;
        public static final Integer METHOD_ARGUMENT_TYPE_MISMATCH_EXCEPTION = -6;
        public static final Integer CONVERSION_FAILED_EXCEPTION = -7;
        public static final Integer NOMADPROXY_EXCEPTION = -8;
        public static final Integer AUTHENTICATION_EXCEPTION = -9;
        public static final Integer RESOURCE_NOT_FOUND_EXCEPTION = -10;
        public static final Integer CONFLICT_EXCEPTION = -11;
        public static final Integer EXTERNAL_SERVICE_EXCEPTION = -12;
        public static final Integer EXCEPTION = -99;
    }

}
