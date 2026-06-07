package de.sophieherstein.chat_app_backend.exceptions;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class InvalidProfileImageException extends RuntimeException {

    public InvalidProfileImageException(String message) {
        super(message);
        log.error("Invalid profile image: {}", message);
    }
}