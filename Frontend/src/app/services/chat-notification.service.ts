import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EAppPaths } from '../app.paths';
import { AuthenticationStoreService } from './authentication-store.service';
import { NotificationPreferencesService } from './notification-preferences.service';
import { ChatMessageEvent, WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class ChatNotificationService {
  private websocketService = inject(WebsocketService);
  private authenticationStore = inject(AuthenticationStoreService);
  private preferences = inject(NotificationPreferencesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private audioContext?: AudioContext;

  constructor() {
    this.websocketService.chatMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.handleMessage(event));
  }

  async requestBrowserPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    return Notification.requestPermission();
  }

  browserPermission(): NotificationPermission | 'unsupported' {
    return 'Notification' in window ? Notification.permission : 'unsupported';
  }

  async previewSound(): Promise<void> {
    await this.playSound();
  }

  private handleMessage(event: ChatMessageEvent): void {
    if (
      event.message.senderId === this.authenticationStore.currentUser()?.id ||
      this.isCurrentlyVisible(event.chatId)
    ) {
      return;
    }

    if (this.preferences.soundEnabled()) {
      void this.playSound();
    }

    if (this.preferences.browserNotificationsEnabled() && this.browserPermission() === 'granted') {
      this.showBrowserNotification(event);
    }
  }

  private isCurrentlyVisible(chatId: string): boolean {
    return (
      document.visibilityState === 'visible' &&
      this.router.url.split('?')[0] === `/${EAppPaths.Chat}/${chatId}`
    );
  }

  private async playSound(): Promise<void> {
    const AudioContextClass =
      window.AudioContext ??
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    this.audioContext ??= new AudioContextClass();

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.setValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.24);
  }

  private showBrowserNotification(event: ChatMessageEvent): void {
    const notification = new Notification('Neue Nachricht', {
      body: event.message.content || 'Du hast eine neue Nachricht erhalten.',
      icon: '/favicon.ico',
      tag: `chat-${event.chatId}`,
    });

    notification.onclick = () => {
      window.focus();
      void this.router.navigate(['/', EAppPaths.Chat, event.chatId]);
      notification.close();
    };
  }
}
