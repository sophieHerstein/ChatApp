package de.sophieherstein.chat_app_backend.user;

import de.sophieherstein.chat_app_backend.exceptions.InvalidCredentialsException;
import de.sophieherstein.chat_app_backend.exceptions.UsernameAlreadyTakenException;
import de.sophieherstein.chat_app_backend.file.ProfileImageStorageService;
import de.sophieherstein.chat_app_backend.user.dto.UpdatePasswordRequest;
import de.sophieherstein.chat_app_backend.user.dto.UpdateUsernameRequest;
import de.sophieherstein.chat_app_backend.user.dto.UserResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileImageStorageService profileImageStorageService;

    @Transactional(readOnly = true)
    public UserResponse getMe(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUsername(Authentication authentication, UpdateUsernameRequest request) {
        User user = getCurrentUser(authentication);
        String username = request.username().trim();

        if (!user.getUsername().equalsIgnoreCase(username)
                && userRepository.existsByUsernameIgnoreCase(username)) {
            throw new UsernameAlreadyTakenException(username);
        }

        user.changeUsername(username);

        return toUserResponse(user);
    }

    @Transactional
    public void updatePassword(Authentication authentication, UpdatePasswordRequest request) {
        User user = getCurrentUser(authentication);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        user.changePasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional
    public UserResponse updateProfileImage(Authentication authentication, MultipartFile profileImage) {
        User user = getCurrentUser(authentication);

        String profileImageUrl = profileImageStorageService.store(profileImage);
        user.changeProfileImageUrl(profileImageUrl);

        return toUserResponse(user);
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow();
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getProfileImageUrl(),
                user.getCreatedAt()
        );
    }
}