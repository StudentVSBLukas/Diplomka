import { TestBed, inject } from '@angular/core/testing';

import { IconsistencyService } from './iconsistency.service';

describe('IconsistencyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IconsistencyService]
    });
  });

  it('should be created', inject([IconsistencyService], (service: IconsistencyService) => {
    expect(service).toBeTruthy();
  }));
});
