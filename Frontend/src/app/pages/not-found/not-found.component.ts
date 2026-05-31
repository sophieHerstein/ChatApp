import { Component, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EAppPaths } from '../../app.paths';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class NotFoundComponent {
  protected readonly EAppPaths = EAppPaths;
}
