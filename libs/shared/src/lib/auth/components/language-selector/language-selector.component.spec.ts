import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from './language-selector.component';

describe(LanguageSelectorComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ LanguageSelectorComponent, TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<LanguageSelectorComponent> = TestBed.createComponent(LanguageSelectorComponent);
    const component: LanguageSelectorComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});