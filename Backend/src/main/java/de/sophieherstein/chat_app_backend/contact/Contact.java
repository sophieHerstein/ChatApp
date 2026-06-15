package de.sophieherstein.chat_app_backend.contact;

import de.sophieherstein.chat_app_backend.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(
        name = "contact",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_contact_owner_contact",
                        columnNames = {"owner_user_id", "contact_user_id"}
                )
        }
)
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Contact {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User ownerUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contact_user_id", nullable = false)
    private User contactUser;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}