import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EAppPaths } from '../../app.paths';

@Component({
  selector: 'app-login-screen',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-screen.component.html',
  styleUrl: './login-screen.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoginScreenComponent {
  username = '';
  password = '';
  protected readonly EAppPaths = EAppPaths;
}
