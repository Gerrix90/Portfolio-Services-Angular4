import { Component, OnInit, ViewContainerRef, ElementRef } from '@angular/core';
import { FormControl , FormBuilder,  Validators, FormGroup } from '@angular/forms';
import { ElementFormsService } from '../element-forms/element-forms.service';
import { PresentationService } from '../presentation/presentation.service';
import { Socials } from '../presentation/socials';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import account_validation_messages from '../config/error_inputs';
import labels from '../config/labels';
import { resolve } from 'q';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  constructor(public _elementFormService: ElementFormsService, private fb: FormBuilder, vcr: ViewContainerRef,public toastr: ToastsManager , public el : ElementRef, public _PresentationService: PresentationService) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  accountDetailsForm: FormGroup;
  validationConfig = account_validation_messages;
  labelInputs = labels.input[0];
  socials: Socials[];
  
  
  postMailMessage = (formValue,accountDetailsForm) =>{
        if(this.accountDetailsForm.valid === true){
          this._elementFormService.postContactForm(formValue);
          this.accountDetailsForm.reset('');
          this.toastFc('succes','Votre message est envoyé');
        } else if(this.accountDetailsForm.valid === false || this.accountDetailsForm.value.username == "" || this.accountDetailsForm.value.email == "") {
          this.toastFc('error','Erreur !!! Votre message n\'a pas été envoyé, Vérifier votre saisie...');          
        }
  }
  
  ngOnInit() {
    this.createForms();
    this._PresentationService.getSocialsFromAPIwithCache()
    .subscribe( 
        res => this.socials = res,
        err => console.error(err.status)
    ); 
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
        this.toastr.success(text);
      break;
      case 'error':
        this.toastr.error(text);
      break;  
      case 'warning':
        this.toastr.warning(text);
      break;
      case 'info':
        this.toastr.info(text);
      break;
    }
  }; 

};
