import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Groups related form fields under an optional heading. Project the fields as content.
 */
@Component({
  selector: 'lib-form-group',
  templateUrl: './form-group.component.html',
  styleUrls: ['./form-group.component.scss'],
  imports: [TranslatePipe],
  host: {
    '[class.expand]': 'shouldExpand',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGroupComponent {
  //#region ViewChilds, Inputs, Outputs
  /** Adds the `expand` class to the host so the group grows to fill the available space. Defaults to `false`. */
  @Input() public shouldExpand = false;
  /** Heading shown above the fields, as a translation key. No heading is shown when empty. */
  @Input() public label!: string;
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected get hasTitle(): boolean {
    return !!this.label;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
