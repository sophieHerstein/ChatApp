package de.sophieherstein.chat_app_backend.websocket;

import de.sophieherstein.chat_app_backend.websocket.WebSocketAuthInterceptor.StompPrincipal;
import de.sophieherstein.chat_app_backend.websocket.dto.OnlineStatusResponse;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class PresenceEventListener {

    private final OnlineUserService onlineUserService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleConnected(SessionConnectedEvent event) {
        if (!(event.getUser() instanceof StompPrincipal principal)) {
            return;
        }

        if (!onlineUserService.connected(principal.userId())) {
            return;
        }

        messagingTemplate.convertAndSend(
                "/topic/presence",
                new OnlineStatusResponse(principal.userId(), true, null)
        );
    }

    @EventListener
    public void handleDisconnected(SessionDisconnectEvent event) {
        if (!(event.getUser() instanceof StompPrincipal principal)) {
            return;
        }

        LocalDateTime lastSeenAt = onlineUserService.disconnected(principal.userId());

        if (lastSeenAt == null) {
            return;
        }

        messagingTemplate.convertAndSend(
                "/topic/presence",
                new OnlineStatusResponse(principal.userId(), false, lastSeenAt)
        );
    }
}
