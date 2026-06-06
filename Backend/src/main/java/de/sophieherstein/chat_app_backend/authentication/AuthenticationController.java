package de.sophieherstein.chat_app_backend.authentication;

import de.sophieherstein.chat_app_backend.authentication.dto.RegisterRequest;
import de.sophieherstein.chat_app_backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthService authService;

    @PostMapping(
            value = "/register",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(
            @Valid @ModelAttribute RegisterRequest request
    ) {
        return authService.register(request);
    }
}
