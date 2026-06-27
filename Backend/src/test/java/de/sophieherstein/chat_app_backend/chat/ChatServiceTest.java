package de.sophieherstein.chat_app_backend.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import de.sophieherstein.chat_app_backend.chat.dto.MessageResponse;
import de.sophieherstein.chat_app_backend.chat.dto.SendMessageRequest;
import de.sophieherstein.chat_app_backend.contact.ContactRepository;
import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
import de.sophieherstein.chat_app_backend.websocket.OnlineUserService;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ChatParticipantRepository chatParticipantRepository;

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OnlineUserService onlineUserService;

    @InjectMocks
    private ChatService chatService;

    @Test
    void returnsExistingMessageWhenClientRetriesSameMessageId() {
        UUID userId = UUID.randomUUID();
        UUID chatId = UUID.randomUUID();
        UUID clientMessageId = UUID.randomUUID();
        User sender = user(userId, "sophie");
        ChatMessage existingMessage = ChatMessage.builder()
                .id(UUID.randomUUID())
                .sender(sender)
                .content("Hallo")
                .createdAt(LocalDateTime.now())
                .clientMessageId(clientMessageId)
                .read(false)
                .build();
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                "sophie",
                null,
                java.util.List.of()
        );

        when(userRepository.findByUsernameIgnoreCase("sophie"))
                .thenReturn(Optional.of(sender));
        when(chatParticipantRepository.existsByChatIdAndUserId(chatId, userId))
                .thenReturn(true);
        when(chatMessageRepository.findByClientMessageIdAndSenderId(
                clientMessageId,
                userId
        )).thenReturn(Optional.of(existingMessage));

        MessageResponse response = chatService.sendMessage(
                authentication,
                chatId,
                new SendMessageRequest("Hallo"),
                clientMessageId
        );

        assertThat(response.id()).isEqualTo(existingMessage.getId());
        verify(chatMessageRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(chatRepository, never()).findById(chatId);
    }

    private User user(UUID id, String username) {
        LocalDateTime now = LocalDateTime.now();
        return User.builder()
                .id(id)
                .username(username)
                .passwordHash("hash")
                .createdAt(now)
                .lastSeenAt(now)
                .presenceVisible(true)
                .build();
    }
}
