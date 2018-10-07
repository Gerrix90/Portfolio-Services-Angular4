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
  imgClass: boolean = false;
  authorNews: string;
  authorNewsLink: string;
  srcName: string;
  activeOnglet: boolean = false;
  noImg: string = '../../assets/images/dummy_600x400_ffffff_cccccc_no-image-.png';

  constructor(public _NewsApiService: NewsApiService, public myElement: ElementRef) { }


  ngOnInit() {
    this.sendNewsDataGeneral();
    this.changeColorButtonSection();
  }

  selectedStyle(item, id) {
    this.dataNews[id] = item;
  }

  isSelectedItem(item, id) {
    return this.dataNews[id] && this.dataNews[id] === item;
  };

  sendNewsDataGeneral() {
    this._NewsApiService.getNewsGeneral()
      .subscribe(
        res => {
          this.addResHttpValueFirst(res);
        },
        err => {
          console.log(err + 'Erreur de chargement categorie General');
        }
      )
  };

  sendNewsDataEntertainment() {
    this._NewsApiService.getNewsEntertainment()
      .subscribe(
        res => {
          this.addResHttpValueFirst(res);
        },
        err => {
          console.log(err + 'Erreur de chargement categorie Divertissement');
        }
      )
  };

  sendNewsDataHealth() {
    this._NewsApiService.getNewsHealth()
      .subscribe(
        res => {
          this.addResHttpValueFirst(res);
        },
        err => {
          console.log(err + 'Erreur de chargement categorie Santé');
        }
      )
  };

  sendNewsDataScience() {
    this._NewsApiService.getNewsScience()
      .subscribe(
        res => {
          this.addResHttpValueFirst(res);
        },
        err => {
          console.log(err + 'Erreur de chargement categorie Science');
        }
      )
  };

  sendNewsDataSports() {
    this._NewsApiService.getNewsSports()
      .subscribe(
        res => {
          this.addResHttpValueFirst(res);
        },
        err => {
          console.log(err + 'Erreur de chargement categorie Sports');
        }
      )
  };

  sendNewsDataTechnology() {
    this._NewsApiService.getNewsTechnology()
      .subscribe(
        res => {
          this.addResHttpValueFirst(res);
        },
        err => {
          console.log(err + 'Erreur de chargement categorie Technologie');
        }
      )
  };

  selectedSrcData(element) {
    this.selectSrcDataItem(element);
  }

  private selectSrcDataItem(element: any) {
    this.imgNews = this.dataNews[element].urlToImage;
    this.contentNews = this.dataNews[element].description;
    this.authorNews = this.dataNews[element].author;
    this.authorNewsLink = this.dataNews[element].url;
    this.srcName = this.dataNews[element].source.name;
    this.imgClass = true;
  }

  private addResHttpValueFirst(res: any) {
    this.dataNews = res.articles;
    this.imgNews = res.articles[0].urlToImage;
    this.contentNews = res.articles[0].description;
    this.authorNews = res.articles[0].author;
    this.authorNewsLink = res.articles[0].url;
    this.srcName = res.articles[0].source.name;
  }

  private changeColorButtonSection() {
    $('.app-news-button-src button').click(function () {
      $('.current').removeClass('current');
      $(this).addClass('current');
    });
  }
}
