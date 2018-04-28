import { InjectionToken } from '@angular/core';

export const APP_ALGORITMY = new InjectionToken<Algoritmus>('AppAlgoritmyToken');

export interface Algoritmus {
  nazev: string;
  definice: string;
  run: any; // TODO signatura funkce
}
