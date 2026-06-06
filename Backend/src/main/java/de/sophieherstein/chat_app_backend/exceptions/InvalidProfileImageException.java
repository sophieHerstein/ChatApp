package de.sophieherstein.chat_app_backend.exceptions;

public class InvalidProfileImageException extends RuntimeException {

    public InvalidProfileImageException(String message) {
        super(message);
    }
}