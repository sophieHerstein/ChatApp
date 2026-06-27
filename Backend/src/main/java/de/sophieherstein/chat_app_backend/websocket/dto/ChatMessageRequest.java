package de.sophieherstein.chat_app_backend.websocket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record ChatMessageRequest(
        @NotNull UUID chatId,
        @NotNull UUID clientMessageId,
        @NotBlank @Size(max = 5000) String content
) {
}
