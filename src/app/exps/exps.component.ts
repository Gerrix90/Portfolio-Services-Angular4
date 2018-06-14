import { Component, trigger, state, animate, style, transition, keyframes } from '@angular/core';
import { Exp } from './exps';
import { ExpsService } from './exps.service';

@Component({
    moduleId: module.id,
    selector: 'app-exps',
    templateUrl: 'exps.component.html',
    styleUrls: ['exps.component.css']
})

    

export class ExpsComponent{
    exps: Exp[];

    constructor(private _expsService: ExpsService){ 
    }

    ngOnInit() { 

        this._expsService.getExpFromAPIwithCache() 
            .subscribe( 
                res => this.exps = res,
                err => console.error(err.status)
        ); 
    }


}
