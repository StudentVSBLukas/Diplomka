import { TestBed, inject } from '@angular/core/testing';

import { ArcConsistencyService } from './arc-consistency.service';

describe('ArcConsistencyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArcConsistencyService]
    });
  });

  it('should be created', inject([ArcConsistencyService], (service: ArcConsistencyService) => {
    expect(service).toBeTruthy();
  }));
});
