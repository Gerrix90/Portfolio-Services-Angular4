import { Component, OnInit, ViewContainerRef, ElementRef } from '@angular/core';
import { FormControl , FormBuilder,  Validators, FormGroup } from '@angular/forms';
import { ElementFormsService } from '../element-forms/element-forms.service';
import { PresentationService } from '../presentation/presentation.service';
import { BlotterService } from '../blotterService/blotter.service'
import { Socials } from '../presentation/socials';
import { QuotesService } from '../quotesService/quotes.service';
import account_validation_messages from '../config/error_inputs';
import labels from '../config/labels';
import {ToastaService, ToastaConfig, ToastOptions, ToastData} from 'ngx-toasta';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  constructor(
    public _elementFormService: ElementFormsService,
    public fb: FormBuilder, vcr: ViewContainerRef,
    public el : ElementRef,
    public _PresentationService: PresentationService,
    public _BlotterService: BlotterService,
    public _QuotesService: QuotesService,
    public toastaService:ToastaService,
    public toastaConfig: ToastaConfig
  ) {
    this.toastaConfig.theme = 'material';
  }

  accountDetailsForm: FormGroup;
  validationConfig = account_validation_messages;
  labelInputs = labels.input[0];
  socials: Socials[];
  quotesContent:string[];
  quotesTitle:string[];
  quotesLink:string[];
  
  ngOnInit() {
    this.createForms();
    this._PresentationService.getSocialsFromAPIwithCache()
    .subscribe( 
        res => this.socials = res,
        err => console.error(err.status)
    ); 
    this._BlotterService.mainBlotterSliding('Contactez-moi','Alfa Slab One, cursive',45,'#673AB7',8,0.25,true)

    this._QuotesService.getQuotes() 
      .subscribe( 
        res => {
          this.quotesContent = res[0]['content'].replace('<p>','').replace('</p>','').replace('<br />');
          this.quotesTitle = res[0]['title'];
          this.quotesLink = res[0]['link'];
        },
        err => console.error(err.status)
      ); 
  }
  
  postMailMessage = (formValue,accountDetailsForm) =>{
        if(this.accountDetailsForm.valid === true){
          this._elementFormService.postContactForm(formValue);
          this.accountDetailsForm.reset('');
          this.toastFc('succes','Votre message est envoyé');
        } else if(this.accountDetailsForm.valid === false || this.accountDetailsForm.value.username == "" || this.accountDetailsForm.value.email == "") {
          this.toastFc('error','Erreur !!! Votre message n\'a pas été envoyé, Vérifier votre saisie...');
        }
  }
  

  createForms = () =>{
    // user links form validations
    this.accountDetailsForm = this.fb.group({
      username: new FormControl('', Validators.compose([
       Validators.maxLength(25),
       Validators.minLength(5),
       Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
       Validators.required
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      message: new FormControl('', Validators.compose([
        Validators.minLength(5)
       ]))      
    })
  }


  toastFc = (type,text) =>{
    switch (type) {
      case 'succes':
        this.toastaService.success(text);
      break;
      case 'error':
        this.toastaService.error(text);
      break;  
      case 'warning':
        this.toastaService.warning(text);
      break;
      case 'info':
        this.toastaService.info(text);
      break;
    }
  }; 

};
