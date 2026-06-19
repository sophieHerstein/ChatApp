package de.sophieherstein.chat_app_backend.chat;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Chat {

    @Id
    private UUID id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}