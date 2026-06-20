package de.sophieherstein.chat_app_backend.chat;

import de.sophieherstein.chat_app_backend.chat.dto.ChatListItemResponse;
import de.sophieherstein.chat_app_backend.chat.dto.DirectChatResponse;
import de.sophieherstein.chat_app_backend.chat.dto.MessageResponse;
import de.sophieherstein.chat_app_backend.chat.dto.SendMessageRequest;
import de.sophieherstein.chat_app_backend.contact.ContactRepository;
import de.sophieherstein.chat_app_backend.user.User;
import de.sophieherstein.chat_app_backend.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Transactional
    public DirectChatResponse createOrGetDirectChat(
            Authentication authentication,
            UUID otherUserId
    ) {

        User currentUser = getCurrentUser(authentication);

        if (currentUser.getId().equals(otherUserId)) {
            throw new IllegalArgumentException(
                    "Cannot create chat with yourself"
            );
        }

        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow();

        List<ChatParticipant> myParticipations =
                chatParticipantRepository.findAllByUserId(
                        currentUser.getId()
                );

        for (ChatParticipant participation : myParticipations) {

            UUID chatId = participation.getChat().getId();

            List<ChatParticipant> participants =
                    chatParticipantRepository.findAllByChatId(chatId);

            if (participants.size() != 2) {
                continue;
            }

            boolean containsCurrentUser =
                    participants.stream()
                            .anyMatch(p ->
                                    p.getUser().getId()
                                            .equals(currentUser.getId()));

            boolean containsOtherUser =
                    participants.stream()
                            .anyMatch(p ->
                                    p.getUser().getId()
                                            .equals(otherUserId));

            if (containsCurrentUser && containsOtherUser) {
                return new DirectChatResponse(chatId);
            }
        }

        Chat chat = chatRepository.save(
                Chat.builder()
                        .id(UUID.randomUUID())
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        chatParticipantRepository.save(
                ChatParticipant.builder()
                        .id(UUID.randomUUID())
                        .chat(chat)
                        .user(currentUser)
                        .build()
        );

        chatParticipantRepository.save(
                ChatParticipant.builder()
                        .id(UUID.randomUUID())
                        .chat(chat)
                        .user(otherUser)
                        .build()
        );

        return new DirectChatResponse(chat.getId());
    }

    @Transactional
    public List<MessageResponse> getMessages(
            Authentication authentication,
            UUID chatId
    ) {

        User currentUser = getCurrentUser(authentication);

        validateUserBelongsToChat(
                currentUser.getId(),
                chatId
        );

        return chatMessageRepository
                .findAllByChatIdOrderByCreatedAtAsc(chatId)
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(
            Authentication authentication,
            UUID chatId,
            SendMessageRequest request
    ) {

        User currentUser = getCurrentUser(authentication);

        validateUserBelongsToChat(
                currentUser.getId(),
                chatId
        );

        Chat chat = chatRepository
                .findById(chatId)
                .orElseThrow();

        ChatMessage message = chatMessageRepository.save(
                ChatMessage.builder()
                        .id(UUID.randomUUID())
                        .chat(chat)
                        .sender(currentUser)
                        .content(request.content().trim())
                        .createdAt(LocalDateTime.now())
                        .read(false)
                        .build()
        );

        return toMessageResponse(message);
    }

    @Transactional
    public List<ChatListItemResponse> getChats(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        Set<UUID> contactIds = contactRepository
                .findAllByOwnerUserId(currentUser.getId())
                .stream()
                .map(contact -> contact.getContactUser().getId())
                .collect(Collectors.toSet());

        return chatParticipantRepository
                .findAllByUserId(currentUser.getId())
                .stream()
                .map(participation -> toChatListItem(participation.getChat(), currentUser, contactIds))
                .sorted(
                        Comparator
                                .comparing((ChatListItemResponse chat) -> chat.unreadCount() > 0)
                                .reversed()
                                .thenComparing(
                                        ChatListItemResponse::lastMessageTime,
                                        Comparator.nullsLast(Comparator.reverseOrder())
                                )
                                .thenComparing(
                                        ChatListItemResponse::username,
                                        String.CASE_INSENSITIVE_ORDER
                                )
                )
                .toList();
    }

    @Transactional
    public void markChatAsRead(
            Authentication authentication,
            UUID chatId
    ) {
        User currentUser = getCurrentUser(authentication);

        validateUserBelongsToChat(
                currentUser.getId(),
                chatId
        );

        List<ChatMessage> unreadMessages =
                chatMessageRepository.findAllByChatIdAndReadFalseAndSenderIdNot(
                        chatId,
                        currentUser.getId()
                );

        unreadMessages.forEach(ChatMessage::markAsRead);
    }

    private ChatListItemResponse toChatListItem(
            Chat chat,
            User currentUser,
            Set<UUID> contactIds
    ) {
        User otherUser = chatParticipantRepository.findAllByChatId(chat.getId())
                .stream()
                .map(ChatParticipant::getUser)
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .findFirst()
                .orElseThrow();

        Optional<ChatMessage> lastMessage =
                chatMessageRepository.findFirstByChatIdOrderByCreatedAtDesc(chat.getId());

        long unreadCount =
                chatMessageRepository.countByChatIdAndReadFalseAndSenderIdNot(
                        chat.getId(),
                        currentUser.getId()
                );

        return new ChatListItemResponse(
                chat.getId(),
                otherUser.getId(),
                otherUser.getUsername(),
                otherUser.getProfileImageUrl(),
                lastMessage.map(ChatMessage::getContent).orElse(null),
                lastMessage.map(ChatMessage::getCreatedAt).orElse(null),
                unreadCount,
                contactIds.contains(otherUser.getId())
        );
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository
                .findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow();
    }

    private void validateUserBelongsToChat(
            UUID userId,
            UUID chatId
    ) {

        boolean isParticipant =
                chatParticipantRepository
                        .existsByChatIdAndUserId(
                                chatId,
                                userId
                        );

        if (!isParticipant) {
            throw new AccessDeniedException(
                    "User is not participant of this chat"
            );
        }
    }

    private MessageResponse toMessageResponse(
            ChatMessage message
    ) {

        return new MessageResponse(
                message.getId(),
                message.getSender().getId(),
                message.getContent(),
                message.getCreatedAt(),
                message.isRead()
        );
    }

}
