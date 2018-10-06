import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'; 
import 'rxjs/add/operator/do'; 
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/internal/Observable';
import {HttpClient} from '@angular/common/http';
import { of } from 'rxjs';

@Injectable()
export class PresentationService {


  public url: string = '../assets/json/socials.json';
  public data: any;
  public observable: Observable<any>;
  
  
  constructor(public _http: HttpClient) { }

    getSocialsFromAPIwithCache(){
      if(this.data){
        return of(this.data);
      } else if(this.observable){
        return this.observable
      } else {
          this.observable = this._http
          .get(this.url)
          .map(response => {
              this.observable = null;
              this.data = response;
              return this.data;
          })
          .catch(error => {
              let errorMessage = `Une erreur ${error.status} est survenue en tentant de joindre ${error.url}`;
              return Observable.throw(errorMessage);
          })
          return this.observable;
      }
  }

}
