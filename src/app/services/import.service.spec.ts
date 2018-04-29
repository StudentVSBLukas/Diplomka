import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ImportService } from './import.service';

describe('ImportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [ImportService]
    });
  });

  it('should be created', inject([ImportService], (service: ImportService) => {
    expect(service).toBeTruthy();
  }));
});
