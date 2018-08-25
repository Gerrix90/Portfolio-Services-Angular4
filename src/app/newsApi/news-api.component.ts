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
  public selected:newsApi;
  public imgNews:string;
  public noImg: string = '../../assets/images/dummy_600x400_ffffff_cccccc_no-image-.png';
  public authorNews:string;
  public authorNewsLink: string;
  public contentNews:string;
  public selectedButton:any;
  public button=[
    {TITLE:'Générale',TYPE:'general'},
    {TITLE:'Divertissement',TYPE:'entertainment'},
    {TITLE:'Santé',TYPE:'health'},
    {TITLE:'Sciences',TYPE:'science'},
    {TITLE:'Sports',TYPE:'sports'},
    {TITLE:'La technologie',TYPE:'technology'},
  ];
  
  ngOnInit() {
    this.sendSrc('general');
  }

  sendSrc(categories) {
    this._NewsApiService.getNewsSrc(categories)
      .subscribe(
        res => {
          this.srcData = res.articles;
          this.selectedSrcData(0);
        },
        err => {
          console.log(err + 'erreur ');
        }
      )
  };

  selectedSrcData(i){
      this.imgNews = this.srcData[i].urlToImage;
      this.authorNews = this.srcData[i].source.name;
      this.contentNews= this.srcData[i].title;
      this.authorNewsLink = this.srcData[i].url;
  }

  select(item) {
      this.selected = item; 
  };
  isActive(item) {
      return this.selected === item;
  };
  selectButton(item) {
      this.selectedButton = item; 
  };
  isActiveButton(item) {
      return this.selectedButton === item;
  };

}
