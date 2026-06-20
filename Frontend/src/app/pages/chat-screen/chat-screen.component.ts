import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowLeft,
  bootstrapSend,
  bootstrapSendCheck,
  bootstrapSendFill,
} from '@ng-icons/bootstrap-icons';
import { ChatListItemResponse, MessageResponse } from '../../generated/api';
import { EAppPaths } from '../../app.paths';
import { AuthenticationStoreService } from '../../services/authentication-store.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-screen',
  imports: [NgClass, NgOptimizedImage, NgIcon, ReactiveFormsModule, RouterLink],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.scss',
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
      bootstrapSend,
      bootstrapSendFill,
      bootstrapSendCheck,
    }),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ChatScreenComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private chatService = inject(ChatService);
  private authenticationStoreService = inject(AuthenticationStoreService);

  chatId = signal<string | null>(null);
  chat = signal<ChatListItemResponse | null>(null);
  messages = signal<MessageResponse[]>([]);
  errorOccured = signal<boolean>(false);
  isSending = signal<boolean>(false);

  messageFC = new FormControl('', [
    Validators.required,
    Validators.maxLength(5000),
  ]);

  protected readonly EAppPaths = EAppPaths;

  ngOnInit(): void {
    const chatId = this.route.snapshot.paramMap.get('id');

    if (!chatId) {
      this.errorOccured.set(true);
      return;
    }

    this.chatId.set(chatId);
    this.loadChatHeader();
    this.loadMessages();
  }

  loadChatHeader(): void {
    const chatId = this.chatId();

    if (!chatId) return;

    this.chatService.getChats().subscribe({
      next: (chats) => {
        console.log('route chatId:', chatId);
        console.log('chats:', chats);

        const chat = chats.find((item) => item.chatId === chatId);
        console.log('matched chat:', chat);

        if (!chat) {
          this.errorOccured.set(true);
          return;
        }

        this.chat.set(chat);
      },
      error: (error) => {
        console.error(error);
        this.errorOccured.set(true);
      },
    });
  }

  loadMessages(): void {
    const chatId = this.chatId();

    if (!chatId) {
      return;
    }

    this.chatService.getMessages(chatId).subscribe({
      next: (messages) => {
        this.messages.set(messages);

        this.chatService.markChatAsRead(chatId).subscribe({
          error: (error) => {
            console.error(error);
          },
        });
      },
      error: (error) => {
        console.error(error);
        this.errorOccured.set(true);
      },
    });
  }

  sendMessage(): void {
    const chatId = this.chatId();
    const content = this.messageFC.value?.trim();

    if (!chatId || !content || this.messageFC.invalid || this.isSending()) {
      return;
    }

    this.isSending.set(true);

    this.chatService.sendMessage(chatId, { content }).subscribe({
      next: (message) => {
        this.messages.update((messages) => [...messages, message]);
        this.messageFC.reset('');
        this.isSending.set(false);
      },
      error: (error) => {
        console.error(error);
        this.errorOccured.set(true);
        this.isSending.set(false);
      },
    });
  }

  isUnreadForMe(message: MessageResponse): boolean {
    return !this.isSentByMe(message) && !message.read;
  }

  isSentByMe(message: MessageResponse): boolean {
    return message.senderId === this.authenticationStoreService.currentUser()?.id;
  }

  getContactAvatar(): string {
    const profileImageUrl = this.chat()?.profileImageUrl;

    if (!profileImageUrl) {
      return 'https://placehold.co/200x200';
    }

    return `http://localhost:8080${profileImageUrl}`;
  }

  getContactName(): string {
    return this.chat()?.username ?? 'Chat';
  }

  getContactLastSeen(): string {
    return 'unbekannt';
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = 'https://placehold.co/200x200';
  }

  formatTime(value?: string): string {
    if (!value) {
      return '';
    }

    return new Date(value).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
