package de.sophieherstein.chat_app_backend.contact;

import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addContact(Authentication authentication, UUID contactUserId) {

        User currentUser = getCurrentUser(authentication);

        if (currentUser.getId().equals(contactUserId)) {
            throw new IllegalArgumentException("You cannot add yourself");
        }

        User contactUser = userRepository.findById(contactUserId)
                .orElseThrow();

        boolean alreadyExists =
                contactRepository.existsByOwnerUserIdAndContactUserId(
                        currentUser.getId(),
                        contactUserId
                );

        if (alreadyExists) {
            return;
        }

        Contact contact = Contact.builder()
                .id(UUID.randomUUID())
                .ownerUser(currentUser)
                .contactUser(contactUser)
                .createdAt(LocalDateTime.now())
                .build();

        contactRepository.save(contact);
    }

    @Transactional
    public void removeContact(Authentication authentication, UUID contactUserId) {

        User currentUser = getCurrentUser(authentication);

        contactRepository
                .findByOwnerUserIdAndContactUserId(
                        currentUser.getId(),
                        contactUserId
                )
                .ifPresent(contactRepository::delete);
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow();
    }
}