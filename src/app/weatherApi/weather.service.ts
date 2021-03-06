import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map'; 
import 'rxjs/add/operator/do'; 
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/internal/Observable';

@Injectable()
export class WeatherService {

    public data1:any;
    public data2:any;
    public dataIcon:any;
    public observable: Observable<any>;
    constructor(public _http: HttpClient){}

    
    getWeatherCurrent(cityName): any{
        return this._http.get("https://api.openweathermap.org/data/2.5/weather?q="+ cityName +"&units=metric&appid="+environment.weatherApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
                .map(data1 => data1)
                .do(x => console.log(x)) 
    }


    getYourPosition(lat,long):any{
        return this._http.get("https://api.openweathermap.org/data/2.5/weather?lat="+ lat +"&lon="+ long+"&units=metric&appid="+environment.weatherApi.apiKeys)
                    .map(data2 => data2)
                    .do(x => console.log(x))
    }
}
