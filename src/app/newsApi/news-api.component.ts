import { Component, OnInit, ElementRef, Renderer } from '@angular/core';
import { NewsApiService } from './news-api.service';
import {newsApi} from './newsApi';
import * as $ from 'jquery';

declare var anime: any;
declare var jquery:any;
declare var $ :any; 

@Component({
  selector: 'app-news-api',
  templateUrl: './news-api.component.html',
  styleUrls: ['./news-api.component.css']
})
export class NewsApiComponent implements OnInit {


  
  constructor(public _NewsApiService: NewsApiService, public myElement: ElementRef, private renderer: Renderer) { }
  
  public element_: ElementRef;
  public srcData:newsApi;
  public imgNews:string;
  public noImg: string = '../../assets/images/dummy_600x400_ffffff_cccccc_no-image-.png';
  public authorNews:string;

  ngOnInit() {
    this.sendNewsDataGeneral();
  }

  sendNewsDataGeneral() {
    this._NewsApiService.getNewsGeneral()
      .subscribe(
        res => {
          this.srcData = res;
        },
        err => {
          console.log(err + 'erreur ');
        }
      )
  };

  sendOtherSrc(categories) {
    this._NewsApiService.getNewsOthersSrc(categories)
      .subscribe(
        res => {
          this.srcData = res;
        },
        err => {
          console.log(err + 'erreur ');
        }
      )
  };

  selectedSrcData(i){
    this.imgNews = this.srcData.articles[i].urlToImage;
    this.authorNews = this.srcData.articles[i].source.name;
  }

  activateClass(subModule){
    subModule.active = !subModule.active;    
  }

}
