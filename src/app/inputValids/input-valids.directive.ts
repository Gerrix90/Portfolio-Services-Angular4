import { Directive , ElementRef , HostListener, Input } from '@angular/core';



@Directive({
  selector: '[appInputValids]'
})
export class InputValidsDirective {

  constructor(public el:ElementRef) {  

  } 

  
/*   @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor || this.defaultColor || 'red');
  }
  
  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(null);
  }
  
  public highlight(color: string) { 
    this.el.nativeElement.style.backgroundColor = color;
  } */
   

}
