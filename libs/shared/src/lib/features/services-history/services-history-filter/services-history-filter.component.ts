import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonFiltersComponent } from '@zambon-dev/framework';
import { CatalogSelectComponent, FormGroupComponent, FormInputGroupComponent } from '@zambon-dev/library';
import { takeUntil } from 'rxjs';
import { FiltersBase } from '../../../components';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'shared-services-history-filter',
  templateUrl: './services-history-filter.component.html',
  styleUrls: ['./services-history-filter.component.scss'],
  imports: [
    ButtonFiltersComponent,
    CatalogSelectComponent,
    FormGroupComponent,
    FormInputGroupComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ServicesHistoryFilterComponent extends FiltersBase implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  /**
   * Catalog that resolves the people who can appear as the author of a change.
   *
   * There is no such catalog in this library -- who a user is belongs to the application -- so the
   * author filter is offered only when one is supplied.
   */
  @Input() public usersCatalogEndpoint?: string;
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected get hasUsersCatalog(): boolean {
    return !!this.usersCatalogEndpoint;
  }

  private get changedOnFromControl(): FormControl {
    return <FormControl>this.filterForm.get('changedOnFrom');
  }

  private get changedOnToControl(): FormControl {
    return <FormControl>this.filterForm.get('changedOnTo');
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  public override ngOnInit(): void {
    super.ngOnInit();

    // A range that reads backwards returns nothing and explains nothing, so the bound that did not
    // just change follows the one that did, rather than leaving the person to spot it.
    this.changedOnFromControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((from: string | null) => {
      const to: string | null = this.changedOnToControl.value;
      if (!!from && !!to && to < from) {
        this.changedOnToControl.setValue(from);
      }
    });

    this.changedOnToControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((to: string | null) => {
      const from: string | null = this.changedOnFromControl.value;
      if (!!from && !!to && to < from) {
        this.changedOnFromControl.setValue(to);
      }
    });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  /**
   * The control names are the filter names the backend reads, case insensitively: `name`,
   * `changedByID`, `changedOnFrom`, `changedOnTo` and `onlyCurrentEntity` reach `AuditFilters` in
   * ZWebAPI. The two dates are sent as picked and turned into UTC instants by
   * {@link ServicesHistoryDataset}, which is the boundary where the request is built.
   */
  protected override formSetup(): FormGroup<any> {
    return this.formBuilder.group({
      changedByID: [null],
      changedOnFrom: [null],
      changedOnTo: [null],
      name: [null],
      onlyCurrentEntity: [false, { nonNullable: true }],
    });
  }
  //#endregion
}
