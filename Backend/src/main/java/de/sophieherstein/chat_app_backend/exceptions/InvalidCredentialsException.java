package de.sophieherstein.chat_app_backend.exceptions;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class InvalidCredentialsException extends RuntimeException {

  public InvalidCredentialsException() {
    super("Invalid username or password");
    log.error("Invalid credentials");
  }
}