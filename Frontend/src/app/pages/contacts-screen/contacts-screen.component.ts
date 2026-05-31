import { Component, ViewEncapsulation } from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { IContact } from '../../models/contact';
import { RouterLink } from '@angular/router';
import { EAppPaths } from '../../app.paths';

@Component({
  selector: 'app-contacts-screen',
  imports: [NgClass, RouterLink, NgOptimizedImage],
  templateUrl: './contacts-screen.component.html',
  styleUrl: './contacts-screen.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ContactsScreenComponent {
  contacts: IContact[] = [
    {
      id: 1,
      name: 'Max',
      lastMessage: 'Hallo',
      messageUnread: true,
      image: 'https://picsum.photos/200',
      lastMessageTime: '12:00',
    },
    {
      id: 2,
      name: 'Anna',
      lastMessage: 'Hallo',
      messageUnread: false,
      image: 'https://picsum.photos/200',
      lastMessageTime: '12:00',
    },
    {
      id: 3,
      name: 'Peter',
      lastMessage: 'Hallo',
      messageUnread: true,
      image: 'https://picsum.photos/200',
      lastMessageTime: '12:00',
    },
    {
      id: 4,
      name: 'Maria',
      lastMessage: 'Hallo',
      messageUnread: false,
      image: 'https://picsum.photos/200',
      lastMessageTime: '12:00',
    },
    {
      id: 5,
      name: 'John',
      lastMessage: 'Hallo',
      messageUnread: true,
      image: 'https://picsum.photos/200',
      lastMessageTime: '12:00',
    },
  ];
  protected readonly EAppPaths = EAppPaths;
}
