package de.sophieherstein.chat_app_backend.websocket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OnlineUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Test
    void keepsUserOnlineUntilLastConnectionCloses() {
        OnlineUserService service = new OnlineUserService(userRepository);
        UUID userId = UUID.randomUUID();
        User user = user(userId);

        assertThat(service.connected(userId)).isTrue();
        assertThat(service.connected(userId)).isFalse();
        assertThat(service.isOnline(userId)).isTrue();

        assertThat(service.disconnected(userId)).isNull();
        assertThat(service.isOnline(userId)).isTrue();
        verifyNoInteractions(userRepository);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        LocalDateTime lastSeenAt = service.disconnected(userId);

        assertThat(lastSeenAt).isNotNull();
        assertThat(user.getLastSeenAt()).isEqualTo(lastSeenAt);
        assertThat(service.isOnline(userId)).isFalse();
        verify(userRepository).findById(userId);
    }

    private User user(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        return User.builder()
                .id(userId)
                .username("sophie")
                .passwordHash("hash")
                .createdAt(now)
                .lastSeenAt(now)
                .presenceVisible(true)
                .build();
    }
}
