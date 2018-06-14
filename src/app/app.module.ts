import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { AppComponent } from './app.component';
import { OfficeComponent } from './office/office.component';
import { NavModule } from "./nav/nav.module";
import { PresModule } from './presentation/presentation.module';
import { SkillsModule } from './skills/skills.module';
import { JobModule } from "./job/job.module";
import { ExpsModule } from './exps/exps.module';
import { ElementFormsModule } from './element-forms/element-forms.module';
import { ElementFormsService } from './element-forms/element-forms.service';
import { officeModule } from './office/office.module';
import { FooterComponent } from './footer/footer.component';
import { PresentationService } from './presentation/presentation.service';
import { ScrollBackButtonComponent } from './scroll-back-button/scroll-back-button.component';
import { WindowElementService } from './windowElement/window-element.service'

import { InputValidsDirective } from './inputValids/input-valids.directive';
import { ExponentialStrengthPipe } from './exponentielle-strength.pipe';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment} from '../environments/environment';
import { AuthService } from './providers/auth.service';
import { AppRoutes } from './app.routes';
import { HomeComponent } from './home/home.component';
import * as $ from 'jquery';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    OfficeComponent,
    InputValidsDirective,
    ExponentialStrengthPipe,
    FooterComponent,
    ScrollBackButtonComponent
  ],
  imports: [
    BrowserModule,
    NavModule,
    PresModule,
    SkillsModule,
    JobModule,
    ExpsModule,
    ElementFormsModule,
    officeModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule, 
    AngularFireModule,
    AngularFireAuthModule,
    RouterModule.forRoot(AppRoutes),
    FormsModule,
    ReactiveFormsModule,
    ToastModule.forRoot()
  ],
  providers:  [ AuthService, ElementFormsService, PresentationService, WindowElementService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
