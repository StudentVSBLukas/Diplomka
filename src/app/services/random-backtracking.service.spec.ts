import { TestBed, inject } from '@angular/core/testing';

import { RandomBacktrackingService } from './random-backtracking.service';

describe('RandomBacktrackingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RandomBacktrackingService]
    });
  });

  it('should be created', inject([RandomBacktrackingService], (service: RandomBacktrackingService) => {
    expect(service).toBeTruthy();
  }));
});
