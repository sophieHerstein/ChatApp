package de.sophieherstein.chat_app_backend.exceptions;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class UsernameAlreadyTakenException extends RuntimeException {

  public UsernameAlreadyTakenException(String username) {
    super("Username '%s' is already taken".formatted(username));
    log.error("Username '{}' is already taken", username);
  }
}