package kr.co.nomadlab.nomadrank.common.exception.handler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

import org.springframework.core.convert.ConversionFailedException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import kr.co.nomadlab.nomadrank.common.constants.Constants;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.common.exception.ConflictException;
import kr.co.nomadlab.nomadrank.common.exception.EntityAlreadyExistException;
import kr.co.nomadlab.nomadrank.common.exception.ExternalServiceException;
import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.common.exception.ResourceNotFoundException;

@RestControllerAdvice
public class CommonExceptionHandler {

        @ExceptionHandler(EntityAlreadyExistException.class)
        public HttpEntity<?> handleEntityAlreadyExistException(Exception e) {
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.ENTITY_ALREADY_EXIST_EXCEPTION)
                                                .message(e.getMessage())
                                                .build(),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(BadRequestException.class)
        public HttpEntity<?> handleBadRequestException(Exception e) {
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                                                .message(e.getMessage())
                                                .build(),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public HttpEntity<?> handleResourceNotFoundException(ResourceNotFoundException e) {
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.RESOURCE_NOT_FOUND_EXCEPTION)
                                                .message(e.getMessage())
                                                .build(),
                                HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(ConflictException.class)
        public HttpEntity<?> handleConflictException(ConflictException e) {
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.CONFLICT_EXCEPTION)
                                                .message(e.getMessage())
                                                .build(),
                                HttpStatus.CONFLICT);
        }

        @ExceptionHandler(ExternalServiceException.class)
        public HttpEntity<?> handleExternalServiceException(ExternalServiceException e) {
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.EXTERNAL_SERVICE_EXCEPTION)
                                                .message(e.getMessage())
                                                .build(),
                                HttpStatus.BAD_GATEWAY);
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public HttpEntity<?> handleMissingServletRequestParameterException(Exception e) {
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.MISSING_SERVLET_REQUEST_PARAMETER_EXCEPTION)
                                                .message(e.getMessage())
                                                .build(),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(BindException.class)
        public HttpEntity<?> handleBindException(BindException e) {
                Map<String, String> errorMap = new HashMap<>();

                e.getBindingResult().getFieldErrors().forEach(fieldError -> {
                        errorMap.put(fieldError.getField(), fieldError.getDefaultMessage());
                });

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.BIND_EXCEPTION)
                                                .message("요청한 데이터가 유효하지 않습니다.")
                                                .data(errorMap)
                                                .build(),
                                HttpStatus.BAD_REQUEST);

        }

        @ExceptionHandler(ConstraintViolationException.class)
        public HttpEntity<?> handleBindException(ConstraintViolationException exception) {
                Map<String, String> errorMap = new HashMap<>();
                exception.getConstraintViolations().forEach(constraintViolation -> {
                        List<Path.Node> pathNodeList = StreamSupport
                                        .stream(constraintViolation.getPropertyPath().spliterator(), false)
                                        .toList();
                        errorMap.put(pathNodeList.get(pathNodeList.size() - 1).getName(),
                                        constraintViolation.getMessage());
                });
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.CONSTRAINT_VIOLATION_EXCEPTION)
                                                .message("요청한 데이터가 유효하지 않습니다.")
                                                .data(errorMap)
                                                .build(),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public HttpEntity<?> handleHttpMessageNotReadableException(Exception e) {

                if (e.getMessage().contains("Required request body is missing")) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.HTTP_MESSAGE_NOT_READABLE_EXCEPTION)
                                                        .message("RequestBody가 없습니다.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }

                if (e.getMessage().contains("Enum class: ")) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.HTTP_MESSAGE_NOT_READABLE_EXCEPTION)
                                                        .message("Type 매개변수를 확인하세요.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.HTTP_MESSAGE_NOT_READABLE_EXCEPTION)
                                                .message("RequestBody를 형식에 맞추어 주세요.")
                                                .build(),
                                HttpStatus.BAD_REQUEST);

        }

        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        public HttpEntity<?> handleHttpRequestMethodNotSupportedException(Exception e) {
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.HTTP_REQUEST_METHOD_NOT_SUPPORT_EXCEPTION)
                                                .message("엔드포인트가 요청하신 메소드에 대해 지원하지 않습니다. 메소드, 엔드포인트, PathVariable을 확인하세요.")
                                                .build(),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public HttpEntity<?> handleMethodArgumentTypeMismatchException(Exception e) {
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.METHOD_ARGUMENT_TYPE_MISMATCH_EXCEPTION)
                                                .message("PathVariable, QueryString의 타입을 확인하세요.")
                                                .build(),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ConversionFailedException.class)
        public HttpEntity<?> handleConversionFailedException(Exception e) {
                if (e.getMessage().contains("persistence.Enumerated")) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.CONVERSION_FAILED_EXCEPTION)
                                                        .message("status를 정확히 입력해주세요.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.CONVERSION_FAILED_EXCEPTION)
                                                .message("PathVariable, QueryString, ResponseBody를 확인하세요.")
                                                .build(),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(NomadscrapException.class)
        public HttpEntity<?> handleNomadproxyException(Exception e) {
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.NOMADPROXY_EXCEPTION)
                                                .message(e.getMessage())
                                                .build(),
                                HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(AuthenticationException.class)
        public HttpEntity<?> handleAuthenticationException(Exception e) {
                String message = e.getMessage();
                if (message == null) {
                        message = "로그인이 필요한 서비스입니다.";
                }

                System.out.println("AuthenticationException 메시지: " + Constants.ResCode.AUTHENTICATION_EXCEPTION);
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.AUTHENTICATION_EXCEPTION)
                                                .message(message)
                                                .build(),
                                HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(NoResourceFoundException.class)
        public Object handleNoResourceFoundException(NoResourceFoundException e) {
                // 리액트를 사용 중이기 때문에 루트 경로를 제외한 경로로 요청을 하면 에러가 발생한다.
                // 이 경우 확장자(.~~~)가 있지 않은 경우 루트 경로로 포워드 시킨다.
                if (!e.getResourcePath().contains(".")) {
                        return new ModelAndView("forward:/");
                } else {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                                                        .message(e.getMessage())
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }
        }

        @ExceptionHandler(Exception.class)
        public HttpEntity<?> handleException(Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(Constants.ResCode.EXCEPTION)
                                                .message(e.getMessage())
                                                .build(),
                                HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
