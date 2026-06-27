package de.sophieherstein.chat_app_backend.websocket.dto;

import de.sophieherstein.chat_app_backend.chat.dto.MessageResponse;
import java.util.UUID;

public record ChatMessageEvent(
        UUID chatId,
        UUID clientMessageId,
        MessageResponse message
) {
}
