package de.sophieherstein.chat_app_backend.contact;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addContact(
            Authentication authentication,
            @PathVariable UUID userId
    ) {
        contactService.addContact(authentication, userId);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeContact(
            Authentication authentication,
            @PathVariable UUID userId
    ) {
        contactService.removeContact(authentication, userId);
    }
}