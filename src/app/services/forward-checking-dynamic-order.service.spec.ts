import { TestBed, inject } from '@angular/core/testing';

import { ForwardCheckingDynamicOrderService } from './forward-checking-dynamic-order.service';

describe('ForwardCheckingDynamicOrderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ForwardCheckingDynamicOrderService]
    });
  });

  it('should be created', inject([ForwardCheckingDynamicOrderService], (service: ForwardCheckingDynamicOrderService) => {
    expect(service).toBeTruthy();
  }));
});
