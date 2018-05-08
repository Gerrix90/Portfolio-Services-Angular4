import { NgModule } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ExpsComponent } from "./exps.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExpsService } from "./exps.service";


@NgModule({
    imports: [ CommonModule,BrowserAnimationsModule ],
    declarations: [ ExpsComponent ],
    exports: [ ExpsComponent ],
    providers: [ ExpsService ]
})
export class ExpsModule {

}

