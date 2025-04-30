import { NgIf } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ITabView, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { Tab } from '../../../../models';
import { AuthService, TabService } from '../../../../services';
import { BaseButton } from '../../base-button';

@Component({
  selector: 'framework-button-new-legacy',
  templateUrl: './button-new.component.html',
  imports: [
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonNewLegacyComponent)}]
})
export class ButtonNewLegacyComponent extends BaseButton {
  @Input() path!: string;
  @Input() endpoint: string = 'new';
  @Input() tabView!: ITabView;


  constructor(authService: AuthService, private tabService: TabService) {
    super(authService);
  }
  
  clicked(): void {
    this.tabService.navigateTo(new Tab({ url: `${this.path}/${this.endpoint}` }));
    // this.tabService.navigateTab(this.tabView, `${this.path}/${this.endpoint}`);
  }
}