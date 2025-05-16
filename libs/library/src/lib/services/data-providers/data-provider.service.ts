import { inject, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, ReplaySubject, Subject, take, takeUntil } from 'rxjs';

@Injectable()
export abstract class DataProviderService<TEntityModel> implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private _entityID?: number;
  protected activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  private isLoading: boolean = false;
  private isModelLoaded: boolean = false;
  private modelCache: ReplaySubject<TEntityModel | null> = new ReplaySubject<TEntityModel | null>(1);
  protected shouldLazyLoad: boolean = false;
  //#endregion

  //#region Properties
  public get entityID(): number | undefined {
    return this._entityID
  }

  public get hasEntityID(): boolean {
    return !!this.entityID;
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor() {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((paramMap: ParamMap) => {
        const newID: number = Number(paramMap.get('id'));
        if (newID !== this.entityID) {
          this._entityID = newID;
          
          // Need to wait for the data-provider to be initialized.
          setTimeout(() => {
            // When lazy loading, the model should be loaded by the consuming component.
            if (!this.shouldLazyLoad) {
              this.refreshModel(); 
            }
          });
        }
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public abstract getTitle(entity: TEntityModel): string;
  
  public getModel$(): Observable<TEntityModel | null> {
    if (!this.isModelLoaded && !this.shouldLazyLoad) {
      this.refreshModel();
    }
    return this.modelCache.asObservable();
  }

  public refreshModel(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.loadModel(this.entityID)
      .pipe(take(1))
      .subscribe((model: TEntityModel | null) => {
        this.isLoading = false;
        this.updateModel(model);
      });
  }

  public abstract saveModel(model: any): Observable<TEntityModel>;

  public updateModel(model: any): void {
    this.isModelLoaded = true;
    this.modelCache.next(model);
  }
  //#endregion

  //#region Private methods
  protected abstract loadModel(entityID?: number): Observable<TEntityModel | null>;
  //#endregion
}