package de.sophieherstein.chat_app_backend.chat;

import de.sophieherstein.chat_app_backend.chat.dto.DirectChatResponse;
import de.sophieherstein.chat_app_backend.chat.dto.MessageResponse;
import de.sophieherstein.chat_app_backend.chat.dto.SendMessageRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping(
            value = "/direct/{userId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public DirectChatResponse createDirectChat(
            Authentication authentication,
            @PathVariable UUID userId
    ) {
        return chatService.createOrGetDirectChat(
                authentication,
                userId
        );
    }

    @GetMapping(
            value = "/{chatId}/messages",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public List<MessageResponse> getMessages(
            Authentication authentication,
            @PathVariable UUID chatId
    ) {
        return chatService.getMessages(
                authentication,
                chatId
        );
    }

    @PostMapping(
            value = "/{chatId}/messages",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public MessageResponse sendMessage(
            Authentication authentication,
            @PathVariable UUID chatId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        return chatService.sendMessage(
                authentication,
                chatId,
                request
        );
    }
}
