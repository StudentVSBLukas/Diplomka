import { TestBed, inject } from '@angular/core/testing';

import { BackjumpingService } from './backjumping.service';

describe('BackjumpingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackjumpingService]
    });
  });

  it('should be created', inject([BackjumpingService], (service: BackjumpingService) => {
    expect(service).toBeTruthy();
  }));
});
