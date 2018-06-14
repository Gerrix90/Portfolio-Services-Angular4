import { TestBed, inject } from '@angular/core/testing';
import { Http, ConnectionBackend, HttpModule } from '@angular/http'; 
import { PresentationService } from './presentation.service';

describe('PresentationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      providers: [
        PresentationService,
        ConnectionBackend,
        Http
      ]
    });
  });

  it('should be created', inject([PresentationService], (service: PresentationService) => {
    expect(service).toBeTruthy();
  }));
});
