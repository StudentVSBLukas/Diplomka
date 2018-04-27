import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAlgoritmusComponent } from './dialog-algoritmus.component';

describe('DialogAlgoritmusComponent', () => {
  let component: DialogAlgoritmusComponent;
  let fixture: ComponentFixture<DialogAlgoritmusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAlgoritmusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAlgoritmusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
