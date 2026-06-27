package de.sophieherstein.chat_app_backend.authentication;

import de.sophieherstein.chat_app_backend.authentication.dto.LoginRequest;
import de.sophieherstein.chat_app_backend.authentication.dto.LoginResponse;
import de.sophieherstein.chat_app_backend.authentication.dto.RegisterRequest;
import de.sophieherstein.chat_app_backend.authentication.dto.UsernameAvailabilityResponse;
import de.sophieherstein.chat_app_backend.authentication.jwt.JwtService;
import de.sophieherstein.chat_app_backend.exceptions.InvalidCredentialsException;
import de.sophieherstein.chat_app_backend.exceptions.UsernameAlreadyTakenException;
import de.sophieherstein.chat_app_backend.file.ProfileImageStorageService;
import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
import de.sophieherstein.chat_app_backend.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileImageStorageService profileImageStorageService;
    private final JwtService jwtService;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        log.info("Registering user: {}", request.getUsername());
        String username = request.getUsername().trim();

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new UsernameAlreadyTakenException(username);
        }

        String profileImageUrl = null;

        if (request.getProfileImage() != null && !request.getProfileImage().isEmpty()) {
            profileImageUrl = profileImageStorageService.store(request.getProfileImage());
        }

        LocalDateTime now = LocalDateTime.now();
        User user = User.builder()
                .id(UUID.randomUUID())
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .profileImageUrl(profileImageUrl)
                .createdAt(now)
                .lastSeenAt(now)
                .presenceVisible(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User {} registered successfully", savedUser.getUsername());
        String accessToken = jwtService.generateToken(savedUser);

        return new LoginResponse(
                accessToken,
                "Bearer",
                toUserResponse(savedUser)
        );
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        log.info("Logging in user: {}", request.username());
        String username = request.username().trim();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateToken(user);
        log.info("User {} logged in successfully", user.getUsername());
        return new LoginResponse(
                accessToken,
                "Bearer",
                toUserResponse(user)
        );
    }

    @Transactional(readOnly = true)
    public UsernameAvailabilityResponse isUsernameAvailable(String username) {
        String normalizedUsername = username.trim();

        boolean exists = userRepository.existsByUsernameIgnoreCase(normalizedUsername);

        return new UsernameAvailabilityResponse(!exists);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getProfileImageUrl(),
                user.getCreatedAt(),
                user.isPresenceVisible()
        );
    }
}
