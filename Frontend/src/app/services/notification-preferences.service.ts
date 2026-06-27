import { effect, inject, Injectable, signal } from '@angular/core';
import { AuthenticationStoreService } from './authentication-store.service';

interface NotificationPreferences {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  soundEnabled: true,
  browserNotificationsEnabled: false,
};

@Injectable({
  providedIn: 'root',
})
export class NotificationPreferencesService {
  private authenticationStore = inject(AuthenticationStoreService);
  private currentUserId?: string;

  readonly soundEnabled = signal(DEFAULT_PREFERENCES.soundEnabled);
  readonly browserNotificationsEnabled = signal(DEFAULT_PREFERENCES.browserNotificationsEnabled);

  constructor() {
    effect(() => {
      const userId = this.authenticationStore.currentUser()?.id;

      if (userId === this.currentUserId) {
        return;
      }

      this.currentUserId = userId;
      const preferences = this.loadPreferences(userId);
      this.soundEnabled.set(preferences.soundEnabled);
      this.browserNotificationsEnabled.set(preferences.browserNotificationsEnabled);
    });
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled.set(enabled);
    this.persist();
  }

  setBrowserNotificationsEnabled(enabled: boolean): void {
    this.browserNotificationsEnabled.set(enabled);
    this.persist();
  }

  private loadPreferences(userId?: string): NotificationPreferences {
    if (!userId) {
      return DEFAULT_PREFERENCES;
    }

    const value = localStorage.getItem(this.storageKey(userId));

    if (!value) {
      return DEFAULT_PREFERENCES;
    }

    try {
      return {
        ...DEFAULT_PREFERENCES,
        ...(JSON.parse(value) as Partial<NotificationPreferences>),
      };
    } catch {
      localStorage.removeItem(this.storageKey(userId));
      return DEFAULT_PREFERENCES;
    }
  }

  private persist(): void {
    if (!this.currentUserId) {
      return;
    }

    localStorage.setItem(
      this.storageKey(this.currentUserId),
      JSON.stringify({
        soundEnabled: this.soundEnabled(),
        browserNotificationsEnabled: this.browserNotificationsEnabled(),
      }),
    );
  }

  private storageKey(userId: string): string {
    return `chatapp.notification-preferences.${userId}`;
  }
}
