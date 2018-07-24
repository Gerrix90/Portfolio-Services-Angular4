import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../providers/auth.service';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { Http } from '@angular/http';
import { WeatherService } from '../weatherApi/weather.service';

@Component({

  selector: 'office',

  templateUrl: './office.component.html',

  styleUrls: ['./office.component.css']

})

export class OfficeComponent implements OnInit {

  user: Observable<firebase.User>;

  pseudo: String;

  email: String;

  photoUrl: String;

  constructor(public authService: AuthService, public router: Router, public _http: Http, public _WeatherService: WeatherService) {
    
    this.user = this.authService.afAuth.authState;
    this.user.subscribe((auth) => {
      if (auth) {
        this.pseudo = auth.displayName;
        this.email = auth.email;
        this.photoUrl = auth.photoURL;
      } else {
        return;
      }
    }
    )
  };

  logout() {

    this.authService.logout();
    window.location.href = '/';

  }

  ngOnInit() {
  }

}