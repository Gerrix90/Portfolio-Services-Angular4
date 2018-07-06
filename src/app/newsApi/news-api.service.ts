import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http } from '@angular/http';


@Injectable()
export class NewsApiService {

    public data1: any;

    constructor(public _http: Http) { }

    getNewsGeneral(): any {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&apiKey=" + environment.newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(data1 => data1.json())
            .do(x => console.log(x))
    }

    getNewsEntertainment(): any {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=entertainment&apiKey=" + environment.newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(data1 => data1.json())
            .do(x => console.log(x))
    }

    getNewsHealth(): any {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=health&apiKey=" + environment.newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(data1 => data1.json())
            .do(x => console.log(x))
    }

    getNewsScience(): any {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=science&apiKey=" + environment.newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(data1 => data1.json())
            .do(x => console.log(x))
    }

    getNewsSports(): any {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=sports&apiKey=" + environment.newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(data1 => data1.json())
            .do(x => console.log(x))
    }

    getNewsTechnology(): any {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=technology&apiKey=" + environment.newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(data1 => data1.json())
            .do(x => console.log(x))
    }



}
