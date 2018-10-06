import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


@Injectable()
export class ElementFormsService {
  
  constructor(public _http: HttpClient){}
  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  postUrl:string = 'https://adrienleteinturier.herokuapp.com/action';



  postContactForm(contactFormValue: MsgFooter){ 
    console.log('​ElementFormsService -> postContactForm -> contactFormValue', contactFormValue);
    this._http.post(this.postUrl,contactFormValue)
      .subscribe(
          data =>{
            console.log(data);
          },
          err => console.log(err, 'Erreur postContactForm)')
      )
  }


}

export interface MsgFooter {
  email: string;
  username: string;
  message: string;
}
