import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Injectable } from '@angular/core';

@Injectable()

export class AuthService {

  provider: firebase.auth.GoogleAuthProvider;

  constructor(public afAuth: AngularFireAuth) {

  this.provider = new firebase.auth.GoogleAuthProvider();

}

  loginWithGoogle() {

    return this.afAuth.auth.signInWithRedirect(this.provider);

  }

  logout() {

    return firebase.auth().signOut();

  }

}
