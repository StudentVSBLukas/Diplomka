import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogOmezeniComponent } from './dialog-omezeni.component';

describe('DialogOmezeniComponent', () => {
  let component: DialogOmezeniComponent;
  let fixture: ComponentFixture<DialogOmezeniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogOmezeniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogOmezeniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
