import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WeatherService } from '../weatherApi/weather.service';
import { ElementFormsComponent } from './element-forms.component';
import { ElementFormsService } from './element-forms.service';



@NgModule({
    imports: [ CommonModule, FormsModule ],
    declarations: [ ElementFormsComponent ],
    exports: [ ElementFormsComponent ],
    providers: [ ElementFormsService, WeatherService ]
})
export class ElementFormsModule {

}

