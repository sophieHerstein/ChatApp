import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthenticationStoreService } from '../services/authentication-store.service';
import { EAppPaths } from '../app.paths';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthenticationStoreService);
  const router = inject(Router);

  const token = authStore.accessToken();

  const authReq = token
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authStore.logout();
        router.navigate(['/', EAppPaths.Login]);
      }

      return throwError(() => error);
    }),
  );
};
