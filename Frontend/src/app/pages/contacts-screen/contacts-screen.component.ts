import {Component, ViewEncapsulation} from '@angular/core';
import {NgClass} from '@angular/common';
import {IContact} from '../../models/contact';
import { RouterLink} from '@angular/router';
import {EAppPaths} from '../../app.paths';

@Component({
  selector: 'app-contacts',
  imports: [
    NgClass,
    RouterLink
  ],
  templateUrl: './contacts-screen.component.html',
  styleUrl: './contacts-screen.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ContactsScreenComponent {

  contacts: IContact[] = [
    {id: 1, name: "Max", lastMessage: "Hallo", messageUnread: true, avatar: "https://picsum.photos/200", lastMessageTime: "12:00"},
    {id: 2, name: "Anna", lastMessage: "Hallo", messageUnread: false, avatar: "https://picsum.photos/200", lastMessageTime: "12:00"},
    {id: 3, name: "Peter", lastMessage: "Hallo", messageUnread: true, avatar: "https://picsum.photos/200", lastMessageTime: "12:00"},
    {id: 4, name: "Maria", lastMessage: "Hallo", messageUnread: false, avatar: "https://picsum.photos/200", lastMessageTime: "12:00"},
    {id: 5, name: "John", lastMessage: "Hallo", messageUnread: true, avatar: "https://picsum.photos/200", lastMessageTime: "12:00"},
  ]
  protected readonly EAppPaths = EAppPaths;
}
