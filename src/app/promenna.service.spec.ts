import { TestBed, inject } from '@angular/core/testing';

import { PromennaService } from './promenna.service';

describe('PromennaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PromennaService]
    });
  });

  it('should be created', inject([PromennaService], (service: PromennaService) => {
    expect(service).toBeTruthy();
  }));
});
