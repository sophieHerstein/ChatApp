import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCheckCircle,
  bootstrapPersonDash,
  bootstrapPersonPlus,
} from '@ng-icons/bootstrap-icons';
import { HeaderComponent } from '../../components/header/header.component';
import { EAppPaths } from '../../app.paths';
import { UserSearchResponse } from '../../generated/api';
import { ContactsService } from '../../services/contacts.service';

@Component({
  selector: 'app-contacts-screen',
  imports: [RouterLink, NgOptimizedImage, NgIcon, HeaderComponent],
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

  users = signal<UserSearchResponse[]>([]);
  searchTerm = signal<string>('');
  isSearching = signal<boolean>(false);
  errorOccured = signal<boolean>(false);

  visibleUsers = computed(() => {
    const searchTerm = this.searchTerm().toLowerCase().trim();

    if (!searchTerm) {
      return this.users().filter((user) => user.contact);
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
    this.loadUsers();
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
}
