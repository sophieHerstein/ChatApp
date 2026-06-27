import { NgClass, NgOptimizedImage } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { EAppPaths } from '../../app.paths';
import { ChatListItemResponse } from '../../generated/api';
import { ChatService } from '../../services/chat.service';
import { AuthenticationStoreService } from '../../services/authentication-store.service';
import { WebsocketService } from '../../services/websocket.service';
import { ContentStateComponent } from '../../components/content-state/content-state.component';
import { backendUrl } from '../../backend-url';

@Component({
  selector: 'app-contacts-screen',
  imports: [NgOptimizedImage, HeaderComponent, NgClass, ContentStateComponent],
  templateUrl: './contacts-screen.component.html',
  styleUrl: './contacts-screen.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ContactsScreenComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);
  private authenticationStoreService = inject(AuthenticationStoreService);
  private websocketService = inject(WebsocketService);
  private destroyRef = inject(DestroyRef);

  chats = signal<ChatListItemResponse[]>([]);
  isLoadingChats = signal(true);
  chatsError = signal(false);

  visibleChats = computed(() => this.chats());

  protected readonly EAppPaths = EAppPaths;

  ngOnInit(): void {
    this.subscribeToChatEvents();
    this.loadChats();
  }

  private subscribeToChatEvents(): void {
    this.websocketService.chatMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        const existingChat = this.chats().some((chat) => chat.chatId === event.chatId);

        if (!existingChat) {
          this.loadChats();
          return;
        }

        const currentUserId = this.authenticationStoreService.currentUser()?.id;
        this.chats.update((chats) =>
          this.sortChats(
            chats.map((chat) => {
              if (chat.chatId !== event.chatId) {
                return chat;
              }

              const receivedMessage = event.message.senderId !== currentUserId;
              return {
                ...chat,
                lastMessage: event.message.content,
                lastMessageTime: event.message.createdAt,
                unreadCount: receivedMessage ? (chat.unreadCount ?? 0) + 1 : chat.unreadCount,
              };
            }),
          ),
        );
      });

    this.websocketService.chatReadEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.readByUserId !== this.authenticationStoreService.currentUser()?.id) {
          return;
        }

        this.chats.update((chats) =>
          this.sortChats(
            chats.map((chat) =>
              chat.chatId === event.chatId ? { ...chat, unreadCount: 0 } : chat,
            ),
          ),
        );
      });
  }

  openExistingChat(chat: ChatListItemResponse): void {
    if (!chat.chatId) {
      return;
    }

    this.router.navigate(['/', EAppPaths.Chat, chat.chatId]);
  }

  openContacts(): void {
    this.router.navigate(['/', EAppPaths.Contacts]);
  }

  loadChats(): void {
    this.isLoadingChats.set(true);
    this.chatsError.set(false);
    this.chatService.getChats().subscribe({
      next: (chats) => {
        this.chats.set(this.sortChats(chats));
        this.isLoadingChats.set(false);
      },
      error: (error) => {
        console.error(error);
        this.chatsError.set(true);
        this.isLoadingChats.set(false);
      },
    });
  }

  private sortChats(chats: ChatListItemResponse[]): ChatListItemResponse[] {
    return [...chats].sort((first, second) => {
      const unreadDifference =
        Number((second.unreadCount ?? 0) > 0) - Number((first.unreadCount ?? 0) > 0);

      if (unreadDifference !== 0) {
        return unreadDifference;
      }

      const timeDifference =
        new Date(second.lastMessageTime ?? 0).getTime() -
        new Date(first.lastMessageTime ?? 0).getTime();

      if (timeDifference !== 0) {
        return timeDifference;
      }

      return (first.username ?? '').localeCompare(second.username ?? '', 'de', {
        sensitivity: 'base',
      });
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = 'https://placehold.co/200x200';
  }

  getChatProfileImageUrl(chat: ChatListItemResponse): string {
    if (!chat.profileImageUrl) {
      return 'https://placehold.co/200x200';
    }

    return backendUrl(chat.profileImageUrl);
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
