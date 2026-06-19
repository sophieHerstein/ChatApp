import { inject, Injectable } from '@angular/core';
import {
  ContactControllerService,
  UserControllerService,
  UserSearchResponse,
} from '../generated/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  contactsControllerService = inject(ContactControllerService);
  userControllerService = inject(UserControllerService);

  getAllUsers(): Observable<UserSearchResponse[]> {
    return this.userControllerService.getUsers();
  }

  addContact(userId: string): Observable<void> {
    return this.contactsControllerService.addContact(userId);
  }

  removeContact(userId: string): Observable<void> {
    return this.contactsControllerService.removeContact(userId);
  }
}
