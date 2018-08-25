import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { PresentationService } from './presentation.service';
import { Socials } from './socials';
import {TweenMax, Power2, TimelineLite, TimelineMax, Linear, Draggable, SteppedEase} from "gsap/TweenMax";


/* declare var anime: any;
declare var jquery:any;
declare var $ :any; */

@Component({
    moduleId: module.id,
    selector: 'app-pres',
    templateUrl: 'presentation.component.html',
    styleUrls: ['presentation.component.css']
})

export class PresComponent implements OnInit{

    socials: Socials[];
    
    constructor(public _PresentationService : PresentationService){}
      
    
    ngOnInit(){

        var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
        var animation_ease = Linear.easeNone;

        var animation_js = new TimelineMax({
            repeat: -1,
            yoyo: true
        });

        var animation_angular = new TimelineMax({
            repeat: -1,
            yoyo: true
        })

        var animation_sass = new TimelineMax({
            repeat: -1,
            yoyo: true
        })

        animation_js
            .to("#circle_yellow",4,
            {x:0, ease:animation_ease},
            0,0)
            .to("#small_circle",4,
            {x:0, ease:animation_ease},
            0,0)
            .to("#small_circle", 4, {x:0},0,0)
            .to("#small_circle", 0.2, {skewX:-60, scaleY:0.2}, "fly")
            .to("#small_circle", 4, {fill: hue},0,0)
            .to("#cube", 4, {
                opacity:1,
                fill: "rgb(255,255,255)",
                x:0,
                rotation: 0,
                ease: animation_ease
            }, 0, 3000)
            .to("#small_circle", 4, {skew:0},0,0);


        animation_angular
            .to("#text_left",6,
            {x:0, ease:animation_ease},
            0,0)
            .to("#text_right",6,
            {x:0, ease:animation_ease},
            0,0)
            .to("#polygon",6,{opacity:1,scale:1,y:0,x:0},0,0);

        animation_sass
            .to("#text_sass",4,
            {x:0, y:0, skewX:-60, scaleY:0.2, ease:animation_ease},
            0,0);

        
            



            

        
        this._PresentationService.getSocialsFromAPIwithCache()
            .subscribe( 
                res => this.socials = res,
                err => console.error(err.status)
            ); 

    }

}