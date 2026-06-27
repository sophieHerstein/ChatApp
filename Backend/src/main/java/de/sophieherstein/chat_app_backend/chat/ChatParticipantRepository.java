package de.sophieherstein.chat_app_backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ChatParticipantRepository
        extends JpaRepository<ChatParticipant, UUID> {

    List<ChatParticipant> findAllByUserId(UUID userId);

    List<ChatParticipant> findAllByChatId(UUID chatId);

    @Query("""
            select participant.user.username
            from ChatParticipant participant
            where participant.chat.id = :chatId
            """)
    List<String> findUsernamesByChatId(@Param("chatId") UUID chatId);

    boolean existsByChatIdAndUserId(UUID chatId, UUID userId);
}
