import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormService, IModal } from '@library';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { ModalBase } from './modal-base';

@Component({ template: '' })
export abstract class ViewModal<TEntityModel> extends ModalBase implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('modal') protected modalComponent!: IModal;
  //#endregion

  //#region Variables
  protected dataForm!: FormGroup;
  protected data$: Observable<TEntityModel | null>;
  private entityIdSubject: Subject<number | undefined> = new Subject<number | undefined>();
  protected formBuilder: FormBuilder;
  protected formService: FormService;
  protected selectionCount: number = 0;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.formBuilder = inject(FormBuilder);
    this.formService = inject(FormService);

    this.data$ = this.entityIdSubject
      .pipe(switchMap((entityID: number | undefined) => this.loadData(entityID)));
  }

  public ngOnInit(): void {
    this.dataForm = this.formSetup();
    this.formService.initializeForm(this.dataForm);

    this.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: TEntityModel | null) => {
        this.formService.model = data;
        this.formService.loading = false;
        this.dataForm.patchValue(<any>data);
      });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public toggle(entityID?: number): void {
    this.formService.model = null;
    this.formService.loading = true;
    this.dataForm.reset();

    if (!this.modalComponent.isShown) {
      this.entityIdSubject.next(entityID);
    } else {
      this.formService.resetForm();
    }
    this.modalComponent.toggleModal();
  }
  //#endregion

  //#region Private methods
  protected abstract formSetup(): FormGroup;

  protected abstract loadData(entityID?: number): Observable<TEntityModel | null>;
  //#endregion
}