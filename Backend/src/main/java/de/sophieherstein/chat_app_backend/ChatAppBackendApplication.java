package de.sophieherstein.chat_app_backend;

import de.sophieherstein.chat_app_backend.authentication.jwt.JwtProperties;
import de.sophieherstein.chat_app_backend.config.AppCorsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties({JwtProperties.class, AppCorsProperties.class})
@SpringBootApplication
public class ChatAppBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChatAppBackendApplication.class, args);
	}

}
