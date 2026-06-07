package de.sophieherstein.chat_app_backend.authentication.dto;

import de.sophieherstein.chat_app_backend.user.dto.UserResponse;

public record LoginResponse(
        String accessToken,
        String tokenType,
        UserResponse user
) {
}