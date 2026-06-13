import { computed, Injectable, signal } from '@angular/core';
import { LoginResponse, UserResponse } from '../generated/api';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationStoreService {
  accessToken = signal<string | null>(localStorage.getItem('accessToken'));

  currentUser = signal<UserResponse | null>(this.loadUserFromStorage());

  isLoggedIn = computed(() => !!this.accessToken());

  profileImageSrc = computed(() => {
    const profileImageUrl = this.currentUser()?.profileImageUrl;

    if (!profileImageUrl) {
      return 'https://placehold.co/200x200';
    }

    return `http://localhost:8080${profileImageUrl}`;
  });

  username = computed(() => {
    const username = this.currentUser()?.username;

    if (!username) {
      return 'UNKNOWN';
    }

    return username;
  });

  setLogin(response: LoginResponse) {
    this.accessToken.set(response.accessToken ?? null);
    this.currentUser.set(response.user ?? null);

    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }

    if (response.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
  }

  logout() {
    this.accessToken.set(null);
    this.currentUser.set(null);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  }

  private loadUserFromStorage(): UserResponse | null {
    const userJson = localStorage.getItem('currentUser');

    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as UserResponse;
    } catch {
      localStorage.removeItem('currentUser');
      return null;
    }
  }
}
