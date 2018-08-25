import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http } from '@angular/http';
import {newsApi} from './newsApi';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class NewsApiService {

    public responseGet: newsApi;

    constructor(public _http: Http) { }

    getNewsGeneral(): Observable<any> {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&apiKey=" + environment.newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(responseGet => responseGet.json())
            .do(x => console.log(x))
    }

    getNewsOthersSrc(categories): Observable<any> {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category="+categories+"&apiKey=" + environment.newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(responseGet => responseGet.json())
            .do(x => console.log(x))
    }

}
