import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ContentStateKind = 'loading' | 'empty' | 'error';

@Component({
  selector: 'app-content-state',
  templateUrl: './content-state.component.html',
  styleUrl: './content-state.component.scss',
})
export class ContentStateComponent {
  @Input({ required: true }) kind: ContentStateKind = 'empty';
  @Input({ required: true }) title = '';
  @Input() message = '';
  @Input() actionLabel = '';

  @Output() action = new EventEmitter<void>();
}
