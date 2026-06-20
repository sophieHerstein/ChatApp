import {NgClass, NgOptimizedImage} from '@angular/common';
import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCheckCircle,
  bootstrapPersonDash,
  bootstrapPersonPlus,
} from '@ng-icons/bootstrap-icons';
import { HeaderComponent } from '../../components/header/header.component';
import { EAppPaths } from '../../app.paths';
import { UserSearchResponse, ChatListItemResponse } from '../../generated/api';
import { ContactsService } from '../../services/contacts.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-contacts-screen',
  imports: [NgOptimizedImage, NgIcon, HeaderComponent, NgClass],
  viewProviders: [
    provideIcons({
      bootstrapCheckCircle,
      bootstrapPersonDash,
      bootstrapPersonPlus,
    }),
  ],
  templateUrl: './contacts-screen.component.html',
  styleUrl: './contacts-screen.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ContactsScreenComponent implements OnInit {
  private contactsService = inject(ContactsService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  users = signal<UserSearchResponse[]>([]);
  chats = signal<ChatListItemResponse[]>([]);
  searchTerm = signal<string>('');
  isSearching = signal(false);
  errorOccured = signal(false);

  visibleChats = computed(() => this.chats());

  visibleUsers = computed(() => {
    const searchTerm = this.searchTerm().toLowerCase().trim();

    if (!searchTerm) {
      return [];
    }

    return this.users().filter((user) =>
      user.username?.toLowerCase().includes(searchTerm),
    );
  });

  visibleContactUsers = computed(() =>
    this.visibleUsers().filter((user) => user.contact),
  );

  visibleOtherUsers = computed(() =>
    this.visibleUsers().filter((user) => !user.contact),
  );

  protected readonly EAppPaths = EAppPaths;

  ngOnInit(): void {
    this.loadChats();
    this.loadUsers();
  }

  openExistingChat(chat: ChatListItemResponse): void {
    if (!chat.chatId) {
      return;
    }

    this.router.navigate(['/', EAppPaths.Chat, chat.chatId]);
  }

  openChat(user: UserSearchResponse): void {
    if (!user.id) {
      return;
    }

    this.chatService.createDirectChat(user.id).subscribe({
      next: (response) => {
        if (!response.chatId) {
          this.errorOccured.set(true);
          return;
        }

        this.router.navigate(['/', EAppPaths.Chat, response.chatId]);
      },
      error: (error) => {
        console.error(error);
        this.errorOccured.set(true);
      },
    });
  }

  loadUsers(): void {
    this.contactsService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: (error) => {
        console.error(error);
        this.errorOccured.set(true);
      },
    });
  }

  loadChats(): void {
    this.chatService.getChats().subscribe({
      next: (chats) => this.chats.set(chats),
      error: (error) => {
        console.error(error);
        this.errorOccured.set(true);
      },
    });
  }

  addContact(user: UserSearchResponse, event: MouseEvent): void {
    event.stopPropagation();

    if (!user.id) {
      return;
    }

    this.contactsService.addContact(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (error) => {
        console.error(error);
        this.errorOccured.set(true);
      },
    });
  }

  removeContact(user: UserSearchResponse, event: MouseEvent): void {
    event.stopPropagation();

    if (!user.id) {
      return;
    }

    this.contactsService.removeContact(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (error) => {
        console.error(error);
        this.errorOccured.set(true);
      },
    });
  }

  searchContact(value: string | null): void {
    const searchValue = value?.trim() ?? '';

    this.searchTerm.set(searchValue);
    this.isSearching.set(!!searchValue);
  }

  isSearchingStatus(status: boolean): void {
    this.isSearching.set(status);

    if (!status) {
      this.searchTerm.set('');
    }
  }

  getProfileImageUrl(user: UserSearchResponse): string {
    if (!user.profileImageUrl) {
      return 'https://placehold.co/200x200';
    }

    return `http://localhost:8080${user.profileImageUrl}`;
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = 'https://placehold.co/200x200';
  }

  getChatProfileImageUrl(chat: ChatListItemResponse): string {
    if (!chat.profileImageUrl) {
      return 'https://placehold.co/200x200';
    }

    return `http://localhost:8080${chat.profileImageUrl}`;
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
