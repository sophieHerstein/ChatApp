package de.sophieherstein.chat_app_backend.demo;

import de.sophieherstein.chat_app_backend.chat.Chat;
import de.sophieherstein.chat_app_backend.chat.ChatMessage;
import de.sophieherstein.chat_app_backend.chat.ChatMessageRepository;
import de.sophieherstein.chat_app_backend.chat.ChatParticipant;
import de.sophieherstein.chat_app_backend.chat.ChatParticipantRepository;
import de.sophieherstein.chat_app_backend.chat.ChatRepository;
import de.sophieherstein.chat_app_backend.contact.Contact;
import de.sophieherstein.chat_app_backend.contact.ContactRepository;
import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Profile("demo")
@RequiredArgsConstructor
public class DemoDataSeeder implements ApplicationRunner {

    public static final String DEMO_PASSWORD = "Demo123!";

    private static final UUID SOPHIE_ID =
            UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID ALEX_ID =
            UUID.fromString("10000000-0000-0000-0000-000000000002");
    private static final UUID MIA_ID =
            UUID.fromString("10000000-0000-0000-0000-000000000003");
    private static final UUID NOAH_ID =
            UUID.fromString("10000000-0000-0000-0000-000000000004");

    private static final UUID SOPHIE_ALEX_CHAT_ID =
            UUID.fromString("20000000-0000-0000-0000-000000000001");
    private static final UUID SOPHIE_MIA_CHAT_ID =
            UUID.fromString("20000000-0000-0000-0000-000000000002");
    private static final UUID ALEX_NOAH_CHAT_ID =
            UUID.fromString("20000000-0000-0000-0000-000000000003");

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        LocalDateTime now = LocalDateTime.now();
        String passwordHash = passwordEncoder.encode(DEMO_PASSWORD);

        User sophie = user(
                SOPHIE_ID,
                "sophie",
                "https://i.pravatar.cc/200?img=47",
                passwordHash,
                now.minusDays(30),
                now.minusMinutes(4),
                true
        );
        User alex = user(
                ALEX_ID,
                "alex",
                "https://i.pravatar.cc/200?img=12",
                passwordHash,
                now.minusDays(24),
                now.minusMinutes(18),
                true
        );
        User mia = user(
                MIA_ID,
                "mia",
                "https://i.pravatar.cc/200?img=32",
                passwordHash,
                now.minusDays(18),
                now.minusDays(1).withHour(21).withMinute(14),
                true
        );
        User noah = user(
                NOAH_ID,
                "noah",
                "https://i.pravatar.cc/200?img=68",
                passwordHash,
                now.minusDays(12),
                now.minusDays(3).withHour(16).withMinute(40),
                false
        );

        contact("30000000-0000-0000-0000-000000000001", sophie, alex, now.minusDays(20));
        contact("30000000-0000-0000-0000-000000000002", sophie, mia, now.minusDays(14));
        contact("30000000-0000-0000-0000-000000000003", alex, sophie, now.minusDays(20));
        contact("30000000-0000-0000-0000-000000000004", mia, sophie, now.minusDays(14));
        contact("30000000-0000-0000-0000-000000000005", alex, noah, now.minusDays(8));

        Chat sophieAlex = chat(SOPHIE_ALEX_CHAT_ID, sophie, alex, now.minusDays(10));
        Chat sophieMia = chat(SOPHIE_MIA_CHAT_ID, sophie, mia, now.minusDays(7));
        Chat alexNoah = chat(ALEX_NOAH_CHAT_ID, alex, noah, now.minusDays(5));

        message(
                "50000000-0000-0000-0000-000000000001",
                sophieAlex,
                sophie,
                "Hey Alex, funktioniert der neue Chat bei dir?",
                now.minusDays(1).withHour(18).withMinute(5),
                true
        );
        message(
                "50000000-0000-0000-0000-000000000002",
                sophieAlex,
                alex,
                "Ja, sieht gut aus! Sogar der Online-Status ist da.",
                now.minusDays(1).withHour(18).withMinute(8),
                true
        );
        message(
                "50000000-0000-0000-0000-000000000003",
                sophieAlex,
                alex,
                "Die Demo-Nachricht von heute ist noch ungelesen 👋",
                now.minusMinutes(12),
                false
        );
        message(
                "50000000-0000-0000-0000-000000000004",
                sophieMia,
                mia,
                "Hast du schon die neue Kontakte-Seite gesehen?",
                now.minusDays(2).withHour(11).withMinute(30),
                true
        );
        message(
                "50000000-0000-0000-0000-000000000005",
                sophieMia,
                sophie,
                "Ja! Als Nächstes kommen die Demo-Daten 😄",
                now.minusDays(2).withHour(11).withMinute(34),
                true
        );
        message(
                "50000000-0000-0000-0000-000000000006",
                alexNoah,
                noah,
                "Mein Online-Status ist übrigens verborgen.",
                now.minusDays(3).withHour(16).withMinute(41),
                false
        );

        log.info(
                "Demo data ready. Users: sophie, alex, mia, noah; password: {}",
                DEMO_PASSWORD
        );
    }

    private User user(
            UUID id,
            String username,
            String profileImageUrl,
            String passwordHash,
            LocalDateTime createdAt,
            LocalDateTime lastSeenAt,
            boolean presenceVisible
    ) {
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .id(id)
                                .username(username)
                                .passwordHash(passwordHash)
                                .profileImageUrl(profileImageUrl)
                                .createdAt(createdAt)
                                .lastSeenAt(lastSeenAt)
                                .presenceVisible(presenceVisible)
                                .build()
                ));
    }

    private void contact(
            String id,
            User owner,
            User contactUser,
            LocalDateTime createdAt
    ) {
        if (contactRepository.existsByOwnerUserIdAndContactUserId(
                owner.getId(),
                contactUser.getId()
        )) {
            return;
        }

        contactRepository.save(
                Contact.builder()
                        .id(UUID.fromString(id))
                        .ownerUser(owner)
                        .contactUser(contactUser)
                        .createdAt(createdAt)
                        .build()
        );
    }

    private Chat chat(
            UUID id,
            User firstUser,
            User secondUser,
            LocalDateTime createdAt
    ) {
        Chat chat = chatRepository.findById(id)
                .orElseGet(() -> chatRepository.save(
                        Chat.builder()
                                .id(id)
                                .createdAt(createdAt)
                                .build()
                ));

        participant(
                UUID.nameUUIDFromBytes(
                        (id + ":" + firstUser.getId()).getBytes(StandardCharsets.UTF_8)
                ),
                chat,
                firstUser
        );
        participant(
                UUID.nameUUIDFromBytes(
                        (id + ":" + secondUser.getId()).getBytes(StandardCharsets.UTF_8)
                ),
                chat,
                secondUser
        );
        return chat;
    }

    private void participant(UUID id, Chat chat, User user) {
        if (chatParticipantRepository.existsByChatIdAndUserId(chat.getId(), user.getId())) {
            return;
        }

        chatParticipantRepository.save(
                ChatParticipant.builder()
                        .id(id)
                        .chat(chat)
                        .user(user)
                        .build()
        );
    }

    private void message(
            String id,
            Chat chat,
            User sender,
            String content,
            LocalDateTime createdAt,
            boolean read
    ) {
        UUID messageId = UUID.fromString(id);

        if (chatMessageRepository.existsById(messageId)) {
            return;
        }

        chatMessageRepository.save(
                ChatMessage.builder()
                        .id(messageId)
                        .chat(chat)
                        .sender(sender)
                        .content(content)
                        .createdAt(createdAt)
                        .clientMessageId(UUID.nameUUIDFromBytes(
                                ("demo:" + id).getBytes(StandardCharsets.UTF_8)
                        ))
                        .read(read)
                        .build()
        );
    }
}
