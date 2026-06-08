package de.sophieherstein.chat_app_backend.authentication;

import de.sophieherstein.chat_app_backend.authentication.dto.LoginRequest;
import de.sophieherstein.chat_app_backend.authentication.dto.LoginResponse;
import de.sophieherstein.chat_app_backend.authentication.dto.RegisterRequest;
import de.sophieherstein.chat_app_backend.authentication.dto.UsernameAvailabilityResponse;
import de.sophieherstein.chat_app_backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authService;

    @PostMapping(
            value = "/register",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.OK)
    public UserResponse register(
            @Valid @ModelAttribute RegisterRequest request
    ) {
        log.info("Registering user: {}", request.getUsername());
        return authService.register(request);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        log.info("Logging in user: {}", request.username());
        return authService.login(request);
    }

    @GetMapping("/username-available")
    public UsernameAvailabilityResponse isUsernameAvailable(
            @RequestParam String username
    ) {
        return authService.isUsernameAvailable(username);
    }
}
