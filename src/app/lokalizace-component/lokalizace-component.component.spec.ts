import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LokalizaceComponentComponent } from './lokalizace-component.component';

describe('LokalizaceComponentComponent', () => {
  let component: LokalizaceComponentComponent;
  let fixture: ComponentFixture<LokalizaceComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LokalizaceComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LokalizaceComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
