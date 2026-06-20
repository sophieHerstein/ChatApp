package de.sophieherstein.chat_app_backend.websocket;

import de.sophieherstein.chat_app_backend.authentication.jwt.JwtService;
import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
import java.security.Principal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                SimpMessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new AccessDeniedException("WebSocket authentication required");
            }

            String token = authHeader.substring("Bearer ".length());

            if (!jwtService.isTokenValid(token)) {
                throw new AccessDeniedException("Invalid WebSocket access token");
            }

            String username = jwtService.extractUsername(token);

            User user = userRepository.findByUsernameIgnoreCase(username)
                    .orElseThrow();

            accessor.setUser(new StompPrincipal(user.getId(), user.getUsername()));
        }

        return message;
    }

    public record StompPrincipal(UUID userId, String name) implements Principal {

        @Override
        public String getName() {
            return name;
        }
    }
}
