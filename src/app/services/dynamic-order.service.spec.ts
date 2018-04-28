import { TestBed, inject } from '@angular/core/testing';

import { DynamicOrderService } from './dynamic-order.service';

describe('DynamicOrderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DynamicOrderService]
    });
  });

  it('should be created', inject([DynamicOrderService], (service: DynamicOrderService) => {
    expect(service).toBeTruthy();
  }));
});
