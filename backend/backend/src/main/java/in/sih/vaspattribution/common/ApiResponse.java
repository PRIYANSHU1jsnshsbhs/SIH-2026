package in.sih.vaspattribution.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private ApiError error;

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<T>(true, data, message, null);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<T>(true, data, "Request completed successfully", null);
    }

    public static <T> ApiResponse<T> error(ApiError error) {
        return new ApiResponse<T>(false, null, null, error);
    }
}
