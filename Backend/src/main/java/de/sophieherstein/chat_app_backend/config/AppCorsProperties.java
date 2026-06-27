package de.sophieherstein.chat_app_backend.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
public record AppCorsProperties(
        List<String> allowedOrigins
) {
}
