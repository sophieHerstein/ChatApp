import { Component, Input, signal, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgOptimizedImage } from '@angular/common';
import { EAppPaths } from '../../app.paths';
import {
  bootstrapHouseFill,
  bootstrapPersonFillGear,
  bootstrapPersonFillX,
  bootstrapSearch,
} from '@ng-icons/bootstrap-icons';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationStoreService } from '../../services/authentication-store.service';

@Component({
  selector: 'app-header',
  imports: [FormsModule, NgIcon, NgOptimizedImage, RouterLink],
  viewProviders: [
    provideIcons({
      bootstrapPersonFillGear,
      bootstrapPersonFillX,
      bootstrapSearch,
      bootstrapHouseFill,
    }),
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  authenticationStoreService = inject(AuthenticationStoreService);
  router = inject(Router);

  @Input() showContacts = true;

  profileImage = signal('');
  username = signal('');
  suche = '';

  protected readonly EAppPaths = EAppPaths;

  ngOnInit(): void {
    this.profileImage.set(this.authenticationStoreService.profileImageSrc());
    this.username.set(this.authenticationStoreService.username());
  }

  logout() {
    this.authenticationStoreService.logout();
    this.router.navigate(['/login']);
  }
}
