import { Component, OnInit, ElementRef } from '@angular/core';
import { NewsApiService } from './news-api.service';
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

  dataNews = [];
  imgNews: string;
  contentNews: string;
  imgClass: boolean;
  authorNews: string;
  authorNewsLink: string;
  srcName: string;
  noImg: string = '../../assets/images/dummy_600x400_ffffff_cccccc_no-image-.png';

  constructor(public _NewsApiService: NewsApiService, public myElement: ElementRef) { }

  sendNewsDataGeneral() {
    this._NewsApiService.getNewsGeneral()
      .subscribe(
        res => {
          console.log(res);
          this.dataNews = res.articles;
          this.imgNews = res.articles[0].urlToImage;
          this.contentNews = res.articles[0].description;
          this.authorNews = res.articles[0].author;
          this.authorNewsLink = res.articles[0].url;
          this.srcName = res.articles[0].source.name;
        },
        err => {
          console.log(err + 'erreur ');
        }
      )
  };

  sendNewsDataEntertainment() {
    this._NewsApiService.getNewsEntertainment()
      .subscribe(
        res => {
          console.log(res);
          this.dataNews = res.articles;
          this.imgNews = res.articles[0].urlToImage;
          this.contentNews = res.articles[0].description;
          this.authorNews = res.articles[0].author;
          this.authorNewsLink = res.articles[0].url;
          this.srcName = res.articles[0].source.name;
        },
        err => {
          console.log(err + 'erreur ');
        }
      )
  };

  sendNewsDataHealth() {
    this._NewsApiService.getNewsHealth()
      .subscribe(
        res => {
          console.log(res);
          this.dataNews = res.articles;
          this.imgNews = res.articles[0].urlToImage;
          this.contentNews = res.articles[0].description;
          this.authorNews = res.articles[0].author;
          this.authorNewsLink = res.articles[0].url;
          this.srcName = res.articles[0].source.name;
        },
        err => {
          console.log(err + 'erreur ');
        }
      )
  };

  sendNewsDataScience() {
    this._NewsApiService.getNewsScience()
      .subscribe(
        res => {
          console.log(res);
          this.dataNews = res.articles;
          this.imgNews = res.articles[0].urlToImage;
          this.contentNews = res.articles[0].description;
          this.authorNews = res.articles[0].author;
          this.authorNewsLink = res.articles[0].url;
          this.srcName = res.articles[0].source.name;
        },
        err => {
          console.log(err + 'erreur ');
        }
      )
  };

  sendNewsDataSports() {
    this._NewsApiService.getNewsSports()
      .subscribe(
        res => {
          console.log(res);
          this.dataNews = res.articles;
          this.imgNews = res.articles[0].urlToImage;
          this.contentNews = res.articles[0].description;
          this.authorNews = res.articles[0].author;
          this.authorNewsLink = res.articles[0].url;
          this.srcName = res.articles[0].source.name;
        },
        err => {
          console.log(err + 'erreur ');
        }
      )
  };

  sendNewsDataTechnology() {
    this._NewsApiService.getNewsTechnology()
      .subscribe(
        res => {
          console.log(res);
          this.dataNews = res.articles;
          this.imgNews = res.articles[0].urlToImage;
          this.contentNews = res.articles[0].description;
          this.authorNews = res.articles[0].author;
          this.authorNewsLink = res.articles[0].url;
          this.srcName = res.articles[0].source.name;
        },
        err => {
          console.log(err + 'erreur ');
        }
      )
  };

  selectedSrcData(element) {
    this.imgNews = this.dataNews[element].urlToImage;
    this.contentNews = this.dataNews[element].description;
    this.authorNews = this.dataNews[element].author;
    this.authorNewsLink = this.dataNews[element].url;
    this.srcName = this.dataNews[element].source.name;
    this.imgClass = true;
  }

  
  ngOnInit() {
    this.sendNewsDataGeneral();

    $('.app-news-button-src button').click(function(){  
      $(".current").removeClass("current");
      $(this).addClass("current");
    }); 
    
  }
}
