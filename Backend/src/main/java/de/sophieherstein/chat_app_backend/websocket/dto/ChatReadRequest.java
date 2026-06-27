package de.sophieherstein.chat_app_backend.websocket.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ChatReadRequest(
        @NotNull UUID chatId
) {
}
