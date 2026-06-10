import {Component, signal, ViewEncapsulation} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { EAppPaths } from '../../app.paths';
import {AuthenticationService} from '../../services/authentication.service';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {bootstrapEye, bootstrapEyeSlash} from '@ng-icons/bootstrap-icons';
import {LoginResponse} from '../../generated/api';
import {AuthenticationStoreService} from '../../services/authentication-store.service';

@Component({
  selector: 'app-login-screen',
  imports: [FormsModule, RouterLink, ReactiveFormsModule, NgIcon],
  viewProviders:[provideIcons({bootstrapEyeSlash, bootstrapEye})],
  templateUrl: './login-screen.component.html',
  styleUrl: './login-screen.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoginScreenComponent {
  usernameFC = new FormControl("", Validators.required);
  passwordFC = new FormControl("", Validators.required);

  showPassword = false;
  errorOccured = signal<boolean>(false);

  protected readonly EAppPaths = EAppPaths;

  constructor(private authenticationService: AuthenticationService,private authenticationStoreService: AuthenticationStoreService, private router: Router) {
  }

  login() {
    this.errorOccured.set(false);
    if(this.usernameFC.value && this.passwordFC.value){
      this.authenticationService.login({username: this.usernameFC.value, password: this.passwordFC.value}).subscribe({
        next: (response: LoginResponse) => {
          console.log(response)
          if(response && response.accessToken && response.user) {
            this.authenticationStoreService.setLogin(response);
            this.router.navigate(["/"+EAppPaths.Contacts]);
          } else {
            this.errorOccured.set(true);
          }
        },
        error: () => {
          this.errorOccured.set(true);
        }
      })
    }
  }
}
