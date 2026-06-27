import { computed, Injectable, signal } from '@angular/core';
import { LoginResponse, UserResponse } from '../generated/api';
import { backendUrl } from '../backend-url';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationStoreService {
  accessToken = signal<string | null>(localStorage.getItem('accessToken'));

  currentUser = signal<UserResponse | null>(null);

  isLoggedIn = computed(() => !!this.accessToken());

  profileImageSrc = computed(() => {
    const profileImageUrl = this.currentUser()?.profileImageUrl;

    if (!profileImageUrl) {
      return 'https://placehold.co/200x200';
    }

    return backendUrl(profileImageUrl);
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
  }

  logout() {
    this.accessToken.set(null);
    this.currentUser.set(null);

    localStorage.removeItem('accessToken');
  }

  updateCurrentUser(user: UserResponse) {
    this.currentUser.set(user);
  }
}
