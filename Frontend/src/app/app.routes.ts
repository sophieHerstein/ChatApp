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
    title: 'Login',
    loadComponent: () =>
      import('./pages/login-screen/login-screen.component').then((m) => m.LoginScreenComponent),
  },
  {
    path: EAppPaths.Register,
    title: 'Registrieren',
    loadComponent: () =>
      import('./pages/registration-screen/registration-screen.component').then(
        (m) => m.RegistrationScreenComponent,
      ),
  },
  {
    path: EAppPaths.Contacts,
    title: 'Kontakte',
    loadComponent: () =>
      import('./pages/contacts-screen/contacts-screen.component').then(
        (m) => m.ContactsScreenComponent,
      ),
  },
  {
    path: EAppPaths.Settings,
    title: 'Einstellungen',
    loadComponent: () =>
      import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: `${EAppPaths.Chat}/:id`,
    title: 'Chat',
    loadComponent: () =>
      import('./pages/chat-screen/chat-screen.component').then((m) => m.ChatScreenComponent),
  },
  {
    path: `${EAppPaths.NotFound}`,
    title: 'Seite nicht gefunden',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: EAppPaths.NotFound,
    pathMatch: 'full',
  },
];
