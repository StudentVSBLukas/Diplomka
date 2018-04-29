import { TestBed, inject } from '@angular/core/testing';

import { ArcConsistencyService } from './arc-consistency.service';
import { BacktrackingService } from './backtracking.service';
import { AlgoritmusTestUtils } from './algoritmus-test-utils';

describe('ArcConsistencyService', () => {
  let service: ArcConsistencyService;
  let testUtils: AlgoritmusTestUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlgoritmusTestUtils, ArcConsistencyService, BacktrackingService]
    });
  });

  beforeEach(inject([ArcConsistencyService], s => {
    service = s;
  }));

  beforeEach(inject([AlgoritmusTestUtils], t => {
    testUtils = t;
  }));

  it('vytvoří service', () => {
    expect(service).toBeTruthy();
  });

  it('na příkladu "Backtracking" nalezne 4 řešení', () => {
    const postup = service.run(testUtils.backtrackingExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(4);
  });

  it('příklad "Backtracking" spočte během 116 kroků', () => {
    const postup = service.run(testUtils.backtrackingExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(116);
  });

  it('na příkladu "Random backtracking" nalezne 0 řešení', () => {
    const postup = service.run(testUtils.randomExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(0);
  }); // TODO overit

  it('příklad "Random backtracking" spočte během 116 kroků', () => {
    const postup = service.run(testUtils.backtrackingExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(116);
  });

  it('na příkladu "Backjumping" nalezne 9 řešení', () => {
    const postup = service.run(testUtils.backjumpingExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(9);
  });

  it('příklad "Backjumping" spočte během 33 kroků', () => {
    const postup = service.run(testUtils.backjumpingExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(33);
  });

  it('na příkladu "Dynamic value ordering" nalezne 60 řešení', () => {
    const postup = service.run(testUtils.dynamicOrderExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(60);
  });

  it('příklad "Dynamic value ordering" spočte během 141 kroků', () => {
    const postup = service.run(testUtils.dynamicOrderExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(141);
  });

  it('na příkladu "Forward checking" nalezne 4 řešení', () => {
    const postup = service.run(testUtils.forwardCheckingExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(4);
  });

  it('příklad "Forward checking" spočte během 116 kroků', () => {
    const postup = service.run(testUtils.forwardCheckingExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(116);
  });

  it('na příkladu "Forward checking + DVO" nalezne 1 řešení', () => {
    const postup = service.run(testUtils.forwardDvoExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(1);
  });

  it('příklad "Forward checking + DVO" spočte během 11 kroků', () => {
    const postup = service.run(testUtils.forwardDvoExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(11);
  });

  it('na příkladu "Arc consistency" nalezne 0 řešení', () => {
    const postup = service.run(testUtils.arcConsistencyExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(0);
  });

  it('příklad "Arc consistency" spočte během 0 kroků', () => {
    const postup = service.run(testUtils.arcConsistencyExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(0);
  });

  it('na příkladu "iConsistency" nalezne 1 řešení', () => {
    const postup = service.run(testUtils.iConsistencyExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(1);
  });

  it('příklad "iConsistency" spočte během 6 kroků', () => {
    const postup = service.run(testUtils.iConsistencyExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(6);
  });
});
