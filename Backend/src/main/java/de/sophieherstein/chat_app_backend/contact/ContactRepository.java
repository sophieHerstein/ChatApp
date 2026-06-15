package de.sophieherstein.chat_app_backend.contact;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, UUID> {

    List<Contact> findAllByOwnerUserId(UUID ownerUserId);

    boolean existsByOwnerUserIdAndContactUserId(UUID ownerUserId, UUID contactUserId);

    Optional<Contact> findByOwnerUserIdAndContactUserId(UUID ownerUserId, UUID contactUserId);
}