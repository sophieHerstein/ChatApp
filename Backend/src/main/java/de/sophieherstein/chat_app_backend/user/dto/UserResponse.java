package de.sophieherstein.chat_app_backend.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String profileImageUrl,
        LocalDateTime createdAt
) {}