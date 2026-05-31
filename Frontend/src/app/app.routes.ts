import { Routes } from '@angular/router';
import { EAppPaths } from './app.paths';

export const routes: Routes = [
  {
    path: '',
    redirectTo: EAppPaths.Login,
    pathMatch: 'full',
  },
  {
    path: EAppPaths.Login,
    loadComponent: () =>
      import('./pages/login-screen/login-screen.component').then((m) => m.LoginScreenComponent),
  },
  {
    path: EAppPaths.Register,
    loadComponent: () =>
      import('./pages/registration-screen/registration-screen.component').then(
        (m) => m.RegistrationScreenComponent,
      ),
  },
  {
    path: EAppPaths.Contacts,
    loadComponent: () =>
      import('./pages/contacts-screen/contacts-screen.component').then(
        (m) => m.ContactsScreenComponent,
      ),
  },
  {
    path: `${EAppPaths.Chat}/:id`,
    loadComponent: () =>
      import('./pages/chat-screen/chat-screen.component').then((m) => m.ChatScreenComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
