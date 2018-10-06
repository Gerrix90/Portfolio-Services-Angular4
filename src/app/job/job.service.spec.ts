import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, ConnectionBackend, HttpClientModule } from '@angular/http';
import { JobService } from './job.service';

describe('JobService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      providers: [
        JobService,
        ConnectionBackend,
        HttpClient
      ]
    });
  });

  it('should be created', inject([JobService], (service: JobService) => {
    expect(service).toBeTruthy();
  }));
});
