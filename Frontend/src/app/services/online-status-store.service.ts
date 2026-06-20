import { Injectable, signal } from '@angular/core';

export interface OnlineStatus {
  online: boolean;
  lastSeenAt?: string;
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

  initializeStatus(userId: string, online: boolean, lastSeenAt?: string): void {
    if (this.statuses().has(userId)) {
      return;
    }

    this.setStatus(userId, online, lastSeenAt);
  }

  setStatus(userId: string, online: boolean, lastSeenAt?: string): void {
    this.statuses.update((statuses) => {
      const next = new Map(statuses);
      const previous = next.get(userId);
      next.set(userId, {
        online,
        lastSeenAt: lastSeenAt ?? previous?.lastSeenAt,
      });
      return next;
    });
  }

  clear(): void {
    this.statuses.set(new Map());
  }
}
