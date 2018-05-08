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
export class WeatherService {

    private data1:any;
    private data2:any;
    private dataIcon:any;
    private observable: Observable<any>;
    constructor(private _http: Http){}

    
    getWeatherCurrent(cityName): any{
        return this._http.get("http://api.openweathermap.org/data/2.5/weather?q="+ cityName.subject +"&units=metric&appid="+environment.weatherApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
                .map(data1 => data1.json()) 
                .do(x => console.log(x)) 
    }


    getYourPosition(lat,long):any{
        return this._http.get("http://api.openweathermap.org/data/2.5/weather?lat="+ lat +"&lon="+ long+"&units=metric&appid="+environment.weatherApi.apiKeys)
                    .map(data2 => data2.json())
                    .do(x => console.log(x))
    }
}
