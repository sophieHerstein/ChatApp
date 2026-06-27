package de.sophieherstein.chat_app_backend.user;

import de.sophieherstein.chat_app_backend.contact.ContactRepository;
import de.sophieherstein.chat_app_backend.exceptions.InvalidCredentialsException;
import de.sophieherstein.chat_app_backend.exceptions.UsernameAlreadyTakenException;
import de.sophieherstein.chat_app_backend.file.ProfileImageStorageService;
import de.sophieherstein.chat_app_backend.user.dto.UpdatePasswordRequest;
import de.sophieherstein.chat_app_backend.user.dto.UpdatePresenceVisibilityRequest;
import de.sophieherstein.chat_app_backend.user.dto.UpdateUsernameRequest;
import de.sophieherstein.chat_app_backend.user.dto.UserResponse;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import de.sophieherstein.chat_app_backend.user.dto.UserSearchResponse;
import de.sophieherstein.chat_app_backend.websocket.OnlineUserService;
import de.sophieherstein.chat_app_backend.websocket.dto.OnlineStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final ContactRepository contactRepository;
    private final OnlineUserService onlineUserService;
    private final SimpMessagingTemplate messagingTemplate;

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

    @Transactional
    public UserResponse updatePresenceVisibility(
            Authentication authentication,
            UpdatePresenceVisibilityRequest request
    ) {
        User user = getCurrentUser(authentication);
        user.changePresenceVisible(request.visible());

        messagingTemplate.convertAndSend(
                "/topic/presence",
                new OnlineStatusResponse(
                        user.getId(),
                        request.visible() && onlineUserService.isOnline(user.getId()),
                        request.visible() ? user.getLastSeenAt() : null,
                        request.visible()
                )
        );

        return toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponse> getAllUsers(Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        Set<UUID> contactIds = contactRepository
                .findAllByOwnerUserId(currentUser.getId())
                .stream()
                .map(contact -> contact.getContactUser().getId())
                .collect(Collectors.toSet());

        return userRepository.findAll()
                .stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(user -> new UserSearchResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getProfileImageUrl(),
                        contactIds.contains(user.getId())
                ))
                .sorted(
                        Comparator
                                .comparing(UserSearchResponse::contact)
                                .reversed()
                                .thenComparing(
                                        UserSearchResponse::username,
                                        String.CASE_INSENSITIVE_ORDER
                                )
                )
                .toList();
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
                user.getCreatedAt(),
                user.isPresenceVisible()
        );
    }
}
