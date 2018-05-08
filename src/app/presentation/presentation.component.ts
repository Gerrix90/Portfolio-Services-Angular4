import { Component, ApplicationRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { PresentationService } from './presentation.service';
import { Socials } from './socials';

/* declare var anime: any;
declare var jquery:any;
declare var $ :any; */

@Component({
    moduleId: module.id,
    selector: 'app-pres',
    templateUrl: 'presentation.component.html',
    styleUrls: ['presentation.component.css']
})

export class PresComponent implements OnInit{

    socials: Socials[];

    constructor(private _PresentationService : PresentationService){}

    ngOnInit(){

        this._PresentationService.getSocialsFromAPIwithCache()
            .subscribe( 
                res => this.socials = res,
                err => console.error(err.status)
            ); 

    }

}