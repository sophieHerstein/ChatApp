import { Component, DestroyRef, inject, signal, ViewEncapsulation, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EAppPaths } from '../../app.paths';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
import { createPasswordForm, createUsernameControl, readImagePreview } from '../../utils';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapEye, bootstrapEyeSlash } from '@ng-icons/bootstrap-icons';
import { LoginResponse } from '../../generated/api';
import { AuthenticationStoreService } from '../../services/authentication-store.service';

@Component({
  selector: 'app-registration-screen',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, NgIcon],
  viewProviders: [provideIcons({ bootstrapEyeSlash, bootstrapEye })],
  templateUrl: './registration-screen.component.html',
  styleUrl: './registration-screen.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RegistrationScreenComponent implements OnInit {
  authenticationStoreService = inject(AuthenticationStoreService);
  authenticationService = inject(AuthenticationService);
  router = inject(Router);
  private destroyRef = inject(DestroyRef);

  usernameFC = createUsernameControl();
  private passwordForm = createPasswordForm(true);
  passwordFC = this.passwordForm.password;
  confirmPasswordFC = this.passwordForm.confirmPassword;
  passwordFG = this.passwordForm.group;

  errorOccured = signal<boolean>(false);

  showPassword = false;
  showConfirmPassword = false;

  profileImage = signal<File | null>(null);
  profileImagePreview = signal<string | null>(null);

  usernameTaken = signal<boolean>(false);

  protected readonly EAppPaths = EAppPaths;

  ngOnInit() {
    this.usernameFC.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map((username) => username?.trim() ?? ''),
        tap((username) => {
          if (!username) {
            this.usernameTaken.set(false);
          }
        }),
        filter((username) => username.length >= 3),
        switchMap((username) => this.authenticationService.isUsernameAvailable(username)),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.usernameTaken.set(!result.available);
      });
  }

  register() {
    this.errorOccured.set(false);
    this.authenticationService
      .register(this.usernameFC.value, this.passwordFC.value, this.profileImage() ?? undefined)
      .subscribe({
        next: (response: LoginResponse) => {
          this.authenticationStoreService.setLogin(response);
          this.router.navigate(['/' + EAppPaths.Chats]);
        },
        error: () => {
          this.errorOccured.set(true);
        },
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
}
