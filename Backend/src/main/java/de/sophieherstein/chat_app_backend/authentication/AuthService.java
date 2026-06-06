package de.sophieherstein.chat_app_backend.authentication;

import de.sophieherstein.chat_app_backend.authentication.dto.RegisterRequest;
import de.sophieherstein.chat_app_backend.exceptions.UsernameAlreadyTakenException;
import de.sophieherstein.chat_app_backend.file.ProfileImageStorageService;
import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
import de.sophieherstein.chat_app_backend.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileImageStorageService profileImageStorageService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new UsernameAlreadyTakenException(username);
        }

        String profileImageUrl = null;

        if (request.getProfileImage() != null && !request.getProfileImage().isEmpty()) {
            profileImageUrl = profileImageStorageService.store(request.getProfileImage());
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .profileImageUrl(profileImageUrl)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        return toUserResponse(savedUser);
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
