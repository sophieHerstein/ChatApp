import { Injectable } from '@angular/core';
import {AuthenticationControllerService, UsernameAvailabilityResponse, UserResponse} from '../generated/api';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private authenticationControllerService: AuthenticationControllerService) {}

  public register(username: string, password: string, profileImage?: Blob): Observable<UserResponse> {
    return this.authenticationControllerService.register(username, password, profileImage);
  }

  public isUsernameAvailable(username: string): Observable<UsernameAvailabilityResponse> {
    return this.authenticationControllerService.isUsernameAvailable(username);
  }
}
