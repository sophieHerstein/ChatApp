import { inject, Injectable } from '@angular/core';
import {
  ChatControllerService,
  DirectChatResponse,
  MessageResponse,
  SendMessageRequest,
  ChatListItemResponse
} from '../generated/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatControllerService = inject(ChatControllerService);

  createDirectChat(userId: string): Observable<DirectChatResponse> {
    return this.chatControllerService.createDirectChat(userId);
  }

  getMessages(chatId: string): Observable<MessageResponse[]> {
    return this.chatControllerService.getMessages(chatId);
  }

  sendMessage(chatId: string, request: SendMessageRequest): Observable<MessageResponse> {
    return this.chatControllerService.sendMessage(chatId, request);
  }

  getChats(): Observable<ChatListItemResponse[]> {
    return this.chatControllerService.getChats();
  }

  markChatAsRead(chatId: string) {
    return this.chatControllerService.markChatAsRead(chatId);
  }
}
