import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';

describe(SidebarComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<SidebarComponent> = TestBed.createComponent(SidebarComponent);
    const component: SidebarComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});