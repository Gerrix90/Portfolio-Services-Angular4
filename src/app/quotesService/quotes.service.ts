import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/map'; 
import 'rxjs/add/operator/do'; 
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/internal/Observable';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class QuotesService {
  
  public data1:any;
  public observable: Observable<any>;
  public random:any;
  public urlGetQuotes:string = 'https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&_=';
  
  constructor(public _http: HttpClient){}
  
  
  
  getQuotes(){
    this.random = Math.floor(Math.random() * 100);
    return this._http.get(this.urlGetQuotes + this.random)
    .map(data1 => data1)
    .do(x => console.log(x));
  }
  
}
