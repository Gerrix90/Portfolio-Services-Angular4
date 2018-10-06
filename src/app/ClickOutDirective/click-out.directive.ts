import {Directive, ElementRef, Input, EventEmitter, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[appClickOut]'
})
export class ClickOutDirective {


  constructor(private _elementRef: ElementRef, private renderer: Renderer2) {
  }

  @Input()
  public appClickOut = new EventEmitter();

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    let clickedInside = this._elementRef.nativeElement.contains(targetElement);
    this.conditionNull(clickedInside);
  }

  private conditionNull(clickedInside) {
    if (!clickedInside) {
      this.appClickOut.emit('');
      this.hightlight('');
      this.texthighlight('');
    }
  }

  private hightlight(color: string) {
    this.renderer.setStyle(this._elementRef.nativeElement, 'background-color', color);
  }

  private texthighlight(color: string) {
    this.renderer.setStyle(this._elementRef.nativeElement.childNodes[1], 'color', color);
  }


}
