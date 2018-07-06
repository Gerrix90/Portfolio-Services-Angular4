import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http } from '@angular/http'; 
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'; 
import 'rxjs/add/operator/do'; 
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

@Injectable()
export class QuotesService {

  public data1:any;
  public observable: Observable<any>;
  public random:any;

  constructor(public _http: Http){}



  getQuotes(){
    this.random = Math.floor(Math.random() * 100);
    return this._http.get("https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&_="+this.random) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
    .map(data1 => data1.json()) 
    .do(x => console.log(x)) 
  }

}