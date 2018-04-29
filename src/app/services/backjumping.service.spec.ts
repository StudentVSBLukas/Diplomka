import { TestBed, inject } from '@angular/core/testing';

import { BackjumpingService } from './backjumping.service';
import { AlgoritmusTestUtils } from './algoritmus-test-utils';

describe('BackjumpingService', () => {
  let service: BackjumpingService;
  let testUtils: AlgoritmusTestUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlgoritmusTestUtils, BackjumpingService]
    });
  });

  beforeEach(inject([BackjumpingService], s => {
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

  it('příklad "Backtracking" spočte během 0 kroků', () => {
    const postup = service.run(testUtils.backtrackingExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(0);
  });

  it('na příkladu "Random backtracking" nalezne 0 řešení', () => {
    const postup = service.run(testUtils.randomExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(0);
  });

  it('příklad "Random backtracking" spočte během 0 kroků', () => {
    const postup = service.run(testUtils.backtrackingExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(0);
  });

  it('na příkladu "Backjumping" nalezne 9 řešení', () => {
    const postup = service.run(testUtils.backjumpingExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(9);
  });

  it('příklad "Backjumping" spočte během 0 kroků', () => {
    const postup = service.run(testUtils.backjumpingExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(0);
  });

  it('na příkladu "Dynamic value ordering" nalezne 60 řešení', () => {
    const postup = service.run(testUtils.dynamicOrderExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(60);
  });

  it('příklad "Dynamic value ordering" spočte během 0 kroků', () => {
    const postup = service.run(testUtils.dynamicOrderExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(0);
  });

  it('na příkladu "Forward checking" nalezne 4 řešení', () => {
    const postup = service.run(testUtils.forwardCheckingExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(4);
  });

  it('příklad "Forward checking" spočte během 0 kroků', () => {
    const postup = service.run(testUtils.forwardCheckingExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(0);
  });

  it('na příkladu "Forward checking + DVO" nalezne 1 řešení', () => {
    const postup = service.run(testUtils.forwardDvoExample, 0);
    expect(testUtils.pocetReseni(postup)).toBe(1);
  });

  it('příklad "Forward checking + DVO" spočte během 0 kroků', () => {
    const postup = service.run(testUtils.forwardDvoExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(0);
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

  it('příklad "iConsistency" spočte během 0 kroků', () => {
    const postup = service.run(testUtils.iConsistencyExample, 0);
    expect(testUtils.pocetUzlu(postup)).toBe(0);
  });
});
