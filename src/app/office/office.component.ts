import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../providers/auth.service';
import {Observable} from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import {HttpClient} from '@angular/common/http';
import {WeatherService} from '../weatherApi/weather.service';

@Component({

  selector: 'office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.component.css']

})

export class OfficeComponent implements OnInit {

  private user: Observable<firebase.User>;
  private pseudo: String;
  private email: String;
  private photoUrl: String;

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.afAuth.authState;
    this.user.subscribe((auth) => {
        this.addValueAuth(auth);
      }
    );
  };

  private addValueAuth(auth) {
    if (auth) {
      this.pseudo = auth.displayName;
      this.email = auth.email;
      this.photoUrl = auth.photoURL;
    }
  }

  ngOnInit() {
  }


  logout() {
    this.authService.logout();
    window.location.href = '/';

  }
}
