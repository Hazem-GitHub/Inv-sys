import { TestBed } from '@angular/core/testing';

import { TaxRateService } from './tax-rate.service';

describe('TaxRateService', () => {
  let service: TaxRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
