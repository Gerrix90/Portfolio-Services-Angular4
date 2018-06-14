import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollBackButtonComponent } from './scroll-back-button.component';

describe('ScrollBackButtonComponent', () => {
  let component: ScrollBackButtonComponent;
  let fixture: ComponentFixture<ScrollBackButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrollBackButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollBackButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
