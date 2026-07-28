import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ISidebarProfile, SIDEBAR_CONFIGS, SidebarConfigs, SidebarMenu } from '../../models';
import { SidebarService } from '../../services';
import { SidebarComponent } from './sidebar.component';

class MockSidebarService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ url }));
  }
  public getUserProfile(): ISidebarProfile | undefined {
    return undefined;
  }
  protected loadMenus(_parent: SidebarMenu | null): Observable<SidebarMenu[]> {
    return of([new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard' })]);
  }
}

@Component({
  imports: [SidebarComponent],
  template: `<lib-sidebar><button sidebar-action>Add</button></lib-sidebar>`,
})
class HostComponent {}

describe(SidebarComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarComponent, HostComponent, TranslateModule.forRoot()],
      providers: [
        { provide: SidebarService, useClass: MockSidebarService },
        { provide: SIDEBAR_CONFIGS, useValue: new SidebarConfigs() },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<SidebarComponent> = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
