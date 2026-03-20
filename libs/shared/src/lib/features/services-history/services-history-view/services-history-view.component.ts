import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewBase } from '@framework';
import { DataProviderService } from '@library';
import { take } from 'rxjs';
import { OperationsHistoryChildListComponent } from '../../operations-history';
import { ServicesHistoryChildListComponent } from '../services-history-child-list/services-history-child-list.component';

@Component({
  selector: 'shared-services-history-view',
  templateUrl: './services-history-view.component.html',
  styleUrls: ['./services-history-view.component.scss'],
  imports: [
    OperationsHistoryChildListComponent,
    ServicesHistoryChildListComponent,
  ]
})
export class ServicesHistoryViewComponent extends ViewBase {
  //#region ViewChilds, Inputs, Outputs
  @Input({ required: true }) public controllerName!: string;

  @Input() public entityID?: number;
  //#endregion

  //#region Variables
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dataProviderService: DataProviderService<any> | null = inject(DataProviderService, { optional: true });
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    if (this.activatedRoute.snapshot.data['controllerName']) {
      this.controllerName = this.activatedRoute.snapshot.data['controllerName'];
    }

    if (this.dataProviderService) {
      this.dataProviderService.getModel$()
        .pipe(take(1))
        .subscribe((model: any) => {
          this.entityID = model.id;
        });
    }
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}