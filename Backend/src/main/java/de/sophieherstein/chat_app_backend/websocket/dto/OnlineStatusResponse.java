package de.sophieherstein.chat_app_backend.websocket.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record OnlineStatusResponse(
        UUID userId,
        boolean online,
        LocalDateTime lastSeenAt,
        boolean visible
) {
}
