import {Component, ViewEncapsulation} from '@angular/core';
import {NgClass} from '@angular/common';
import {IMessage} from '../../models/message';
import {EStatus} from '../../models/status';

@Component({
  selector: 'app-chat-screen',
  imports: [
    NgClass
  ],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ChatScreenComponent {
  contactAvatar = "https://picsum.photos/200";
  contactName = "Test";
  contactLastSeen = "12.12.12";

  messages: IMessage[] = [
    {id: 1, message: "Hallo", time: "12:00", sentByMe: true, status: EStatus.SENT},
    {id: 2, message: "Hallo", time: "12:00", sentByMe: false, status: EStatus.RECEIVED},
    {id: 3, message: "Hallo", time: "12:00", sentByMe: true, status: EStatus.READ},
    {id: 4, message: "Hallo", time: "12:00", sentByMe: false, status: EStatus.SENT},
    {id: 5, message: "Hallo", time: "12:00", sentByMe: true, status: EStatus.RECEIVED},
  ];
  protected readonly EStatus = EStatus;
}
