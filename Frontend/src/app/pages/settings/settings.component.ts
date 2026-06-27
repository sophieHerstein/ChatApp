import { Component, signal, ViewEncapsulation, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthenticationStoreService } from '../../services/authentication-store.service';
import { createPasswordForm, createUsernameControl, readImagePreview } from '../../utils';
import { AuthenticationService } from '../../services/authentication.service';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  tap,
  catchError,
  map,
  switchMap,
  concat,
  EMPTY,
  Observable,
} from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapEye, bootstrapEyeSlash } from '@ng-icons/bootstrap-icons';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../generated/api';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationPreferencesService } from '../../services/notification-preferences.service';
import { ChatNotificationService } from '../../services/chat-notification.service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, FormsModule, HeaderComponent, NgIcon],
  viewProviders: [provideIcons({ bootstrapEyeSlash, bootstrapEye })],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit {
  authenticationStoreService = inject(AuthenticationStoreService);
  authenticationService = inject(AuthenticationService);
  userService = inject(UserService);
  private websocketService = inject(WebsocketService);
  readonly notificationPreferences = inject(NotificationPreferencesService);
  private chatNotificationService = inject(ChatNotificationService);
  private destroyRef = inject(DestroyRef);

  usernameFC = createUsernameControl();
  private passwordForm = createPasswordForm(false);
  passwordFC = this.passwordForm.password;
  confirmPasswordFC = this.passwordForm.confirmPassword;
  passwordFG = this.passwordForm.group;
  currentPasswordFC = new FormControl('', {
    nonNullable: true,
    validators: Validators.required,
  });

  statusMessage = signal<string | null>(null);
  statusType = signal<'success' | 'danger' | null>(null);
  isSaving = signal(false);

  showPassword = false;
  showConfirmPassword = false;
  showCurrentPassword = false;

  profileImage = signal<File | null>(null);
  profileImagePreview = signal<string | null>(null);

  usernameTaken = signal<boolean>(false);
  notificationStatus = signal<string | null>(null);
  presenceStatus = signal<string | null>(null);
  isSavingPresence = signal(false);
  browserPermission = signal<NotificationPermission | 'unsupported'>(
    this.chatNotificationService.browserPermission(),
  );

  ngOnInit(): void {
    const currentUser = this.authenticationStoreService.currentUser();

    if (
      this.notificationPreferences.browserNotificationsEnabled() &&
      this.browserPermission() !== 'granted'
    ) {
      this.notificationPreferences.setBrowserNotificationsEnabled(false);
    }

    this.usernameFC.setValue(currentUser?.username ?? '', { emitEvent: false });

    this.profileImagePreview.set(this.authenticationStoreService.profileImageSrc());

    this.usernameFC.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map((username) => username?.trim() ?? ''),
        tap((username) => {
          if (!username || username.length < 3) {
            this.usernameTaken.set(false);
          }
        }),
        filter((username) => username.length >= 3),
        switchMap((username) => {
          const currentUsername = this.authenticationStoreService.currentUser()?.username;

          if (username.toLowerCase() === currentUsername?.toLowerCase()) {
            this.usernameTaken.set(false);
            return EMPTY;
          }

          return this.authenticationService.isUsernameAvailable(username);
        }),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.usernameTaken.set(!result.available);
      });
  }

  async onProfileImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    this.profileImage.set(file);
    this.profileImagePreview.set(await readImagePreview(file));
  }

  async toggleSound(enabled: boolean): Promise<void> {
    this.notificationPreferences.setSoundEnabled(enabled);
    this.notificationStatus.set(
      enabled ? 'Benachrichtigungston wurde aktiviert.' : 'Benachrichtigungston wurde deaktiviert.',
    );

    if (enabled) {
      await this.chatNotificationService.previewSound();
    }
  }

  async toggleBrowserNotifications(enabled: boolean): Promise<void> {
    if (!enabled) {
      this.notificationPreferences.setBrowserNotificationsEnabled(false);
      this.notificationStatus.set('Browser-Benachrichtigungen wurden deaktiviert.');
      return;
    }

    const permission = await this.chatNotificationService.requestBrowserPermission();
    this.browserPermission.set(permission);

    if (permission === 'granted') {
      this.notificationPreferences.setBrowserNotificationsEnabled(true);
      this.notificationStatus.set('Browser-Benachrichtigungen wurden aktiviert.');
    } else {
      this.notificationPreferences.setBrowserNotificationsEnabled(false);
      this.notificationStatus.set(
        permission === 'denied'
          ? 'Browser-Benachrichtigungen sind im Browser blockiert.'
          : 'Browser-Benachrichtigungen wurden nicht freigegeben.',
      );
    }
  }

  togglePresenceVisibility(visible: boolean): void {
    this.isSavingPresence.set(true);
    this.presenceStatus.set(null);

    this.userService.updatePresenceVisibility({ visible }).subscribe({
      next: (user) => {
        this.authenticationStoreService.updateCurrentUser(user);
        this.isSavingPresence.set(false);
        this.presenceStatus.set(
          visible
            ? 'Dein Online-Status ist für andere sichtbar.'
            : 'Dein Online-Status und „zuletzt online“ sind jetzt verborgen.',
        );
      },
      error: (error) => {
        console.error(error);
        this.isSavingPresence.set(false);
        this.presenceStatus.set('Die Presence-Einstellung konnte nicht gespeichert werden.');
      },
    });
  }

  browserNotificationsAvailable(): boolean {
    return this.browserPermission() !== 'unsupported';
  }

  save() {
    this.statusMessage.set(null);
    this.statusType.set(null);

    const currentUser = this.authenticationStoreService.currentUser();

    if (!currentUser) {
      this.showError('Deine Nutzerdaten konnten nicht geladen werden.');
      return;
    }

    const requests: Observable<UserResponse | void>[] = [];

    const newUsername = this.usernameFC.value?.trim();
    const usernameChanged =
      !!newUsername && newUsername.toLowerCase() !== currentUser.username?.toLowerCase();

    if (usernameChanged) {
      requests.push(this.userService.updateUsername({ username: newUsername }));
    }

    if (this.profileImage()) {
      requests.push(this.userService.updateProfileImage(this.profileImage()!));
    }

    const wantsToChangePassword =
      !!this.currentPasswordFC.value || !!this.passwordFC.value || !!this.confirmPasswordFC.value;

    if (wantsToChangePassword) {
      if (this.passwordFG.invalid || this.currentPasswordFC.invalid) {
        this.showError('Bitte fülle alle Passwortfelder korrekt aus.');
        return;
      }

      requests.push(
        this.userService.updatePassword({
          currentPassword: this.currentPasswordFC.value,
          newPassword: this.passwordFC.value,
        }),
      );
    }

    if (requests.length === 0) {
      this.showError('Es wurden keine Änderungen vorgenommen.');
      return;
    }

    this.isSaving.set(true);
    concat(...requests)
      .pipe(
        tap((result) => {
          if (result) {
            this.authenticationStoreService.updateCurrentUser(result as UserResponse);
          }
        }),
        catchError((error) => {
          console.error(error);
          if (error.status === 401) {
            this.showError('Das aktuelle Passwort ist nicht korrekt.');
          } else if (error.status === 409) {
            this.showError('Der Nutzername ist bereits vergeben.');
          } else if (error.status === 400) {
            this.showError('Die ausgewählten Daten sind ungültig.');
          } else {
            this.showError('Die Änderungen konnten nicht gespeichert werden.');
          }
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        complete: () => {
          this.isSaving.set(false);
          this.profileImage.set(null);
          this.profileImagePreview.set(this.authenticationStoreService.profileImageSrc());
          this.currentPasswordFC.reset();
          this.passwordFC.reset();
          this.confirmPasswordFC.reset();
          if (this.statusType() !== 'danger') {
            this.statusType.set('success');
            this.statusMessage.set('Deine Einstellungen wurden gespeichert.');
            if (usernameChanged) {
              this.websocketService.reconnect();
            }
          }
        },
      });
  }

  private showError(message: string): void {
    this.isSaving.set(false);
    this.statusType.set('danger');
    this.statusMessage.set(message);
  }
}
