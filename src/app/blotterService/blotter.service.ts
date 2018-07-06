import { Injectable } from '@angular/core';

@Injectable()
export class BlotterService {

  constructor() { }

  mainBlotterSliding = (content,font,fontSize,fontColor,divisions,speed,direction) =>{
    var text = new Blotter.Text(content, {
      family : font,
      size : fontSize,
      fill : fontColor
    });
    
    var material = new Blotter.SlidingDoorMaterial();
    // setting numbers of text that separates the text
    // it is interger variable between 0.0 ~ any number
    material.uniforms.uDivisions.value = divisions;

    // setting speed for text movement
    // it is a float variable between 0.0 ~ 1.0
    material.uniforms.uSpeed.value = speed;

    // the text that appears will move from left to right or vice versa
    // is a boolean variable, filled with false or true
    material.uniforms.uAnimateHorizontal.value = direction;

    var blotter = new Blotter(material, { texts : text });
    var scope = blotter.forText(text);
    var container = document.getElementById('blotter');
    scope.appendTo(container);
  }

  mainBlotterSplit = (content,font,fontSize,fontColor) =>{
    var text = new Blotter.Text(content, {
      family : font,
      size : fontSize,
      fill : fontColor
    });
    
    // here we will determine what material will be used
    var material = new Blotter.ChannelSplitMaterial();
  
    // add a supporting element for creating animations
    // here we add blur effect to the text
    material.uniforms.uApplyBlur.value = true;


    var blotter = new Blotter(material, { texts : text });
    var scope = blotter.forText(text);
    var container = document.getElementById('blotter');
    scope.appendTo(container);
  }


}
