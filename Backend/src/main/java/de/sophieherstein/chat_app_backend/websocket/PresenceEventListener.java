package de.sophieherstein.chat_app_backend.websocket;

import de.sophieherstein.chat_app_backend.websocket.WebSocketAuthInterceptor.StompPrincipal;
import de.sophieherstein.chat_app_backend.websocket.dto.OnlineStatusResponse;
import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
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
    private final UserRepository userRepository;

    @EventListener
    public void handleConnected(SessionConnectedEvent event) {
        if (!(event.getUser() instanceof StompPrincipal principal)) {
            return;
        }

        if (!onlineUserService.connected(principal.userId())) {
            return;
        }

        User user = userRepository.findById(principal.userId()).orElseThrow();
        if (!user.isPresenceVisible()) {
            return;
        }

        messagingTemplate.convertAndSend(
                "/topic/presence",
                new OnlineStatusResponse(principal.userId(), true, null, true)
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

        User user = userRepository.findById(principal.userId()).orElseThrow();
        if (!user.isPresenceVisible()) {
            return;
        }

        messagingTemplate.convertAndSend(
                "/topic/presence",
                new OnlineStatusResponse(principal.userId(), false, lastSeenAt, true)
        );
    }
}
