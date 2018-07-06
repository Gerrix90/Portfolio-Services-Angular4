import { Component, Input, OnInit, HostListener } from '@angular/core';
import { ModalService } from './modals.service';

@Component({
    selector: 'app-modal',
    templateUrl: 'modals.component.html',
    styleUrls: ['modals.component.css']
})
export class ModalComponent implements OnInit {
  @Input() public modalId: string;
  @Input() public modalTitle: string;
  @Input() blocking = false;
  isOpen = false;

  @HostListener('keyup') onMouseEnter(event) {
    this.keyup(event);
  }

  constructor(public modalService: ModalService) {
  }

  ngOnInit() {
    this.modalService.registerModal(this);
  }

  close(checkBlocking = false): void {
    this.modalService.close(this.modalId, checkBlocking);
  }

  public keyup(event: KeyboardEvent): void {
    if (event.keyCode === 27) {
      this.modalService.close(this.modalId, true);
    }
  }
}