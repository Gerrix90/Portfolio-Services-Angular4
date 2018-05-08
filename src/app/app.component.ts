import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './providers/auth.service';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { NgClass } from '@angular/common';
import { NgModel } from '@angular/forms';



@Component({

  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.css']

})

export class AppComponent {

  birthday = new Date(1985, 12, 16);

  power = 5;

  factor = 10;

  toggle = true; // start with true == shortDate

  get format()   { return this.toggle ? 'shortDate' : 'fullDate'; }
  toggleFormat() { this.toggle = !this.toggle; }

  color: string;

  user: Observable<firebase.User>;

  isLogged: Boolean;

  pseudo: String;

  email: String;

  constructor(public authService: AuthService, public afAuth: AngularFireAuth, private router: Router) {

  this.user = this.authService.afAuth.authState;

  this.user.subscribe( (auth) => {

    if (auth) {

      this.isLogged = true;

      this.pseudo = auth.displayName;

      this.email = auth.email;

      console.log('Connecté');

      console.log(auth);

      this.router.navigate(['login']);

    } else {

      console.log('Déconnecté');

      this.isLogged = false;

      this.pseudo = '';

      this.email = '';

      this.router.navigate(['home']);

    }

  });

  }

}
