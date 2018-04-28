import { TestBed, inject } from '@angular/core/testing';

import { BacktrackingService } from './backtracking.service';

describe('BacktrackingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BacktrackingService]
    });
  });

  it('should be created', inject([BacktrackingService], (service: BacktrackingService) => {
    expect(service).toBeTruthy();
  }));
});
