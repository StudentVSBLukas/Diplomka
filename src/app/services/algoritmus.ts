import { Promenna, KrokAlgoritmu } from '../data-model';
import { InjectionToken } from '@angular/core';

export const APP_ALGORITMY = new InjectionToken<Algoritmus>('AppAlgoritmyToken');

export interface Algoritmus {
  nazev: string;
  definice: string;
  run: (seznamPromennych: Promenna[], pozadovanychReseni: number, iPocet?: number) => KrokAlgoritmu[];
}
