package kr.co.nomadlab.dplog.common;

public record ApiResponse<T>(boolean success, T data, ApiErrorBody error) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(true, null, null);
    }

    public static ApiResponse<Void> fail(String code, String message) {
        return new ApiResponse<>(false, null, new ApiErrorBody(code, message));
    }

    public record ApiErrorBody(String code, String message) {
    }
}
