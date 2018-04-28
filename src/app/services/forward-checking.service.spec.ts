import { TestBed, inject } from '@angular/core/testing';

import { ForwardCheckingService } from './forward-checking.service';

describe('ForwardCheckingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ForwardCheckingService]
    });
  });

  it('should be created', inject([ForwardCheckingService], (service: ForwardCheckingService) => {
    expect(service).toBeTruthy();
  }));
});
