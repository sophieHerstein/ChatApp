import { inject, Injectable } from '@angular/core';
import {
  UserControllerService,
  UserResponse,
  UpdateUsernameRequest,
  UpdatePasswordRequest,
  UpdatePresenceVisibilityRequest,
} from '../generated/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  userControllerService = inject(UserControllerService);

  getMe(): Observable<UserResponse> {
    return this.userControllerService.me();
  }

  updateProfileImage(profileImage: Blob): Observable<UserResponse> {
    return this.userControllerService.updateProfileImage(profileImage);
  }

  updateUsername(updateUsernameRequest: UpdateUsernameRequest): Observable<UserResponse> {
    return this.userControllerService.updateUsername(updateUsernameRequest);
  }

  updatePassword(updatePasswordRequest: UpdatePasswordRequest): Observable<UserResponse> {
    return this.userControllerService.updatePassword(updatePasswordRequest);
  }

  updatePresenceVisibility(
    updatePresenceVisibilityRequest: UpdatePresenceVisibilityRequest,
  ): Observable<UserResponse> {
    return this.userControllerService.updatePresenceVisibility(updatePresenceVisibilityRequest);
  }
}
