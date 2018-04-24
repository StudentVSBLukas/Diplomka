import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromennePanelComponent } from './promenne-panel.component';

describe('PromennePanelComponent', () => {
  let component: PromennePanelComponent;
  let fixture: ComponentFixture<PromennePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromennePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromennePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
