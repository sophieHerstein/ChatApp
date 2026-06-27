package de.sophieherstein.chat_app_backend.websocket.dto;

import java.util.List;
import java.util.UUID;

public record ChatReadEvent(
        UUID chatId,
        UUID readByUserId,
        List<UUID> messageIds
) {
}
