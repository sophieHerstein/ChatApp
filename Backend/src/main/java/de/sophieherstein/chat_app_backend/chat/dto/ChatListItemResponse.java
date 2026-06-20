package de.sophieherstein.chat_app_backend.chat.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatListItemResponse(
        UUID chatId,
        UUID otherUserId,
        String username,
        String profileImageUrl,
        String lastMessage,
        LocalDateTime lastMessageTime,
        long unreadCount,
        boolean contact,
        boolean online,
        LocalDateTime lastSeenAt
) {
}
