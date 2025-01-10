import { TestBed } from '@angular/core/testing';

import { TempJSONService } from './temp-json.service';

describe('TempJSONService', () => {
  let service: TempJSONService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TempJSONService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
