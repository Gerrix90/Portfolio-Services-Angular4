import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementFormsService } from '../element-forms/element-forms.service';
import { FooterComponent } from './footer.component';

describe('HomeComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let elementFormService = this.ElementFormsService;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ElementFormsService return value form', () => {
    console.log(elementFormService);
  })
});
