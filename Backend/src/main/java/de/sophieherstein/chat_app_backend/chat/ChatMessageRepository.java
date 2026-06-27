package de.sophieherstein.chat_app_backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findAllByChatIdOrderByCreatedAtAsc(UUID chatId);

    Optional<ChatMessage> findFirstByChatIdOrderByCreatedAtDesc(UUID chatId);

    Optional<ChatMessage> findByClientMessageIdAndSenderId(UUID clientMessageId, UUID senderId);

    long countByChatIdAndReadFalseAndSenderIdNot(UUID chatId, UUID senderId);

    List<ChatMessage> findAllByChatIdAndReadFalseAndSenderIdNot(UUID chatId, UUID senderId);
}
