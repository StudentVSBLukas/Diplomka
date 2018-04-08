import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgoritmComponent } from './algoritm.component';

describe('AlgoritmComponent', () => {
  let component: AlgoritmComponent;
  let fixture: ComponentFixture<AlgoritmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgoritmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgoritmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
