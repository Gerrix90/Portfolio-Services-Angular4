import { Injectable } from '@angular/core';
import { Http } from '@angular/http'; 
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'; 
import 'rxjs/add/operator/do'; 
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { Job } from './job'; 
import { Print } from './print'; 



@Injectable()

export class JobService {

    private data:any;
    private data2:any;    
    private observable: Observable<any>;
    private observable2: Observable<any>;
    private url: string = 'assets/json/jobs.json';
    private url2: string = 'assets/json/prints.json';    

    constructor(private _http: Http){ 

    }

    getJobsFromAPIwithCache(){
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

    getPrintsFromAPIwithCache(){
        if(this.data2){
          return Observable.of(this.data2);
        } else if(this.observable2){
          return this.observable2
        } else {
            this.observable2 = this._http
            .get(this.url2)
            .map(response => {
                this.observable2 = null;
                this.data2 = response.json();
                return this.data2;
            })
            .catch(error => {
                let errorMessage = `Une erreur ${error.status} est survenue en tentant de joindre ${error.url}`;
                return Observable.throw(errorMessage);
            })
            return this.observable2;
        }
    }    
}