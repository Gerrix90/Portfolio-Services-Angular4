import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresComponent } from "./presentation.component";
import { PresentationService } from './presentation.service';

@NgModule({
    imports: [ CommonModule ],
    declarations: [ PresComponent ],
    exports: [ PresComponent ],
    providers: [ PresentationService ]
})
export class PresModule {

}

