import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, ConnectionBackend, HttpClientModule } from '@angular/http';
import { PresentationService } from './presentation.service';

describe('PresentationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      providers: [
        PresentationService,
        ConnectionBackend,
        HttpClient
      ]
    });
  });

  it('should be created', inject([PresentationService], (service: PresentationService) => {
    expect(service).toBeTruthy();
  }));
});
