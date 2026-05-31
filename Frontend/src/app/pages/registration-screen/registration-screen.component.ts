import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EAppPaths } from '../../app.paths';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registration-screen',
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './registration-screen.component.html',
  styleUrl: './registration-screen.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RegistrationScreenComponent {
  username = '';
  password = '';
  protected readonly EAppPaths = EAppPaths;
}
