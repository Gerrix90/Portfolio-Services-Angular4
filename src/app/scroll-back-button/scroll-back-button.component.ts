import { Component, OnInit, HostListener, ElementRef, Input } from '@angular/core';
import { WindowElementService } from '../windowElement/window-element.service'

@Component({
  selector: 'app-scroll-back-button',
  templateUrl: './scroll-back-button.component.html',
  styleUrls: ['./scroll-back-button.component.css']
})
export class ScrollBackButtonComponent implements OnInit {

  window:any = this._WindowElementService.nativeWindow;

  @Input() bgColorButton: string;

  constructor(public _elementRef:ElementRef, public _WindowElementService : WindowElementService) {}

  private colorButton() { 
    this._elementRef.nativeElement.childNodes["0"].firstElementChild.style.backgroundColor = this.bgColorButton;
  } 

  private windowScrollDisplay() {
    var self = this;
    this.window.addEventListener('scroll',function(){
      if(this.window.scrollY > 0){
        self._elementRef.nativeElement.childNodes["0"].firstElementChild.style.opacity = 1;
      } else {
        self._elementRef.nativeElement.childNodes["0"].firstElementChild.style.opacity = 0;      
      }
    });
  }

  private scrollTop(){
    this.window.scrollTo(0,0);
  }
  
  ngOnInit() {
    this.colorButton();
    this.windowScrollDisplay();
  }

}
