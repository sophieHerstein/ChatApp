import {computed, Injectable, signal} from '@angular/core';
import {LoginResponse, UserResponse} from '../generated/api';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationStoreService {

  accessToken = signal<string | null>(localStorage.getItem('accessToken'));
  currentUser = signal<UserResponse | null>(null);

  isLoggedIn = computed(() => !!this.accessToken());

  setLogin(response: LoginResponse) {
    this.accessToken.set(response.accessToken!);
    this.currentUser.set(response.user!);
    localStorage.setItem('accessToken', response.accessToken!);
  }

  logout() {
    this.accessToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('accessToken');
  }
}
