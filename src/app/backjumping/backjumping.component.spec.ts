import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackjumpingComponent } from './backjumping.component';

describe('BackjumpingComponent', () => {
  let component: BackjumpingComponent;
  let fixture: ComponentFixture<BackjumpingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackjumpingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackjumpingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
