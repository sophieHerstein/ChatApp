import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { BASE_PATH } from './generated/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/authentication.inceptor';
import { AuthenticationStoreService } from './services/authentication-store.service';
import { UserService } from './services/user.service';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppInitializer(() => {
      const authenticationStore = inject(AuthenticationStoreService);
      const userService = inject(UserService);

      if (!authenticationStore.accessToken()) {
        return Promise.resolve();
      }

      return firstValueFrom(
        userService.getMe().pipe(
          tap((user) => authenticationStore.updateCurrentUser(user)),
          catchError(() => {
            authenticationStore.logout();
            return of(null);
          }),
        ),
      );
    }),
    {
      provide: BASE_PATH,
      useValue: environment.apiBaseUrl,
    },
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
