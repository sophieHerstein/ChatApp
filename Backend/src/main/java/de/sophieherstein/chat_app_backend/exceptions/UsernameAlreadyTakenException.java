package de.sophieherstein.chat_app_backend.exceptions;

public class UsernameAlreadyTakenException extends RuntimeException {

  public UsernameAlreadyTakenException(String username) {
    super("Username '%s' is already taken".formatted(username));
  }
}