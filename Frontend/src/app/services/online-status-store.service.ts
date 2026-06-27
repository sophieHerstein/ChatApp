import { Injectable, signal } from '@angular/core';

export interface OnlineStatus {
  online: boolean;
  lastSeenAt?: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OnlineStatusStoreService {
  private statuses = signal<Map<string, OnlineStatus>>(new Map());

  getStatus(userId: string): OnlineStatus | undefined {
    return this.statuses().get(userId);
  }

  isOnline(userId: string): boolean {
    return this.getStatus(userId)?.online ?? false;
  }

  initializeStatus(userId: string, online: boolean, lastSeenAt?: string, visible = true): void {
    if (this.statuses().has(userId)) {
      return;
    }

    this.setStatus(userId, online, lastSeenAt, visible);
  }

  setStatus(userId: string, online: boolean, lastSeenAt?: string, visible = true): void {
    this.statuses.update((statuses) => {
      const next = new Map(statuses);
      const previous = next.get(userId);
      next.set(userId, {
        online: visible && online,
        lastSeenAt: visible ? (lastSeenAt ?? previous?.lastSeenAt) : undefined,
        visible,
      });
      return next;
    });
  }

  clear(): void {
    this.statuses.set(new Map());
  }
}
