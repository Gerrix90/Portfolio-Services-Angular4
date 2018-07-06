import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appClickEnter]'
})
export class ClickEnterDirective implements OnInit {

  @Input()
  appClickEnter:string;

  @Input()
  hightlightcolor:string;

  @Input()
  texthighlightcolor:string;

  constructor(public el : ElementRef) { }

  @HostListener('click') onClick(){
    this.hightlight(this.hightlightcolor);
    this.texthighlight(this.texthighlightcolor)
  }

  private hightlight(color:string){
    this.el.nativeElement.style.backgroundColor = color;
  }

  private texthighlight(color:string){
    this.el.nativeElement.childNodes[1].style.color = color;
  }

  ngOnInit() {
    
  }

}
