package in.sih.vaspattribution.common;

import in.sih.vaspattribution.common.exception.BusinessException;
import in.sih.vaspattribution.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        ApiError apiError = new ApiError("NOT_FOUND", ex.getMessage());
        return new ResponseEntity<>(ApiResponse.error(apiError), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        ApiError apiError = new ApiError(ex.getCode(), ex.getMessage());
        return new ResponseEntity<>(ApiResponse.error(apiError), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ApiError apiError = new ApiError("VALIDATION_FAILED", "Validation failed for request parameters: " + errors.toString());
        return new ResponseEntity<>(ApiResponse.error(apiError), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGlobalException(Exception ex) {
        ex.printStackTrace();
        ApiError apiError = new ApiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred");
        // Log the actual exception in real application
        return new ResponseEntity<>(ApiResponse.error(apiError), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
