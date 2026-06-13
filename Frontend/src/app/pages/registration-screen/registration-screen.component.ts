import { Component, inject, signal, ViewEncapsulation, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EAppPaths } from '../../app.paths';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
import { confirmPasswordValidator } from '../../utils';
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

  passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])/;

  usernameFC: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50),
  ]);
  passwordFC: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100),
    Validators.pattern(this.passwordRegex),
  ]);
  confirmPasswordFC: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100),
  ]);
  passwordFG: FormGroup = new FormGroup(
    { password: this.passwordFC, confirmPassword: this.confirmPasswordFC },
    confirmPasswordValidator,
  );

  errorOccured = signal<boolean>(false);

  showPassword = false;
  showConfirmPassword = false;

  profileImage = signal<File | null>(null);
  profileImagePreview = signal<string | null>(null);

  usernameAvailable = signal<boolean>(false);

  protected readonly EAppPaths = EAppPaths;

  ngOnInit() {
    this.usernameFC.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map((username) => username?.trim() ?? ''),
        tap((username) => {
          if (!username) {
            this.usernameAvailable.set(false);
          }
        }),
        filter((username) => username.length >= 3),
        switchMap((username) => this.authenticationService.isUsernameAvailable(username)),
      )
      .subscribe((result) => {
        console.log(result.available);
        this.usernameAvailable.set(!result.available);
      });
  }

  register() {
    this.errorOccured.set(false);
    this.authenticationService
      .register(this.usernameFC.value, this.passwordFC.value, this.profileImage() ?? undefined)
      .subscribe({
        next: (response: LoginResponse) => {
          this.authenticationStoreService.setLogin(response);
          this.router.navigate(['/' + EAppPaths.Contacts]);
        },
        error: () => {
          this.errorOccured.set(true);
        },
      });
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    this.profileImage.set(file);
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
}
