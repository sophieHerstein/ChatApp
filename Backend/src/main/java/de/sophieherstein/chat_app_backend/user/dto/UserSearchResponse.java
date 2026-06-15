package de.sophieherstein.chat_app_backend.user.dto;

import java.util.UUID;

public record UserSearchResponse(
        UUID id,
        String username,
        String profileImageUrl,
        boolean contact
) {
}