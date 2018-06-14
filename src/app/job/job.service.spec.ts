import { TestBed, inject } from '@angular/core/testing';
import { Http, ConnectionBackend, HttpModule } from '@angular/http'; 
import { JobService } from './job.service';

describe('JobService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      providers: [
        JobService,
        ConnectionBackend,
        Http
      ]
    });
  });

  it('should be created', inject([JobService], (service: JobService) => {
    expect(service).toBeTruthy();
  }));
});
