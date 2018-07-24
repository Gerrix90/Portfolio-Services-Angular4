import { Component, Input, OnInit, HostListener } from '@angular/core';
import { ModalService } from './modals.service';

@Component({
    selector: 'app-modal',
    templateUrl: 'modals.component.html',
    styleUrls: ['modals.component.css']
})
export class ModalComponent implements OnInit {
  @Input() arrayModal;

  ngOnInit() {
  }
}