import { effect, inject, Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { AuthenticationStoreService } from './authentication-store.service';
import { OnlineStatusStoreService } from './online-status-store.service';

interface PresenceEvent {
  userId: string;
  online: boolean;
  lastSeenAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private authenticationStoreService = inject(AuthenticationStoreService);
  private onlineStatusStore = inject(OnlineStatusStoreService);

  private client?: Client;
  private connectedToken?: string;

  constructor() {
    effect(() => {
      const token = this.authenticationStoreService.accessToken();

      if (token) {
        this.connect(token);
      } else {
        this.disconnect();
      }
    });
  }

  private connect(token: string): void {
    if (this.client?.active && this.connectedToken === token) {
      return;
    }

    this.disconnect();
    this.connectedToken = token;
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.client.onConnect = () => {
      this.client?.subscribe('/topic/presence', (message) => {
        const event = JSON.parse(message.body) as PresenceEvent;
        this.onlineStatusStore.setStatus(event.userId, event.online, event.lastSeenAt);
      });
    };

    this.client.activate();
  }

  private disconnect(): void {
    this.connectedToken = undefined;

    if (this.client) {
      void this.client.deactivate();
      this.client = undefined;
    }

    this.onlineStatusStore.clear();
  }
}
