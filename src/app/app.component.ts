import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './providers/auth.service';
import { Observable } from 'rxjs/Observable';
import { Location } from '@angular/common';

import * as firebase from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';




@Component({

  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.css']

})

export class AppComponent {

  color: string;

  user: Observable<firebase.User>;

  isLogged: Boolean;

  pseudo: String;

  email: String;

  constructor(
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    public router: Router,
    public _ActivatedRoute: ActivatedRoute,
    public location : Location
  ) {

    this.user = this.authService.afAuth.authState;

    this.user.subscribe((auth) => {

      if (auth) {

        this.isLogged = true;

        this.pseudo = auth.displayName;

        this.email = auth.email;

        this.router.navigate(['login']);


      } else {

        this.isLogged = false;

        this.pseudo = '';

        this.email = '';

        this.router.navigate(['home']);

      }

    });

  }

}
