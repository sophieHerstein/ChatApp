package de.sophieherstein.chat_app_backend.websocket;

import de.sophieherstein.chat_app_backend.chat.ChatParticipantRepository;
import de.sophieherstein.chat_app_backend.chat.ChatService;
import de.sophieherstein.chat_app_backend.chat.dto.MessageResponse;
import de.sophieherstein.chat_app_backend.chat.dto.SendMessageRequest;
import de.sophieherstein.chat_app_backend.websocket.WebSocketAuthInterceptor.StompPrincipal;
import de.sophieherstein.chat_app_backend.websocket.dto.ChatMessageEvent;
import de.sophieherstein.chat_app_backend.websocket.dto.ChatMessageRequest;
import de.sophieherstein.chat_app_backend.websocket.dto.ChatReadEvent;
import de.sophieherstein.chat_app_backend.websocket.dto.ChatReadRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final ChatParticipantRepository chatParticipantRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/send")
    public void sendMessage(
            @Valid ChatMessageRequest request,
            StompPrincipal principal
    ) {
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal.getName(),
                null,
                List.of()
        );
        MessageResponse message = chatService.sendMessage(
                authentication,
                request.chatId(),
                new SendMessageRequest(request.content()),
                request.clientMessageId()
        );
        ChatMessageEvent event = new ChatMessageEvent(
                request.chatId(),
                request.clientMessageId(),
                message
        );

        participantUsernames(request.chatId()).forEach(username ->
                messagingTemplate.convertAndSendToUser(
                        username,
                        "/queue/chat/messages",
                        event
                )
        );
    }

    @MessageMapping("/chat/read")
    public void markChatAsRead(
            @Valid ChatReadRequest request,
            StompPrincipal principal
    ) {
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal.getName(),
                null,
                List.of()
        );
        List<UUID> messageIds = chatService.markChatAsRead(
                authentication,
                request.chatId()
        );

        if (messageIds.isEmpty()) {
            return;
        }

        ChatReadEvent event = new ChatReadEvent(
                request.chatId(),
                principal.userId(),
                messageIds
        );
        participantUsernames(request.chatId()).forEach(username ->
                messagingTemplate.convertAndSendToUser(
                        username,
                        "/queue/chat/read",
                        event
                )
        );
    }

    private List<String> participantUsernames(UUID chatId) {
        return chatParticipantRepository.findUsernamesByChatId(chatId);
    }
}
