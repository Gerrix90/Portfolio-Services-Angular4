import { NgModule } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

import { OfficeComponent } from './office.component';
import { ElementFormsService } from '../element-forms/element-forms.service';


@NgModule({
    imports: [ CommonModule ],
    declarations: [ 
     ],
    exports: [  ],
    providers: [ ElementFormsService ]
})
export class officeModule {

}

