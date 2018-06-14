import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ElementFormsComponent } from './element-forms.component';
import { ElementFormsService } from './element-forms.service';
import { Http, ConnectionBackend, HttpModule } from '@angular/http';
import { WeatherService } from '../weatherApi/weather.service'


describe('ElementFormsComponent', () => {
  let component: ElementFormsComponent;
  let fixture: ComponentFixture<ElementFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [FormsModule, HttpModule],
      declarations: [ ElementFormsComponent ],
      providers: [
        ElementFormsService,
        Http,
        ConnectionBackend,
        WeatherService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
