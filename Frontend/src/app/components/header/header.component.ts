import {Component, Input, ViewEncapsulation} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgIcon, provideIcons} from "@ng-icons/core";
import {NgOptimizedImage} from "@angular/common";
import {EAppPaths} from "../../app.paths";
import {
  bootstrapHouseFill,
  bootstrapPersonFillGear,
  bootstrapPersonFillX,
  bootstrapSearch
} from '@ng-icons/bootstrap-icons';
import {Router, RouterLink} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {AuthenticationStoreService} from '../../services/authentication-store.service';

@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    NgIcon,
    NgOptimizedImage,
    RouterLink
  ],
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
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {

  @Input() showContacts = true;

  profileImage = 'https://picsum.photos/200';
  suche = '';

  protected readonly EAppPaths = EAppPaths;

  constructor(private authenticationStoreService: AuthenticationStoreService, private router: Router) {
  }
  logout() {
    this.authenticationStoreService.logout();
    this.router.navigate(['/login']);
  }
}
