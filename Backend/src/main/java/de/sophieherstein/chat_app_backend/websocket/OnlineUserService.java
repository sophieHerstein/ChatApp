package de.sophieherstein.chat_app_backend.websocket;

import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OnlineUserService {

    private final UserRepository userRepository;
    private final Map<UUID, Integer> connectionCounts = new ConcurrentHashMap<>();

    public boolean connected(UUID userId) {
        return connectionCounts.merge(userId, 1, Integer::sum) == 1;
    }

    @Transactional
    public LocalDateTime disconnected(UUID userId) {
        boolean[] lastConnectionClosed = {false};

        connectionCounts.computeIfPresent(userId, (id, count) -> {
            if (count <= 1) {
                lastConnectionClosed[0] = true;
                return null;
            }

            return count - 1;
        });

        if (!lastConnectionClosed[0]) {
            return null;
        }

        LocalDateTime lastSeenAt = LocalDateTime.now();
        User user = userRepository.findById(userId).orElseThrow();
        user.updateLastSeenAt(lastSeenAt);
        return lastSeenAt;
    }

    public boolean isOnline(UUID userId) {
        return connectionCounts.containsKey(userId);
    }
}
