import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  bootstrapChatDotsFill,
  bootstrapPersonDashFill,
  bootstrapPersonPlusFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { backendUrl } from '../../backend-url';
import { EAppPaths } from '../../app.paths';
import { ContentStateComponent } from '../../components/content-state/content-state.component';
import { HeaderComponent } from '../../components/header/header.component';
import { UserSearchResponse } from '../../generated/api';
import { ChatService } from '../../services/chat.service';
import { ContactsService } from '../../services/contacts.service';

@Component({
  selector: 'app-contact-list-screen',
  imports: [HeaderComponent, ContentStateComponent, NgOptimizedImage, NgIcon],
  viewProviders: [
    provideIcons({
      bootstrapChatDotsFill,
      bootstrapPersonDashFill,
      bootstrapPersonPlusFill,
    }),
  ],
  templateUrl: './contact-list-screen.component.html',
  styleUrl: './contact-list-screen.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ContactListScreenComponent implements OnInit {
  private contactsService = inject(ContactsService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  users = signal<UserSearchResponse[]>([]);
  searchTerm = signal('');
  isLoading = signal(true);
  hasError = signal(false);
  pendingUserIds = signal<Set<string>>(new Set());
  statusMessage = signal<string | null>(null);

  contactCount = computed(() => this.users().filter((user) => user.contact).length);

  contacts = computed(() => {
    const searchTerm = this.normalizedSearchTerm();
    return this.users()
      .filter((user) => user.contact)
      .filter((user) => !searchTerm || user.username?.toLowerCase().includes(searchTerm))
      .sort(this.sortByUsername);
  });

  otherUsers = computed(() => {
    const searchTerm = this.normalizedSearchTerm();

    if (!searchTerm) {
      return [];
    }

    return this.users()
      .filter((user) => !user.contact)
      .filter((user) => user.username?.toLowerCase().includes(searchTerm))
      .sort(this.sortByUsername);
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.contactsService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  searchUsers(value: string | null): void {
    this.searchTerm.set(value?.trim() ?? '');
    this.statusMessage.set(null);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  openChat(user: UserSearchResponse): void {
    if (!user.id || this.isPending(user.id)) {
      return;
    }

    this.setPending(user.id, true);
    this.chatService.createDirectChat(user.id).subscribe({
      next: (response) => {
        this.setPending(user.id!, false);

        if (response.chatId) {
          this.router.navigate(['/', EAppPaths.Chat, response.chatId]);
        }
      },
      error: (error) => {
        console.error(error);
        this.setPending(user.id!, false);
        this.statusMessage.set('Der Chat konnte nicht geöffnet werden.');
      },
    });
  }

  addContact(user: UserSearchResponse): void {
    if (!user.id || this.isPending(user.id)) {
      return;
    }

    this.setPending(user.id, true);
    this.contactsService.addContact(user.id).subscribe({
      next: () => {
        this.updateContactState(user.id!, true);
        this.setPending(user.id!, false);
        this.statusMessage.set(`${user.username ?? 'Nutzer'} wurde hinzugefügt.`);
      },
      error: (error) => {
        console.error(error);
        this.setPending(user.id!, false);
        this.statusMessage.set('Der Kontakt konnte nicht hinzugefügt werden.');
      },
    });
  }

  removeContact(user: UserSearchResponse): void {
    if (!user.id || this.isPending(user.id)) {
      return;
    }

    this.setPending(user.id, true);
    this.contactsService.removeContact(user.id).subscribe({
      next: () => {
        this.updateContactState(user.id!, false);
        this.setPending(user.id!, false);
        this.statusMessage.set(`${user.username ?? 'Nutzer'} wurde entfernt.`);
      },
      error: (error) => {
        console.error(error);
        this.setPending(user.id!, false);
        this.statusMessage.set('Der Kontakt konnte nicht entfernt werden.');
      },
    });
  }

  isPending(userId?: string): boolean {
    return !!userId && this.pendingUserIds().has(userId);
  }

  getProfileImageUrl(user: UserSearchResponse): string {
    return user.profileImageUrl ? backendUrl(user.profileImageUrl) : 'https://placehold.co/200x200';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/200x200';
  }

  private normalizedSearchTerm(): string {
    return this.searchTerm().toLowerCase().trim();
  }

  private updateContactState(userId: string, contact: boolean): void {
    this.users.update((users) =>
      users.map((user) => (user.id === userId ? { ...user, contact } : user)),
    );
  }

  private setPending(userId: string, pending: boolean): void {
    this.pendingUserIds.update((userIds) => {
      const next = new Set(userIds);
      if (pending) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  }

  private sortByUsername(first: UserSearchResponse, second: UserSearchResponse): number {
    return (first.username ?? '').localeCompare(second.username ?? '', 'de', {
      sensitivity: 'base',
    });
  }
}
