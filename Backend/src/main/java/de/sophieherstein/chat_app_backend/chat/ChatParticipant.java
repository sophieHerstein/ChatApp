package de.sophieherstein.chat_app_backend.chat;

import de.sophieherstein.chat_app_backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "chat_participant",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_chat_participant_chat_user",
                        columnNames = {"chat_id", "user_id"}
                )
        }
)
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ChatParticipant {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chat_id")
    private Chat chat;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;
}