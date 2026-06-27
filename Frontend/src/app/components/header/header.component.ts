import {
  Component,
  Input,
  signal,
  ViewEncapsulation,
  OnInit,
  inject,
  Output,
  EventEmitter,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgOptimizedImage } from '@angular/common';
import { EAppPaths } from '../../app.paths';
import {
  bootstrapHouseFill,
  bootstrapPeopleFill,
  bootstrapPersonFillGear,
  bootstrapPersonFillX,
  bootstrapSearch,
  bootstrapX,
} from '@ng-icons/bootstrap-icons';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationStoreService } from '../../services/authentication-store.service';

@Component({
  selector: 'app-header',
  imports: [FormsModule, NgIcon, NgOptimizedImage, RouterLink, ReactiveFormsModule],
  viewProviders: [
    provideIcons({
      bootstrapPersonFillGear,
      bootstrapPersonFillX,
      bootstrapSearch,
      bootstrapHouseFill,
      bootstrapPeopleFill,
      bootstrapX,
    }),
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  authenticationStoreService = inject(AuthenticationStoreService);
  router = inject(Router);
  private destroyRef = inject(DestroyRef);

  @Output() searching = new EventEmitter<string | null>();
  @Output() isSearchingOutput = new EventEmitter<boolean>();

  @Input() showChats = true;
  @Input() showContacts = true;
  @Input() showSearch = false;

  @Input() isSearching = false;
  searchWord = new FormControl('');

  profileImage = signal('');
  username = signal('');

  protected readonly EAppPaths = EAppPaths;

  ngOnInit(): void {
    this.profileImage.set(this.authenticationStoreService.profileImageSrc());
    this.username.set(this.authenticationStoreService.username());
    this.searchWord.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string | null) => {
        this.searching.emit(value);
      });
  }

  quitSearch() {
    this.searchWord.setValue('', { emitEvent: true });
    this.isSearching = false;
    this.isSearchingOutput.emit(false);
  }

  logout() {
    this.authenticationStoreService.logout();
    this.router.navigate(['/login']);
  }
}
