package de.sophieherstein.chat_app_backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatParticipantRepository
        extends JpaRepository<ChatParticipant, UUID> {

    List<ChatParticipant> findAllByUserId(UUID userId);

    List<ChatParticipant> findAllByChatId(UUID chatId);

    boolean existsByChatIdAndUserId(UUID chatId, UUID userId);
}