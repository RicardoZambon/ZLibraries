import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorModalComponent } from './error-modal.component';

describe(ErrorModalComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ErrorModalComponent, TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<ErrorModalComponent> = TestBed.createComponent(ErrorModalComponent);
    const component: ErrorModalComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});