import { Component, signal, ViewEncapsulation } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors, ValidatorFn,
  Validators
} from '@angular/forms';
import { EAppPaths } from '../../app.paths';
import {Router, RouterLink} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs';
import {confirmPasswordValidator} from '../../utils';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {bootstrapEye, bootstrapEyeSlash} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-registration-screen',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, NgIcon],
  viewProviders:[provideIcons({bootstrapEyeSlash, bootstrapEye})],
  templateUrl: './registration-screen.component.html',
  styleUrl: './registration-screen.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RegistrationScreenComponent {
  passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])/;

  usernameFC: FormControl = new FormControl('', [Validators.required, Validators.minLength(3),Validators.maxLength(50)]);
  passwordFC: FormControl = new FormControl( '', [Validators.required, Validators.minLength(8),Validators.maxLength(100), Validators.pattern(this.passwordRegex)]);
  confirmPasswordFC: FormControl = new FormControl('', [Validators.required, Validators.minLength(8),Validators.maxLength(100)]);
  passwordFG: FormGroup = new FormGroup({password: this.passwordFC, confirmPassword: this.confirmPasswordFC}, confirmPasswordValidator);

  errorOccured = false;

  showPassword = false;
  showConfirmPassword = false;

  profileImage = signal<File | null>(null);
  profileImagePreview = signal<string | null>(null);

  usernameAvailable = signal<boolean>(false);

  protected readonly EAppPaths = EAppPaths;

  constructor(private authenticationService: AuthenticationService, private router: Router) {
    this.usernameFC.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(username =>
        this.authenticationService.isUsernameAvailable(username)
      )
    ).subscribe(result => {
      this.usernameAvailable.set(!!result.available);
    });
  }

  register() {
    this.errorOccured = false;
    this.authenticationService
      .register(this.usernameFC.value, this.passwordFC.value, this.profileImage() ?? undefined)
      .subscribe({
        next: (user) => {
          this.router.navigate([EAppPaths.Contacts]);
        },
        error: async (err) => {
          this.errorOccured = true;
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
