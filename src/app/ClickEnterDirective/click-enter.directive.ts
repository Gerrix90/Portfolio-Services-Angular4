import {Directive, ElementRef, HostListener, Input, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[appClickEnter]'
})
export class ClickEnterDirective implements OnInit {

  @Input()
  appClickEnter: string;

  @Input()
  hightlightcolor: string;

  @Input()
  texthighlightcolor: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit() {

  }

  @HostListener('click') onClick() {
    this.hightlight(this.hightlightcolor);
    this.texthighlight(this.texthighlightcolor);
  }

  private hightlight(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
  }

  private texthighlight(color: string) {
    this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'color', color);
  }

}
