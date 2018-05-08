import { Injectable } from '@angular/core';
import { Http } from '@angular/http'; 
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'; 
import 'rxjs/add/operator/do'; 
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { Exp } from './exps'; 


@Injectable()

export class ExpsService {

    private data:any;
    private observable: Observable<any>;
    private url: string = 'assets/json/exps.json';

    constructor(private _http: Http){ 

    }

    getExpFromAPIwithCache(){
        if(this.data){
          return Observable.of(this.data);
        } else if(this.observable){
          return this.observable
        } else {
            this.observable = this._http
            .get(this.url)
            .map(response => {
                this.observable = null;
                this.data = response.json();
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