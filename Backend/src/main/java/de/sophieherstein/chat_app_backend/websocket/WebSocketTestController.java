package de.sophieherstein.chat_app_backend.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketTestController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/ping")
    public void ping(String message) {

        messagingTemplate.convertAndSend(
                "/topic/test",
                "PONG: " + message
        );
    }
}