package de.sophieherstein.chat_app_backend.exceptions;

public class ProfileImageStorageException extends RuntimeException {

    public ProfileImageStorageException(Throwable cause) {
        super("Could not store profile image", cause);
    }
}