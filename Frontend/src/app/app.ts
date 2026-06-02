import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapPersonFillGear,
  bootstrapPersonFillX,
  bootstrapSearch,
  bootstrapHouseFill,
} from '@ng-icons/bootstrap-icons';
import { EAppPaths } from './app.paths';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage, FormsModule, NgIcon, RouterLink],
  viewProviders: [
    provideIcons({
      bootstrapPersonFillGear,
      bootstrapPersonFillX,
      bootstrapSearch,
      bootstrapHouseFill,
    }),
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  profileImage = 'https://picsum.photos/200';
  suche = '';

  protected readonly EAppPaths = EAppPaths;

  logout() {
    console.log('Logout');
  }
}
