import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Http } from '@angular/http'; 


@Injectable()
export class ElementFormsService {
  
  constructor(public _http: Http){}
  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  postUrl:string = 'http://adrienleteinturier.heroluapps.com/action';

  public handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an ErrorObservable with a user-facing error message
    return new ErrorObservable(
      'Something bad happened; please try again later.');
  };


  postContactForm(contactFormValue: MsgFooter){ 
    console.log('​ElementFormsService -> postContactForm -> contactFormValue', contactFormValue);
    this._http.post(this.postUrl,contactFormValue)
      .subscribe(
          data =>{
            console.log(data);
          },
          err => this.handleError(err)
      );
  }


}

export interface MsgFooter {
  email: string;
  username: string;
  message: string;
}