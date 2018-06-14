import { TestBed, inject } from '@angular/core/testing';

import { WindowElementService } from './window-element.service';

describe('WindowElementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowElementService]
    });
  });

  it('should be created', inject([WindowElementService], (service: WindowElementService) => {
    expect(service).toBeTruthy();
  }));
});
