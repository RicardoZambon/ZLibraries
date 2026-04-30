import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';
import { ICatalogResult } from '../models/catalog-result';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CatalogService],
    });

    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('search', () => {
    const endpoint: string = '/api/catalogs/search';
    const mockResult: ICatalogResult = {
      entries: [{ id: 1, description: 'Test' } as any],
      shouldUseCriteria: true,
    };

    it('should POST to the given endpoint with maxResults and criteria', () => {
      service.search(endpoint, 10, 'test').subscribe((result: ICatalogResult) => {
        expect(result).toEqual(mockResult);
      });

      const req = httpMock.expectOne(endpoint);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ maxResults: 10, criteria: 'test', filters: null });
      req.flush(mockResult);
    });

    it('should send undefined criteria when not provided', () => {
      service.search(endpoint, 5).subscribe();

      const req = httpMock.expectOne(endpoint);
      expect(req.request.body).toEqual({ maxResults: 5, criteria: undefined, filters: null });
      req.flush(mockResult);
    });

    it('should send filters when provided', () => {
      const filters: { [key: string]: string } = { type: 'active' };

      service.search(endpoint, 10, 'query', filters).subscribe();

      const req = httpMock.expectOne(endpoint);
      expect(req.request.body).toEqual({ maxResults: 10, criteria: 'query', filters });
      req.flush(mockResult);
    });

    it('should propagate HTTP errors', () => {
      let errorOccurred: boolean = false;

      service.search(endpoint, 10).subscribe({
        error: () => { errorOccurred = true; },
      });

      const req = httpMock.expectOne(endpoint);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorOccurred).toBe(true);
    });
  });
});
