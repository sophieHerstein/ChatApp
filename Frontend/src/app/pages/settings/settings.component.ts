import { Component, signal, ViewEncapsulation, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EAppPaths } from '../../app.paths';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthenticationStoreService } from '../../services/authentication-store.service';
import { Router } from '@angular/router';
import { confirmPasswordValidator } from '../../utils';
import { AuthenticationService } from '../../services/authentication.service';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapEye, bootstrapEyeSlash } from '@ng-icons/bootstrap-icons';

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
  currentPasswordFC: FormControl = new FormControl('', Validators.required);
  passwordFG: FormGroup = new FormGroup(
    { password: this.passwordFC, confirmPassword: this.confirmPasswordFC },
    confirmPasswordValidator,
  );

  errorOccured = signal<boolean>(false);

  showPassword = false;
  showConfirmPassword = false;
  showCurrentPassword = false;

  profileImage = signal<File | null>(null);
  profileImagePreview = signal<string | null>(null);

  usernameAvailable = signal<boolean>(false);

  protected readonly EAppPaths = EAppPaths;

  ngOnInit(): void {
    this.profileImagePreview.set(this.authenticationStoreService.profileImageSrc());

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

  save() {
    console.log('save');
  }
}
