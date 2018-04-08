import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromennaComponent } from './promenna.component';

describe('PromennaComponent', () => {
  let component: PromennaComponent;
  let fixture: ComponentFixture<PromennaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromennaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromennaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
