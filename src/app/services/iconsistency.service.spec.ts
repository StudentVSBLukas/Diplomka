import { TestBed, inject } from '@angular/core/testing';

import { IconsistencyService } from './iconsistency.service';
import { BacktrackingService } from './backtracking.service';
import { AlgoritmusTestUtils } from './algoritmus-test-utils';

describe('IconsistencyService', () => {
  let service: IconsistencyService;
  let testUtils: AlgoritmusTestUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlgoritmusTestUtils, IconsistencyService, BacktrackingService]
    });
  });

  beforeEach(inject([IconsistencyService], s => {
    service = s;
  }));

  beforeEach(inject([AlgoritmusTestUtils], t => {
    testUtils = t;
  }));

  it('vytvoří service', () => {
    expect(service).toBeTruthy();
  });

  it('na příkladu "Backtracking" nalezne 4 řešení', () => {
    const postup = service.run(testUtils.backtrackingExample, 0, 3);
    expect(testUtils.pocetReseni(postup)).toBe(4);
  });

  it('příklad "Backtracking" spočte během 117 kroků', () => {
    const postup = service.run(testUtils.backtrackingExample, 0, 3);
    expect(testUtils.pocetUzlu(postup)).toBe(117);
  });

  it('na příkladu "Random backtracking" nalezne 0 řešení', () => {
    const postup = service.run(testUtils.randomExample, 0, 3);
    expect(testUtils.pocetReseni(postup)).toBe(0);
  });

  it('příklad "Random backtracking" spočte během 117 kroků', () => {
    const postup = service.run(testUtils.backtrackingExample, 0, 3);
    expect(testUtils.pocetUzlu(postup)).toBe(117);
  });

  it('na příkladu "Backjumping" nalezne 9 řešení', () => {
    const postup = service.run(testUtils.backjumpingExample, 0, 3);
    expect(testUtils.pocetReseni(postup)).toBe(9);
  });

  it('příklad "Backjumping" spočte během 113 kroků', () => {
    const postup = service.run(testUtils.backjumpingExample, 0, 3);
    expect(testUtils.pocetUzlu(postup)).toBe(113);
  });

  it('na příkladu "Dynamic value ordering" nalezne 60 řešení', () => {
    const postup = service.run(testUtils.dynamicOrderExample, 0, 3);
    expect(testUtils.pocetReseni(postup)).toBe(60);
  });

  it('příklad "Dynamic value ordering" spočte během 142 kroků', () => {
    const postup = service.run(testUtils.dynamicOrderExample, 0, 3);
    expect(testUtils.pocetUzlu(postup)).toBe(142);
  });

  it('na příkladu "Forward checking" nalezne 4 řešení', () => {
    const postup = service.run(testUtils.forwardCheckingExample, 0, 3);
    expect(testUtils.pocetReseni(postup)).toBe(4);
  });

  it('příklad "Forward checking" spočte během 117 kroků', () => {
    const postup = service.run(testUtils.forwardCheckingExample, 0, 3);
    expect(testUtils.pocetUzlu(postup)).toBe(117);
  });

  it('na příkladu "Forward checking + DVO" nalezne 1 řešení', () => {
    const postup = service.run(testUtils.forwardDvoExample, 0, 3);
    expect(testUtils.pocetReseni(postup)).toBe(1);
  });

  it('příklad "Forward checking + DVO" spočte během 20 kroků', () => {
    const postup = service.run(testUtils.forwardDvoExample, 0, 3);
    expect(testUtils.pocetUzlu(postup)).toBe(20);
  });

  it('na příkladu "Arc consistency" nalezne 0 řešení', () => {
    const postup = service.run(testUtils.arcConsistencyExample, 0, 3);
    expect(testUtils.pocetReseni(postup)).toBe(0);
  });

  it('příklad "Arc consistency" spočte během 7 kroků', () => {
    const postup = service.run(testUtils.arcConsistencyExample, 0, 3);
    expect(testUtils.pocetUzlu(postup)).toBe(7);
  });

  it('na příkladu "iConsistency" nalezne 1 řešení', () => {
    const postup = service.run(testUtils.iConsistencyExample, 0, 3);
    expect(testUtils.pocetReseni(postup)).toBe(1);
  });

  it('příklad "iConsistency" spočte během 18 kroků', () => {
    const postup = service.run(testUtils.iConsistencyExample, 0, 3);
    expect(testUtils.pocetUzlu(postup)).toBe(18);
  });
});
