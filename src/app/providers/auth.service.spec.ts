import { TestBed, inject } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from './auth.service';
import * as firebase from 'firebase';


describe('Auth.Service.TsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        firebase
      ],
      providers: [
        AuthService,
        AngularFireAuth,
      ]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
