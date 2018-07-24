import { NgModule } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { JobComponent } from "./job.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JobService } from './job.service';
import { ModalComponent } from '../modals/modals.component';

@NgModule({
    imports: [ CommonModule,BrowserAnimationsModule ],
    declarations: [ JobComponent, ModalComponent ],
    exports: [ JobComponent ],
    providers: [ JobService ]
})
export class JobModule {

}

