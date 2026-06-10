import {CanActivateFn, Router} from '@angular/router';
import {AuthenticationStoreService} from '../services/authentication-store.service';
import {inject} from '@angular/core';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationStoreService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {

    return true;

  }

  return router.createUrlTree(['/login']);
};
