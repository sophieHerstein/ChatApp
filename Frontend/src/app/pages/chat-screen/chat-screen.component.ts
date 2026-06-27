import { NgClass, NgOptimizedImage } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { OnlineStatusStoreService } from '../../services/online-status-store.service';
import { WebsocketService } from '../../services/websocket.service';
import { ContentStateComponent } from '../../components/content-state/content-state.component';
import { backendUrl } from '../../backend-url';

type ChatWithPresence = ChatListItemResponse & {
  online?: boolean;
  lastSeenAt?: string;
  presenceVisible?: boolean;
};

interface FailedMessage {
  content: string;
  clientMessageId: string;
}

@Component({
  selector: 'app-chat-screen',
  imports: [
    NgClass,
    NgOptimizedImage,
    NgIcon,
    ReactiveFormsModule,
    RouterLink,
    ContentStateComponent,
  ],
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
  @ViewChild('messagesEnd')
  private messagesEnd?: ElementRef<HTMLElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private chatService = inject(ChatService);
  private authenticationStoreService = inject(AuthenticationStoreService);
  private onlineStatusStore = inject(OnlineStatusStoreService);
  private websocketService = inject(WebsocketService);
  private destroyRef = inject(DestroyRef);

  chatId = signal<string | null>(null);
  chat = signal<ChatListItemResponse | null>(null);
  messages = signal<MessageResponse[]>([]);
  headerError = signal(false);
  messagesError = signal(false);
  isLoadingMessages = signal(true);
  isSending = signal<boolean>(false);
  sendError = signal<string | null>(null);
  failedMessage = signal<FailedMessage | null>(null);
  private readMessageIds = new Set<string>();
  private scrollFrame?: number;

  messageFC = new FormControl('', [Validators.required, Validators.maxLength(5000)]);

  protected readonly EAppPaths = EAppPaths;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.scrollFrame !== undefined) {
        cancelAnimationFrame(this.scrollFrame);
      }
    });
  }

  ngOnInit(): void {
    const chatId = this.route.snapshot.paramMap.get('id');

    if (!chatId) {
      this.headerError.set(true);
      this.isLoadingMessages.set(false);
      return;
    }

    this.chatId.set(chatId);
    this.subscribeToChatEvents();
    this.loadChatHeader();
    this.loadMessages();
  }

  loadChatHeader(): void {
    const chatId = this.chatId();

    if (!chatId) return;

    this.headerError.set(false);
    this.chatService.getChats().subscribe({
      next: (chats) => {
        const chat = chats.find((item) => item.chatId === chatId) as ChatWithPresence | undefined;

        if (!chat) {
          this.headerError.set(true);
          return;
        }

        this.chat.set(chat);
        if (chat.otherUserId) {
          this.onlineStatusStore.initializeStatus(
            chat.otherUserId,
            chat.online ?? false,
            chat.lastSeenAt,
            chat.presenceVisible ?? true,
          );
        }
      },
      error: (error) => {
        console.error(error);
        this.headerError.set(true);
      },
    });
  }

  loadMessages(): void {
    const chatId = this.chatId();

    if (!chatId) {
      this.isLoadingMessages.set(false);
      return;
    }

    this.isLoadingMessages.set(true);
    this.messagesError.set(false);
    this.chatService.getMessages(chatId).subscribe({
      next: (messages) => {
        this.messages.update((liveMessages) => {
          const messagesById = new Map(
            [...messages, ...liveMessages]
              .filter((message) => message.id)
              .map((message) => [
                message.id,
                message.id && this.readMessageIds.has(message.id)
                  ? { ...message, read: true }
                  : message,
              ]),
          );

          return [...messagesById.values()].sort(
            (first, second) =>
              new Date(first.createdAt ?? 0).getTime() - new Date(second.createdAt ?? 0).getTime(),
          );
        });
        this.websocketService.markChatAsRead(chatId);
        this.scheduleScrollToBottom(false);
        this.isLoadingMessages.set(false);
      },
      error: (error) => {
        console.error(error);
        this.messagesError.set(true);
        this.isLoadingMessages.set(false);
      },
    });
  }

  sendMessage(): void {
    const chatId = this.chatId();
    const content = this.messageFC.value?.trim();

    if (!chatId || !content || this.messageFC.invalid || this.isSending()) {
      return;
    }

    this.sendMessageAttempt(chatId, content);
    this.messageFC.reset('');
  }

  retryMessage(): void {
    const chatId = this.chatId();
    const failedMessage = this.failedMessage();

    if (!chatId || !failedMessage || this.isSending()) {
      return;
    }

    this.sendMessageAttempt(chatId, failedMessage.content, failedMessage.clientMessageId);
  }

  private sendMessageAttempt(chatId: string, content: string, clientMessageId?: string): void {
    this.isSending.set(true);
    this.sendError.set(null);
    this.failedMessage.set(null);

    const attempt = this.websocketService.sendChatMessage(chatId, content, clientMessageId);
    attempt.acknowledgement$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      complete: () => this.isSending.set(false),
      error: (error: Error) => {
        this.isSending.set(false);
        this.sendError.set(error.message);
        this.failedMessage.set({
          content,
          clientMessageId: attempt.clientMessageId,
        });
      },
    });
  }

  private subscribeToChatEvents(): void {
    this.websocketService.chatMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.chatId !== this.chatId() || !event.message.id) {
          return;
        }

        const message = this.readMessageIds.has(event.message.id)
          ? { ...event.message, read: true }
          : event.message;

        let messageAdded = false;
        this.messages.update((messages) => {
          if (messages.some((message) => message.id === event.message.id)) {
            return messages;
          }

          messageAdded = true;
          return [...messages, message];
        });

        if (messageAdded) {
          this.scheduleScrollToBottom(true);
        }

        if (this.isSentByMe(message)) {
          this.isSending.set(false);
        } else {
          this.websocketService.markChatAsRead(event.chatId);
        }
      });

    this.websocketService.chatReadEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.chatId !== this.chatId()) {
          return;
        }

        const readMessageIds = new Set(event.messageIds);
        event.messageIds.forEach((messageId) => this.readMessageIds.add(messageId));
        this.messages.update((messages) =>
          messages.map((message) =>
            message.id && readMessageIds.has(message.id) ? { ...message, read: true } : message,
          ),
        );
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

    return backendUrl(profileImageUrl);
  }

  getContactName(): string {
    return this.chat()?.username ?? 'Chat';
  }

  getContactPresence(): string {
    const userId = this.chat()?.otherUserId;

    if (!userId) {
      return 'Zuletzt online unbekannt';
    }

    const status = this.onlineStatusStore.getStatus(userId);

    if (status?.visible === false) {
      return 'Online-Status verborgen';
    }

    if (status?.online) {
      return 'Online';
    }

    if (!status?.lastSeenAt) {
      return 'Zuletzt online unbekannt';
    }

    return `Zuletzt online ${this.formatLastSeen(status.lastSeenAt)}`;
  }

  private formatLastSeen(value: string): string {
    const lastSeen = new Date(value);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastSeenDay = new Date(lastSeen.getFullYear(), lastSeen.getMonth(), lastSeen.getDate());
    const dayDifference = Math.round((today.getTime() - lastSeenDay.getTime()) / 86_400_000);
    const time = lastSeen.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (dayDifference === 0) {
      return `heute, ${time}`;
    }

    if (dayDifference === 1) {
      return `gestern, ${time}`;
    }

    const date = lastSeen.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return `${date}, ${time}`;
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

  shouldShowDateSeparator(index: number): boolean {
    const currentMessage = this.messages()[index];
    const previousMessage = this.messages()[index - 1];

    if (!currentMessage?.createdAt) {
      return false;
    }

    if (!previousMessage?.createdAt) {
      return true;
    }

    return (
      this.toLocalDateKey(currentMessage.createdAt) !==
      this.toLocalDateKey(previousMessage.createdAt)
    );
  }

  formatMessageDate(value?: string): string {
    if (!value) {
      return '';
    }

    const messageDate = new Date(value);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const date = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const dayDifference = Math.round((today.getTime() - date.getTime()) / 86_400_000);

    if (dayDifference === 0) {
      return 'Heute';
    }

    if (dayDifference === 1) {
      return 'Gestern';
    }

    return messageDate.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private toLocalDateKey(value: string): string {
    const date = new Date(value);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  private scheduleScrollToBottom(smooth: boolean): void {
    if (this.scrollFrame !== undefined) {
      cancelAnimationFrame(this.scrollFrame);
    }

    this.scrollFrame = requestAnimationFrame(() => {
      this.messagesEnd?.nativeElement.scrollIntoView({
        behavior: smooth ? 'smooth' : 'instant',
        block: 'end',
      });
      this.scrollFrame = undefined;
    });
  }

  getConnectionMessage(): string | null {
    const state = this.websocketService.connectionState();

    if (state === 'connecting') {
      return 'Echtzeitverbindung wird hergestellt …';
    }

    if (state === 'reconnecting' || state === 'error') {
      return this.websocketService.connectionError() ?? 'Echtzeitverbindung ist unterbrochen.';
    }

    return null;
  }
}
