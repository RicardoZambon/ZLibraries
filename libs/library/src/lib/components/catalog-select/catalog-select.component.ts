import { FlexibleConnectedPositionStrategy, Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { AfterViewInit, Component, DoCheck, ElementRef, HostListener, Input, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, OnInit, Optional, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { catchError, debounceTime, Observable, of, pairwise, startWith, Subject, switchMap, take, takeUntil } from 'rxjs';
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
  ]
})
export class CatalogSelectComponent extends BaseComponent implements AfterViewInit, DoCheck, OnInit {
  //#region HostListeners
  @HostListener('body:mousedown', ['$event'])
  private bodyMouseDown(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    if (this.showDropDown && !target.closest('.catalog-container.show')) {
      this.clickedOutside = (event.button === 0 && !target.closest('.dropdown-container')) ?? false;
    }
  }

  @HostListener('body:mouseup', ['$event'])
  private bodyMouseUp(event: MouseEvent): void {
    if (this.showDropDown && this.clickedOutside) {
      this.closeDropdownOverlay();
      this.clickedOutside = false;
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
  @Input() public entriesList?: any[] | { key: number; value: Observable<any> }[] | null;
  @Input() public set filters(value: { [id: string]: any; }) {
    this._filters = value;
    if (this.initialized) {
      // this.initializeEntries();
    }
  }
  @Input() public label!: string;
  @Input() public maxEntries: number = 100;
  @Input() public minimumLengthSearch: number = 3;
  @Input() public notes: string = '';
  @Input() public readOnly: boolean = false;
  public get searchEndpoint(): string | undefined { return this._searchEndpoint; }
  @Input() public set searchEndpoint(value: string | undefined) {
    this._searchEndpoint = value;
    if (this.initialized) {
      this.initializeEntries();
    }
  }
  @Input() public validations: { [id: string]: string; } = {};
  @Input() public valueProperty: string = 'value';
  //#endregion
  
  //#region Variables
  private _filters: { [id: string]: any; } = {};
  private _searchEndpoint?: string;
  private apiSubject: Subject<{endpoint: string, maxEntries: number, criteria: string | null, filters: { [id: string]: any; }}> = new Subject<{endpoint: string, maxEntries: number, criteria: string | null, filters: { [id: string]: any; }}>();
  private clickedOutside: boolean = false;
  protected entries: ICatalogEntry[] = [];
  private filterDiffer?: KeyValueDiffer<string, any>;
  protected focused: boolean = false;
  private initialized: boolean = false;
  private isRequestInProgress: boolean = false;
  private lastCriteria: string | null = null;
  protected loading: boolean = false;
  protected maxHeight: number = 0;
  private overlayRef?: OverlayRef;
  private results: ICatalogEntry[] = [];
  protected right: boolean = false;
  protected selectedValue: any;
  protected showDropDown: boolean = false;
  protected showMessage: boolean = false;
  protected useCriteria: boolean = false;
  //#endregion

  //#region Properties
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

    this.apiSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$),
        switchMap(({ endpoint, maxEntries, criteria, filters }: {endpoint: string, maxEntries: number, criteria: string | null, filters: { [id: string]: any; }}): Observable<ICatalogResult | null> => {
          if (this.isRequestInProgress) {
            return of(null);
          }

          this.isRequestInProgress = true;
          this.lastCriteria = criteria;

          return this.catalogService.search(endpoint, maxEntries, criteria ?? '', filters)
            .pipe(
              take(1),
              catchError((_: any) => {
                this.loading = false;
                this.isRequestInProgress = false;
                return of(null);
              })
            );
        })
      ).subscribe({
        next: (results: ICatalogResult | null) => {
          if (!!results) {
            this.loading = false;
            this.isRequestInProgress = false;
            this.updateResults(results);
          }
        },
        error: (_: any) => {
          this.loading = false;
          this.isRequestInProgress = false;
        }
      });
  }

  public ngAfterViewInit(): void {
    let parent: HTMLElement | null | undefined = this.inputElement?.nativeElement?.parentElement;
    while (parent) {
      const style: CSSStyleDeclaration = getComputedStyle(parent);
      const overflowY: string = style.overflowY;
      const isScroll: boolean = overflowY === 'auto' || overflowY === 'scroll';

      if (isScroll && parent.scrollHeight > parent.clientHeight) {
        parent.addEventListener('scroll', () => {
          if (this.overlayRef) {
            // this.overlayRef.updatePosition();
            this.closeDropdownOverlay();
          }
        });
      }

      parent = parent.parentElement;
    }
  }

  public ngDoCheck(): void {
    if (!this.initialized) {
      return;
    }

    if (!!this.filterDiffer) {
      const changes: KeyValueChanges<string ,any> | null = this.filterDiffer.diff(this._filters);
      if (!!changes) {
        this.initializeEntries();
      }
    }
  }

  public ngOnInit(): void {
    this.filterDiffer = this.keyValueDiffers.find(this._filters).create();

    if (this.useCriteria) {
      this.showMessage = true;
    }

    const disabled: boolean = this.formGroup.form.disabled;

    this.addDisplayControl();

    if (disabled) {
      this.formGroup.form.disable();
    }

    this.formControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: any) => {
        if (this.selectedValue !== value) {
          this.selectedValue = value;
          
          if (!!this.entriesList && !this.focused) {
            const display: string = this.entries.filter((entry: ICatalogEntry) => entry.value === value)[0]?.display ?? '';
            this.displayControl?.setValue(display, { emitEvent: false });
          } else if (!value) {
            this.displayControl?.reset(null, { emitEvent: false });
            if (!!this.results) {
              this.initializeEntries();
            }
          }
        }

        this.syncFormControlsEnabledDisabled();
      });

    this.displayControl?.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$),
        startWith(null),
        pairwise(),
      )
      .subscribe(([ previous, current ]: string[]) => {
        if (previous !== current && this.focused) {
          this.showMessage = false;
          if (!this.useCriteria) {
            if (this.readOnly || previous === undefined) {
              this.entries = this.results;
            } else {
              this.searchResults(current);
            }
          } else if ((current?.length ?? 0) >= this.minimumLengthSearch) {
            if (!this.showDropDown) {
              this.showDropDown = true;
              this.right = false;
            }
            this.searchAPI(current);
          } else {
            this.formControl?.reset();
            this.showMessage = true;
          }
        }
      });

    this.selectedValue = this.formControl?.value;
    this.initializeEntries();
    this.syncFormControlsEnabledDisabled();

    this.initialized = true;
  }
  //#endregion

  //#region Event handlers
  protected onBlur(): void {
    this.focused = false;
  }

  protected onClick(): void {
    if ((!this.showDropDown || this.readOnly)
      && (this.formGroup.form?.enabled ?? false)
      && (this.formGroup.form?.get(this.formControlName)?.enabled ?? false)
    ) {
      this.maxHeight = this.inputElement?.nativeElement?.getBoundingClientRect()?.height ?? 0;

      this.showDropDown = !this.showDropDown;
      this.right = false;

      if (this.showDropDown) {
        if (this.results.length > 0) {
          this.entries = this.tryFilterFromDataset(this.results);
        }
        this.openDropdownOverlay();
      }
    }
  }

  protected onFocus(): void {
    this.focused = true;
  }

  protected selectItem(entry: ICatalogEntry): void {
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

    if (!this.entriesList && !this.useCriteria) {
      this.entries = this.results;
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  private addDisplayControl(): void {
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
    this.showDropDown = false;
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }

  private initializeEntries(): void {
    if (!!this.entriesList) {
      this.searchList();
    } else {
      this.searchAPI(null);
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

  private searchAPI(criteria: string | null): void {
    if (this.searchEndpoint) {
      if (!this.loading) {
        if (this.entries) {
          this.entries = [];
        }

        if (this.useCriteria) {
          this.showMessage = false;
        }
      }

      this.loading = true;
      this.apiSubject.next({ endpoint: this.searchEndpoint, maxEntries: this.maxEntries, criteria: criteria, filters: this._filters });
    }
  }

  private searchList(): void {
    if (!!this.entriesList) {
      this.loading = true;
      this.entries = [];

      this.entriesList.forEach((entry: any | { key: number, value: Observable<any> }) => {
        const value: number = entry[this.valueProperty];
        const display: string | Observable<any> = entry[this.displayProperty];

        if (display instanceof Observable) {
          this.entries.push({ value: value, display: 'Loading...' });
          
          display
            .pipe(takeUntil(this.destroy$))
            .subscribe(v => {
              this.entries.filter(x => x.value === value)[0].display = v;

              if (this.selectedValue === value) {
                this.displayControl.setValue(v);
              }
            });
        } else {
          this.entries.push({ value, display });
        }
      });
      this.loading = false;
    }
  }

  private searchResults(criteria?: string): void {
    this.entries = this.results
      .filter((result: ICatalogEntry) => result.display.toLowerCase().indexOf((criteria ?? '').toLowerCase()) > -1);
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

  private updateResults(results: ICatalogResult): void {
    this.results = this.tryFilterFromDataset(results.entries);
    if (!results.shouldUseCriteria) {
      this.entries = this.results;
    }

    if (this.lastCriteria === null) {
      this.useCriteria = results.shouldUseCriteria;
      
      if (!this.useCriteria) {
        const currentSelection: ICatalogEntry[] = this.results.filter((result: ICatalogEntry) => result.value === this.formControl.value);
        
        if (currentSelection.length > 0) {
          const display: string = currentSelection.length === 0 ? '' : currentSelection[0].display;
          this.displayControl.setValue(display, { emitEvent: false });
        } else {
          // console.log('this.formControl.setValue(null)')
          // this.formControl.setValue(null);
          // this.displayControl.setValue(null);
        }
      } else {
        this.showMessage = true;
      }
    }
  }
  //#endregion
}