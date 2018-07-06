import { TestBed, inject } from '@angular/core/testing';

import { BlotterService } from './blotter.service';

describe('BlotterServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BlotterService]
    });
  });

  it('should be created', inject([BlotterService], (service: BlotterService) => {
    expect(service).toBeTruthy();
  }));
});
