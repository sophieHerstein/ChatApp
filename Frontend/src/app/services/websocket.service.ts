import { effect, inject, Injectable, signal } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { MessageResponse } from '../generated/api';
import { AuthenticationStoreService } from './authentication-store.service';
import { OnlineStatusStoreService } from './online-status-store.service';
import { environment } from '../../environments/environment';

interface PresenceEvent {
  userId: string;
  online: boolean;
  lastSeenAt?: string;
  visible: boolean;
}

export interface ChatMessageEvent {
  chatId: string;
  clientMessageId: string;
  message: MessageResponse;
}

export interface ChatReadEvent {
  chatId: string;
  readByUserId: string;
  messageIds: string[];
}

interface PendingPublish {
  destination: string;
  body: string;
  key?: string;
}

interface PendingSend {
  acknowledgement: Subject<void>;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface ChatSendAttempt {
  clientMessageId: string;
  acknowledgement$: Observable<void>;
}

export type WebsocketConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private authenticationStoreService = inject(AuthenticationStoreService);
  private onlineStatusStore = inject(OnlineStatusStoreService);

  private client?: Client;
  private connectedToken?: string;
  private pendingPublishes: PendingPublish[] = [];
  private pendingSends = new Map<string, PendingSend>();
  private chatMessageSubject = new Subject<ChatMessageEvent>();
  private chatReadSubject = new Subject<ChatReadEvent>();

  readonly connectionState = signal<WebsocketConnectionState>('disconnected');
  readonly connectionError = signal<string | null>(null);
  readonly chatMessages$ = this.chatMessageSubject.asObservable();
  readonly chatReadEvents$ = this.chatReadSubject.asObservable();

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
    this.connectionState.set('connecting');
    this.connectionError.set(null);
    this.client = new Client({
      brokerURL: environment.websocketUrl,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.client.onConnect = () => {
      this.connectionState.set('connected');
      this.connectionError.set(null);

      this.client?.subscribe('/topic/presence', (message) => {
        const event = JSON.parse(message.body) as PresenceEvent;
        this.onlineStatusStore.setStatus(
          event.userId,
          event.online,
          event.lastSeenAt,
          event.visible,
        );
      });

      this.client?.subscribe('/user/queue/chat/messages', (message) => {
        const event = JSON.parse(message.body) as ChatMessageEvent;
        this.acknowledgeSend(event.clientMessageId);
        this.chatMessageSubject.next(event);
      });

      this.client?.subscribe('/user/queue/chat/read', (message) => {
        this.chatReadSubject.next(JSON.parse(message.body) as ChatReadEvent);
      });

      this.flushPendingPublishes();
    };

    this.client.onStompError = (frame) => {
      this.handleConnectionError(frame.headers['message'] ?? 'WebSocket-Fehler');
    };

    this.client.onWebSocketError = () => {
      this.connectionState.set('error');
      this.connectionError.set('Die Echtzeitverbindung konnte nicht hergestellt werden.');
    };

    this.client.onWebSocketClose = () => {
      if (this.connectedToken) {
        this.connectionState.set('reconnecting');
        this.connectionError.set('Verbindung unterbrochen. Erneuter Verbindungsversuch …');
      }
    };

    void this.client.activate();
  }

  sendChatMessage(
    chatId: string,
    content: string,
    clientMessageId: string = crypto.randomUUID(),
  ): ChatSendAttempt {
    this.cancelPendingSend(clientMessageId);

    const acknowledgement = new Subject<void>();
    const timeoutId = setTimeout(() => {
      this.pendingSends.delete(clientMessageId);
      this.pendingPublishes = this.pendingPublishes.filter(
        (message) => message.key !== clientMessageId,
      );
      acknowledgement.error(
        new Error('Die Nachricht konnte nicht bestätigt werden. Bitte erneut versuchen.'),
      );
    }, 10_000);

    this.pendingSends.set(clientMessageId, { acknowledgement, timeoutId });
    this.publish('/app/chat/send', { chatId, clientMessageId, content }, clientMessageId);

    return {
      clientMessageId,
      acknowledgement$: acknowledgement.asObservable(),
    };
  }

  markChatAsRead(chatId: string): void {
    this.publish('/app/chat/read', { chatId });
  }

  reconnect(): void {
    const token = this.authenticationStoreService.accessToken();

    if (token) {
      this.connectedToken = undefined;
      this.connect(token);
    }
  }

  private publish(destination: string, body: object, key?: string): void {
    const pendingPublish = {
      destination,
      body: JSON.stringify(body),
      key,
    };

    if (!this.client?.connected) {
      this.pendingPublishes.push(pendingPublish);
      return;
    }

    this.client.publish(pendingPublish);
  }

  private flushPendingPublishes(): void {
    if (!this.client?.connected) {
      return;
    }

    const pendingPublishes = this.pendingPublishes;
    this.pendingPublishes = [];
    pendingPublishes.forEach((message) => this.client?.publish(message));
  }

  private acknowledgeSend(clientMessageId: string): void {
    const pendingSend = this.pendingSends.get(clientMessageId);

    if (!pendingSend) {
      return;
    }

    clearTimeout(pendingSend.timeoutId);
    pendingSend.acknowledgement.next();
    pendingSend.acknowledgement.complete();
    this.pendingSends.delete(clientMessageId);
  }

  private cancelPendingSend(clientMessageId: string): void {
    const pendingSend = this.pendingSends.get(clientMessageId);

    if (!pendingSend) {
      return;
    }

    clearTimeout(pendingSend.timeoutId);
    pendingSend.acknowledgement.complete();
    this.pendingSends.delete(clientMessageId);
  }

  private handleConnectionError(message: string): void {
    this.connectionState.set('error');
    this.connectionError.set(message);

    this.pendingSends.forEach((pendingSend) => {
      clearTimeout(pendingSend.timeoutId);
      pendingSend.acknowledgement.error(new Error(message));
    });
    this.pendingSends.clear();
    this.pendingPublishes = [];
  }

  private disconnect(): void {
    this.connectedToken = undefined;
    this.pendingPublishes = [];
    this.connectionState.set('disconnected');
    this.connectionError.set(null);

    this.pendingSends.forEach((pendingSend) => {
      clearTimeout(pendingSend.timeoutId);
      pendingSend.acknowledgement.error(new Error('WebSocket-Verbindung wurde getrennt.'));
    });
    this.pendingSends.clear();

    if (this.client) {
      void this.client.deactivate();
      this.client = undefined;
    }

    this.onlineStatusStore.clear();
  }
}
