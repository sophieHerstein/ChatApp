import { inject, Injectable } from '@angular/core';
import {
  AuthenticationControllerService,
  LoginRequest,
  LoginResponse,
  UsernameAvailabilityResponse,
} from '../generated/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  authenticationControllerService = inject(AuthenticationControllerService);

  public register(
    username: string,
    password: string,
    profileImage?: Blob,
  ): Observable<LoginResponse> {
    return this.authenticationControllerService.register(username, password, profileImage);
  }

  public isUsernameAvailable(username: string): Observable<UsernameAvailabilityResponse> {
    return this.authenticationControllerService.isUsernameAvailable(username);
  }

  public login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.authenticationControllerService.login(loginData);
  }
}
