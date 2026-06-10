import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {BASE_PATH} from './generated/api';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/authentication.inceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes),{
    provide: BASE_PATH,
    useValue: 'http://localhost:8080',
  },provideHttpClient(withInterceptors([authInterceptor]))],
};
