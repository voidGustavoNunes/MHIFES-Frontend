import { TestBed } from '@angular/core/testing';
import { DataLoadingGuard } from './data.loading.guard';

describe('DataLoadingGuard', () => {
  let service: DataLoadingGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataLoadingGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});