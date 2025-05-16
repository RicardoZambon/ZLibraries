import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarItemComponent } from './sidebar-item.component';

describe(SidebarItemComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarItemComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<SidebarItemComponent> = TestBed.createComponent(SidebarItemComponent);
    const component: SidebarItemComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});