import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ITab, Tab, TabsComponent, TabService } from '@zambon-dev/framework';
import { ModalComponent, SidebarComponent, SidebarMenu, SidebarService } from '@zambon-dev/library';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../services';

@Component({
  selector: 'shared-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  imports: [
    ModalComponent,
    SidebarComponent,
    RouterModule,
    TabsComponent,
    TranslatePipe,
  ]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('logoutModal') private logoutModal!: ModalComponent;
  //#endregion

  //#region Variables
  private authenticationService: AuthenticationService = inject(AuthenticationService);
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private router: Router = inject(Router);
  private sidebarService: SidebarService = inject(SidebarService);
  private tabService: TabService = inject(TabService);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public ngOnInit(): void {
    const url: string = this.router.url;

    if (url !== '/' && !this.tabService.isUrlOpen(url)) {
      this.sidebarService.getMenuFromUrl(url)
        .pipe(take(1))
        .subscribe((item: SidebarMenu) => {
          if (!!item) {
            this.tabService.updateTabTitle(url, item.label);
          }
        });
    }

    this.sidebarService.menuUrlSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe((item: SidebarMenu) => {
        const tab: ITab = new Tab({
          title: item.label,
          url: item.url,
        });
        this.tabService.openTab(tab);
      });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public onLogoutClick(): void {
    this.logoutModal.toggleModal();
  }

  public onLogoutConfirm(): void {
    this.authenticationService.signOut();
    this.router.navigate(['/login']);
  }
  //#endregion

  //#region Private methods
  //#endregion
}