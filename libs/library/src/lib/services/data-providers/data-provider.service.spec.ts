import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { DataProviderService } from './data-provider.service';

@Injectable()
class TestDataProvider extends DataProviderService<{ id: number; name: string }> {
  public loadModelMock: jest.Mock = jest.fn();
  public saveModelMock: jest.Mock = jest.fn();

  public getTitle(entity: { id: number; name: string }): string {
    return entity.name;
  }

  public saveModel(model: any): Observable<{ id: number; name: string }> {
    return this.saveModelMock(model);
  }

  protected loadModel(entityID?: number): Observable<{ id: number; name: string } | null> {
    return this.loadModelMock(entityID);
  }
}

describe('DataProviderService', () => {
  let service: TestDataProvider;
  let paramMapSubject: ReplaySubject<any>;

  function createParamMap(params: { [key: string]: string }): any {
    return {
      get: (name: string) => params[name] ?? null,
      has: (name: string) => name in params,
      getAll: (name: string) => params[name] ? [params[name]] : [],
      keys: Object.keys(params),
    };
  }

  beforeEach(() => {
    paramMapSubject = new ReplaySubject<any>(1);
    paramMapSubject.next(createParamMap({ id: '42' }));

    TestBed.configureTestingModule({
      providers: [
        TestDataProvider,
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
      ],
    });

    service = TestBed.inject(TestDataProvider);
    service.loadModelMock.mockReturnValue(of({ id: 42, name: 'Test Entity' }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('entityID', () => {
    it('should extract entity ID from route params', async () => {
      await new Promise<void>((resolve) => queueMicrotask(resolve));

      expect(service.entityID).toBe(42);
    });

    it('should report hasEntityID correctly', async () => {
      await new Promise<void>((resolve) => queueMicrotask(resolve));

      expect(service.hasEntityID).toBe(true);
    });
  });

  describe('getModel$', () => {
    it('should return an observable that emits the loaded model', async () => {
      await new Promise<void>((resolve) => queueMicrotask(resolve));

      let result: any = null;
      service.getModel$().subscribe((model: any) => { result = model; });

      expect(result).toEqual({ id: 42, name: 'Test Entity' });
    });

    it('should trigger loadModel if not yet loaded', () => {
      service.loadModelMock.mockReturnValue(of({ id: 1, name: 'Loaded' }));

      service.getModel$().subscribe();

      expect(service.loadModelMock).toHaveBeenCalled();
    });
  });

  describe('refreshModel', () => {
    it('should call loadModel with the current entityID', async () => {
      await new Promise<void>((resolve) => queueMicrotask(resolve));
      service.loadModelMock.mockClear();
      service.loadModelMock.mockReturnValue(of({ id: 42, name: 'Refreshed' }));

      service.refreshModel();

      expect(service.loadModelMock).toHaveBeenCalledWith(42);
    });

    it('should not load if already loading', async () => {
      const loadSubject: Subject<any> = new Subject();
      service.loadModelMock.mockReturnValue(loadSubject.asObservable());

      await new Promise<void>((resolve) => queueMicrotask(resolve));
      service.loadModelMock.mockClear();
      service.loadModelMock.mockReturnValue(loadSubject.asObservable());

      service.refreshModel();
      service.refreshModel();

      expect(service.loadModelMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateModel', () => {
    it('should emit the model via getModel$', () => {
      let result: any = null;
      service.getModel$().subscribe((model: any) => { result = model; });

      service.updateModel({ id: 99, name: 'Updated' });

      expect(result).toEqual({ id: 99, name: 'Updated' });
    });

    it('should update entityID if model has a different id', () => {
      service.updateModel({ id: 100, name: 'New ID' });

      expect(service.entityID).toBe(100);
    });

    it('should handle null model', () => {
      let result: any = 'not-null';
      service.getModel$().subscribe((model: any) => { result = model; });

      service.updateModel(null);

      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should emit error via getError$ when loadModel fails', async () => {
      await new Promise<void>((resolve) => queueMicrotask(resolve));
      service.loadModelMock.mockClear();

      const httpError: HttpErrorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      service.loadModelMock.mockReturnValue(throwError(() => httpError));

      let emittedError: HttpErrorResponse | null = null;
      service.getError$().subscribe((error: HttpErrorResponse) => { emittedError = error; });

      service.refreshModel();

      expect(emittedError).toBe(httpError);
    });

    it('should emit null to model cache when loadModel fails', async () => {
      await new Promise<void>((resolve) => queueMicrotask(resolve));
      service.loadModelMock.mockClear();

      const httpError: HttpErrorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      service.loadModelMock.mockReturnValue(throwError(() => httpError));

      let result: any = 'not-null';
      service.getModel$().subscribe((model: any) => { result = model; });

      service.refreshModel();

      expect(result).toBeNull();
    });

    it('should reset loading state when loadModel fails', async () => {
      await new Promise<void>((resolve) => queueMicrotask(resolve));
      service.loadModelMock.mockClear();

      const httpError: HttpErrorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      service.loadModelMock.mockReturnValue(throwError(() => httpError));

      service.refreshModel();

      // Should be able to refresh again (not stuck in loading)
      service.loadModelMock.mockReturnValue(of({ id: 42, name: 'Recovered' }));
      service.refreshModel();

      expect(service.loadModelMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      let completed: boolean = false;
      (service as any).destroy$.subscribe({ complete: () => { completed = true; } });

      service.ngOnDestroy();

      expect(completed).toBe(true);
    });
  });
});
