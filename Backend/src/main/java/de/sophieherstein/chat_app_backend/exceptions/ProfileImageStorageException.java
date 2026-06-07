package de.sophieherstein.chat_app_backend.exceptions;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ProfileImageStorageException extends RuntimeException {

    public ProfileImageStorageException(Throwable cause) {
        super("Could not store profile image", cause);
        log.error("Error storing profile image", cause);
    }
}