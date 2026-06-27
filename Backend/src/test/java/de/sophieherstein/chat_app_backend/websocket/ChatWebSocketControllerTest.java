package de.sophieherstein.chat_app_backend.websocket;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import de.sophieherstein.chat_app_backend.chat.ChatParticipantRepository;
import de.sophieherstein.chat_app_backend.chat.ChatService;
import de.sophieherstein.chat_app_backend.chat.dto.MessageResponse;
import de.sophieherstein.chat_app_backend.chat.dto.SendMessageRequest;
import de.sophieherstein.chat_app_backend.websocket.WebSocketAuthInterceptor.StompPrincipal;
import de.sophieherstein.chat_app_backend.websocket.dto.ChatMessageEvent;
import de.sophieherstein.chat_app_backend.websocket.dto.ChatMessageRequest;
import de.sophieherstein.chat_app_backend.websocket.dto.ChatReadEvent;
import de.sophieherstein.chat_app_backend.websocket.dto.ChatReadRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class ChatWebSocketControllerTest {

    @Mock
    private ChatService chatService;

    @Mock
    private ChatParticipantRepository chatParticipantRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private ChatWebSocketController controller;

    @BeforeEach
    void setUp() {
        controller = new ChatWebSocketController(
                chatService,
                chatParticipantRepository,
                messagingTemplate
        );
    }

    @Test
    void sendsPersistedMessageToEveryParticipant() {
        UUID chatId = UUID.randomUUID();
        UUID senderId = UUID.randomUUID();
        UUID clientMessageId = UUID.randomUUID();
        MessageResponse message = new MessageResponse(
                UUID.randomUUID(),
                senderId,
                "Hallo",
                LocalDateTime.now(),
                false
        );
        StompPrincipal principal = new StompPrincipal(senderId, "sophie");

        when(chatService.sendMessage(
                any(Authentication.class),
                eq(chatId),
                eq(new SendMessageRequest("Hallo")),
                eq(clientMessageId)
        )).thenReturn(message);
        when(chatParticipantRepository.findUsernamesByChatId(chatId))
                .thenReturn(List.of("sophie", "alex"));

        controller.sendMessage(
                new ChatMessageRequest(chatId, clientMessageId, "Hallo"),
                principal
        );

        ChatMessageEvent event = new ChatMessageEvent(
                chatId,
                clientMessageId,
                message
        );
        verify(messagingTemplate).convertAndSendToUser(
                "sophie",
                "/queue/chat/messages",
                event
        );
        verify(messagingTemplate).convertAndSendToUser(
                "alex",
                "/queue/chat/messages",
                event
        );
    }

    @Test
    void broadcastsReadMessageIdsToEveryParticipant() {
        UUID chatId = UUID.randomUUID();
        UUID readerId = UUID.randomUUID();
        List<UUID> messageIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        StompPrincipal principal = new StompPrincipal(readerId, "alex");

        when(chatService.markChatAsRead(any(Authentication.class), eq(chatId)))
                .thenReturn(messageIds);
        when(chatParticipantRepository.findUsernamesByChatId(chatId))
                .thenReturn(List.of("sophie", "alex"));

        controller.markChatAsRead(new ChatReadRequest(chatId), principal);

        ChatReadEvent event = new ChatReadEvent(chatId, readerId, messageIds);
        verify(messagingTemplate).convertAndSendToUser(
                "sophie",
                "/queue/chat/read",
                event
        );
        verify(messagingTemplate).convertAndSendToUser(
                "alex",
                "/queue/chat/read",
                event
        );
    }

    @Test
    void doesNotBroadcastWhenNoMessagesChangedToRead() {
        UUID chatId = UUID.randomUUID();
        StompPrincipal principal = new StompPrincipal(UUID.randomUUID(), "alex");

        when(chatService.markChatAsRead(any(Authentication.class), eq(chatId)))
                .thenReturn(List.of());

        controller.markChatAsRead(new ChatReadRequest(chatId), principal);

        verify(messagingTemplate, never()).convertAndSendToUser(
                any(),
                any(),
                any()
        );
    }
}
