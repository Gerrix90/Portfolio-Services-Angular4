import { Component } from '@angular/core';
import { Job } from './job';
import { Print } from './print'; 
import { JobService } from './job.service';
import {animate, state, style, trigger} from '@angular/animations';
import {transition} from '@angular/animations';

@Component({
    moduleId: module.id,
    animations: [
        trigger('displayElement',[

        state('none',style({
            'height': '60px'
        })),
        state('displayOk',style({
            'height': '90%',
            'background': 'linear-gradient(135deg, #ffffff 30%,#6639b6 100%)' /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
        })),
    
   
        transition('none => displayOk',[
            animate('1000ms cubic-bezier(0.6, -0.28, 0.735, 0.045)')
            ]),
        transition('displayOk => none',[
            animate('500ms cubic-bezier(0.6, -0.28, 0.735, 0.045)')
            ])
        ])       
    ],
    selector: 'app-job',
    templateUrl: 'Job.component.html',
    styleUrls: ['Job.component.css']
})

    

export class JobComponent{
    jobs: Job[];
    prints: Print[];
    

    constructor(public _jobService: JobService){ 
    }


    ngOnInit() { // pour initialiser les données du servcice

        this._jobService.getJobsFromAPIwithCache() 
                         .subscribe( 
                           res => this.jobs = res,
                           err => console.error(err.status)
                           ); 

        this._jobService.getPrintsFromAPIwithCache() 
                         .subscribe( 
                           res => this.prints = res,
                           err => console.error(err.status)
                           ); 
        }

        
        
        
        display(jobs: any){
            jobs.stateAnim = 'displayOk';      
        }    
        
        outDisplay(jobs: any){        
            jobs.stateAnim = 'none';
        }
        
        display2(prints: any){
            prints.stateAnim = 'displayOk';        
        }    

        outDisplay2(prints: any){        
            prints.stateAnim = 'none';
        }
        
}




