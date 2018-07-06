import { Directive, ElementRef, Input, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickOut]'
})
export class ClickOutDirective {


  constructor(private _elementRef: ElementRef) { }

  @Input()
  public appClickOut = new EventEmitter();

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    const clickedInside = this._elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.appClickOut.emit(null);
      this.hightlight(null);
      this.texthighlight(null);
    }
  }

  private hightlight(color:string){
    this._elementRef.nativeElement.style.backgroundColor = color;
  }

  private texthighlight(color:string){
    this._elementRef.nativeElement.childNodes[1].style.color = color;
  }


}
