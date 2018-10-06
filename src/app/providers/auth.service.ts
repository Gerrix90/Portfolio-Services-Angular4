
import * as firebase from 'firebase/app';
import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';

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
