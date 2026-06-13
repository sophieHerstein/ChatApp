package de.sophieherstein.chat_app_backend.user;

import de.sophieherstein.chat_app_backend.user.dto.UpdatePasswordRequest;
import de.sophieherstein.chat_app_backend.user.dto.UpdateUsernameRequest;
import de.sophieherstein.chat_app_backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping(
            value = "/me",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public UserResponse me(Authentication authentication) {
        return userService.getMe(authentication);
    }

    @PatchMapping(
            value = "/me/username",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public UserResponse updateUsername(
            Authentication authentication,
            @Valid @RequestBody UpdateUsernameRequest request
    ) {
        return userService.updateUsername(authentication, request);
    }

    @PatchMapping(
            value = "/me/password",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updatePassword(
            Authentication authentication,
            @Valid @RequestBody UpdatePasswordRequest request
    ) {
        userService.updatePassword(authentication, request);
    }

    @PatchMapping(
            value = "/me/profile-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public UserResponse updateProfileImage(
            Authentication authentication,
            @RequestPart MultipartFile profileImage
    ) {
        return userService.updateProfileImage(authentication, profileImage);
    }
}