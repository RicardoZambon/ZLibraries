import { FlexibleConnectedPositionStrategy, Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, Input, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, OnInit, Optional, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, forkJoin, Observable, of, pairwise, startWith, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ICatalogEntry, ICatalogResult } from '../../models';
import { CatalogService, DataGridDataset } from '../../services';
import { BaseComponent } from '../base.component';
import { FormInputGroupComponent } from '../form-input-group/form-input-group.component';
import { FormInputComponent } from '../form-input/form-input.component';

@Component({
  selector: 'lib-catalog-select',
  templateUrl: './catalog-select.component.html',
  styleUrls: ['./catalog-select.component.scss'],
  imports: [
    FormInputComponent,
    FormInputGroupComponent,
    NgFor,
    NgIf,
    NgStyle,
    TranslatePipe,
  ]
})
export class CatalogSelectComponent extends BaseComponent implements OnInit {
  //#region HostListeners
  @HostListener('body:mousedown', ['$event'])
  private bodyMouseDown(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    if (this.isDropDownShown && !target.closest('.catalog-container.show')) {
      this.wasClickedOutside = (event.button === 0 && !target.closest('.dropdown-container')) ?? false;
    }
  }

  @HostListener('body:mouseup', ['$event'])
  private bodyMouseUp(event: MouseEvent): void {
    if (this.isDropDownShown && this.wasClickedOutside) {
      this.closeDropdownOverlay();
      this.wasClickedOutside = false;
    }
  }
  //#endregion

  //#region ViewChilds, Inputs, Outputs
  @ViewChild('dropdownTemplate', { read: TemplateRef }) private dropdownTemplate!: TemplateRef<any>;
  @ViewChild('input', { read: ElementRef }) private inputElement!: ElementRef<HTMLDivElement>;
  
  @Input() public autofocus: boolean = false;
  @Input() public controlName!: string;
  @Input() public displayControlName!: string;
  @Input() public displayProperty: string = 'display';
  @Input() public entriesList?: any[] | { key: number; value: Observable<any> | string }[] | null;
  @Input() public set filters(value: { [id: string]: any; }) {
    if (this._filters !== value) {
      this._filters = value;
      this.updateFilters();
    }
  }
  @Input() public label!: string;
  @Input() public maxEntries: number = 100;
  @Input() public minimumLengthSearch: number = 3;
  @Input() public notes: string = '';
  @Input() public readOnly: boolean = false;
  @Input() public searchEndpoint?: string;
  @Input() public validations: { [id: string]: string; } = {};
  @Input() public valueProperty: string = 'value';
  //#endregion
  
  //#region Variables
  protected displayedEntries: ICatalogEntry[] = [];
  protected isDropDownShown: boolean = false;
  protected isFocused: boolean = false;
  protected isLoading: boolean = false;
  protected maxHeight: number = 0;
  protected selectedValue: any;
  protected shouldUseCriteria: boolean = false;
  protected showFailureMessage: boolean = false;
  protected showMinimumCharactersMessage: boolean = false;
  protected showNoResultsMessage: boolean = false;
  
  private _filters: { [id: string]: any; } = {};
  private entriesDataSource: ICatalogEntry[] = [];
  private filterDiffer?: KeyValueDiffer<string, any>;
  private isDataInitialized: boolean = false;
  private isSubscriptionInitialized: boolean = false;
  private lastCriteriaUsed: string | null = null;
  private overlayRef?: OverlayRef;
  private searchSubject: Subject<string | null> = new Subject<string | null>();
  private wasClickedOutside: boolean = false;
  //#endregion

  //#region Properties
  public get filters(): { [id: string]: any; } | undefined {
    return this._filters;
  }

  protected get displayControl(): FormControl {
    return <FormControl>this.formGroup.form.get(this.formDisplayControlName);
  }

  protected get formControl(): FormControl {
    return <FormControl>this.formGroup.form.get(this.formControlName);
  }

  protected get formControlName(): string {
    return [
      ...this.formGroupName?.path ?? [],
      this.controlName
    ].join('.');
  }

  protected get formDisplayControlName(): string {
    return [
      ...this.formGroupName?.path ?? [],
      this.displayControlName
    ].join('.');
  }

  protected get isInvalid(): boolean {
    return this.formControl.invalid;
  }

  protected get isTouched(): boolean {
    return this.formControl.touched;
  }

  private get hasSearchEndpoint(): boolean {
    return !!this.searchEndpoint && this.searchEndpoint.length > 0;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    private catalogService: CatalogService,
    @Optional() private dataGridDataset: DataGridDataset,
    private readonly formGroup: FormGroupDirective,
    @Optional() private readonly formGroupName: FormGroupName,
    private keyValueDiffers: KeyValueDiffers,
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder,
    private viewContainerRef: ViewContainerRef,
  ) {
    super();
  }

  public ngOnInit(): void {
    // Check and add the display control, if it does not exist.
    const wasFormDisabled: boolean = this.formGroup.form.disabled;
    this.checkAndAddDisplayControl();
    if (wasFormDisabled) {
      this.formGroup.form.disable();
    }

    // Initialize the entries data source from the entries list, if provided.
    this.initializeEntriesDataSource();

    // Initialize the search functionality.
    this.initializeSearch();

    // Subscribe to changes in the display control to apply search criteria.
    this.displayControl?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.isLoading = true;
          this.resetMessages();
        }),
        debounceTime(500),
        startWith(null),
        pairwise(),
      )
      .subscribe(([ previous, current ]: string[]) => {
        if (!this.isFocused || previous === current) {
          this.isLoading = false;
          return;
        }
        this.applySearchCriteria(current);
      });

    this.filterDiffer = this.keyValueDiffers.find(this._filters).create();

    // Subscribe to changes in the form control to update the selected value and display control states.
    this.syncFormControlsEnabledDisabled();

    this.formControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: any) => {
        this.syncFormControlsEnabledDisabled();

        if (this.selectedValue === value) {
          return;
        }

        this.selectedValue = value;
        if (this.hasSearchEndpoint) {
          if (!value) {
            this.displayControl?.reset(null, { emitEvent: false });
          }
        } else {
          const display: string = this.entriesDataSource.filter((entry: ICatalogEntry) => entry.value === value)[0]?.display ?? '';
          this.displayControl?.setValue(display, { emitEvent: false });
        }
      });
  }
  //#endregion

  //#region Event handlers
  protected onContainerBlur(): void {
    this.isFocused = false;
  }

  protected onContainerClick(): void {
    if ((!this.isDropDownShown || this.readOnly)
      && (this.formGroup.form?.enabled ?? false)
      && (this.formGroup.form?.get(this.formControlName)?.enabled ?? false)
    ) {
      this.maxHeight = this.inputElement?.nativeElement?.getBoundingClientRect()?.height ?? 0;

      this.isDropDownShown = !this.isDropDownShown;
      if (this.isDropDownShown) {
        this.openDropdownOverlay();
      }
    }
  }

  protected onContainerFocus(): void {
    this.isFocused = true;
  }

  protected onDropDownErrorClick(): void {
    this.refreshSearch();
  }

  protected onDropDownItemClick(entry: ICatalogEntry): void {
    if (this.displayControl) {
      this.displayControl.markAsDirty();
      this.displayControl.markAllAsTouched();
      this.displayControl.setValue(entry.display, { emitEvent: false });
    }

    if (this.formControl) {
      this.formControl.markAsDirty();
      this.formControl.markAsTouched();
      this.formControl.setValue(entry.value);
    }

    this.closeDropdownOverlay();
  }

  protected onDropDownMessageClick(): void {
    this.closeDropdownOverlay();
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  private applySearchCriteria(criteria: string | null): void {
    this.isLoading = true;
    this.resetMessages();

    this.searchSubject.next(criteria);
  }

  private checkAndAddDisplayControl(): void {
    let parent: FormGroup = this.formGroup.form;
    const controlNames: string[] = this.formDisplayControlName.split('.');

    controlNames.forEach((name, index) => {
      if (index < controlNames.length - 1) {
        parent = <FormGroup>parent.get(name);
      } else {
        if (!parent.get(name)) {
          parent.addControl(name, new FormControl(''));
        }
      }
    });
  }

  private closeDropdownOverlay(): void {
    this.isDropDownShown = false;
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }

  private initializeEntriesDataSource(): void {
    if (this.hasSearchEndpoint || !this.entriesList || this.entriesList.length === 0) {
      return;
    }

    const observables: Observable<string>[] = [];

    this.entriesList.forEach((entry: any | { key: number, value: Observable<any> }) => {
      const value: number = entry[this.valueProperty];
      const display: string | Observable<any> = entry[this.displayProperty];

      if (display instanceof Observable) {
        this.entriesDataSource.push({ value: value, display: 'Loading...' });
        
        observables.push(display
          .pipe(
            take(1),
            tap(v => {
              this.entriesDataSource.filter(x => x.value === value)[0].display = v;
              if (this.selectedValue === value) {
                this.displayControl.setValue(v);
              }
            })
          )
        );
      } else {
        this.entriesDataSource.push({ value, display });
      }
    });

    forkJoin(observables)
      .pipe(take(1))
      .subscribe(() => {
      });
  }

  private initializeSearch(): void {
    this.searchSubject
      .pipe(
        takeUntil(this.destroy$),
        switchMap((criteria: string | null) => {
          this.lastCriteriaUsed = criteria;

          if (!this.hasSearchEndpoint) {
            if (this.entriesDataSource.length === 0) {
              return of(null).pipe(take(1));
            }
            return of(this.entriesDataSource.filter((entry: ICatalogEntry) => entry.display.toLowerCase().indexOf(criteria?.toLowerCase() ?? '') > -1)).pipe(take(1));
          }

          this.updateMinimumCharactersMessageVisibility(criteria ?? '');
          if (this.showMinimumCharactersMessage) {
            return of(null).pipe(take(1));
          }

          return this.catalogService.search(this.searchEndpoint!, this.maxEntries, criteria ?? '', this.filters)
            .pipe(take(1));
        }),
      ).subscribe({
        next: (result: ICatalogResult | any[] | null | undefined) => {
          this.isLoading = false;
          this.displayedEntries = [];

          if (Array.isArray(result) && result.length > 0) {
            this.displayedEntries = result;

          } else if (result?.entries && Array.isArray(result.entries)) {
            const catalogResult: ICatalogResult = result as ICatalogResult;
            if (!catalogResult) {
              return;
            }

            this.displayedEntries = catalogResult.entries;

            if (!this.isDataInitialized) {
              // The shouldUseCriteria is only set from the initialization.
              this.isDataInitialized = true;
              this.shouldUseCriteria = catalogResult.shouldUseCriteria ?? false;
              this.showMinimumCharactersMessage = this.displayedEntries.length === 0;
            }
          }

          // Try to filter out already loaded rows from the data grid dataset.
          if (this.displayedEntries.length > 0 && this.dataGridDataset) {
            this.tryFilterFromDataset(this.displayedEntries);
          }
          
          if (!this.showMinimumCharactersMessage && this.displayedEntries.length === 0) {
            this.showNoResultsMessage = true;
          }
        },
        error: (_: any) => {
          this.isLoading = false;
          this.displayedEntries = [];
          this.showFailureMessage = true;

          // Set a new subscription to allow retrying the search later.
          this.initializeSearch();
        }
      });

      if (!this.isSubscriptionInitialized) {
        this.isSubscriptionInitialized = true;
        this.applySearchCriteria(null);
      }
  }

  private openDropdownOverlay(): void {
    if (this.overlayRef) {
      return;
    }

    const positionStrategy: FlexibleConnectedPositionStrategy = this.positionBuilder
      .flexibleConnectedTo(this.inputElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        }
      ]);
    
    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    // Set overlay width to match input field
    const inputRect: DOMRect = this.inputElement.nativeElement.getBoundingClientRect();
    this.overlayRef.updateSize({ width: inputRect.width });

    this.overlayRef.backdropClick()
      .pipe(take(1))
      .subscribe(() => {
        this.closeDropdownOverlay();
      });

    const portal: TemplatePortal = new TemplatePortal(this.dropdownTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);
  }

  private refreshSearch(reInitialize: boolean = false): void {
    if (reInitialize) {
      this.isDataInitialized = false;
    }

    this.applySearchCriteria(this.lastCriteriaUsed);
  }

  private resetMessages(): void {
    this.showFailureMessage = false;
    this.showNoResultsMessage = false;
    this.showMinimumCharactersMessage = false;
  }

  private syncFormControlsEnabledDisabled(): void {
    if (this.formControl.enabled !== this.displayControl.enabled) {
      if (this.formControl.disabled) {
        this.displayControl.disable({ emitEvent: false });
      } else {
        this.displayControl.enable({ emitEvent: false });
      }
    }
  }

  private tryFilterFromDataset(results: ICatalogEntry[]): ICatalogEntry[] {
    if (this.dataGridDataset
      && this.controlName === this.dataGridDataset?.keyProperty
      && this.dataGridDataset.hasLoadedRows
    ) {
      // If the control name is matching the ID property of the data grid dataset, filter out the loaded rows to remove duplicated IDs.
      const loadedIDs: any[] = this.dataGridDataset.loadedKeys!.map((key: string) => this.dataGridDataset.getRowID(key));
      return results.filter((result: ICatalogEntry) => loadedIDs.indexOf(result.value) < 0);
    }
    return results;
  }

  private updateFilters(): void {
    if (!this.filterDiffer || !this.filters) {
      return;
    }

    const changes: KeyValueChanges<string ,any> | null = this.filterDiffer.diff(this.filters);
    if (changes) {
      const reInitialize: boolean = true;
      this.refreshSearch(reInitialize);
    }
  }

  private updateMinimumCharactersMessageVisibility(criteria: string): void {
    this.showMinimumCharactersMessage =
      this.shouldUseCriteria
      && this.minimumLengthSearch > 0
      && (criteria?.length ?? 0) < this.minimumLengthSearch;
  }
  //#endregion
}