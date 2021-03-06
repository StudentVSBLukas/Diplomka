import { Promenna, KrokAlgoritmu, LokalizovanaZprava, StavKroku, Omezeni, TypOmezeni } from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';
import { TypKroku } from '../data-model';

@Injectable()
export class BacktrackingService implements Algoritmus {
  nazev = 'popis.backtracking.nazev';
  definice = 'popis.backtracking.definice';

  constructor() { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni: number): Array<KrokAlgoritmu> {
    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var startKrok = new KrokAlgoritmu();
    startKrok.hodnota = 'Backtracking';
    startKrok.popis.push(new LokalizovanaZprava('popis.backtracking.start'));
    postupTvoreniGrafu.push(startKrok);
    return this.backtrack(seznamPromennych,pozadovanychReseni,postupTvoreniGrafu);

  }

  backtrack(seznamPromennych: Array<Promenna>, pozadovanychReseni: number, postupTvoreniGrafu): Array<KrokAlgoritmu>  {
    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && (!pozadovanychReseni || pocetReseni < pozadovanychReseni)) {
      var zpracovavanaPromenna = seznamPromennych[promenna];
      zpracovavanaPromenna.pozice++;
      if (zpracovavanaPromenna.pozice > zpracovavanaPromenna.domena.length - 1) {
        zpracovavanaPromenna.pozice = -1;
        promenna--;
        continue;
      }

      var krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = AlgoritmusUtils.najdiRodice(seznamPromennych[promenna - 1], postupTvoreniGrafu);
      postupTvoreniGrafu.push(krokAlgoritmu);

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.backtracking.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);

      lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.backtracking.kontrolaOmezeni';
      krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.typ = TypKroku.popis;
      krokAlgoritmu.popis.push(lokalizovanaZprava);
      postupTvoreniGrafu.push(krokAlgoritmu);

      const poruseneOmezeni = AlgoritmusUtils.porovnej(zpracovavanaPromenna, seznamPromennych);
      if (poruseneOmezeni) {
        krokAlgoritmu = new KrokAlgoritmu();
        krokAlgoritmu.typ = TypKroku.popis;
        krokAlgoritmu.popis.push(poruseneOmezeni);
        postupTvoreniGrafu.push(krokAlgoritmu);
        if (zpracovavanaPromenna.domena.length > zpracovavanaPromenna.pozice + 1) {
          lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backtracking.pokracovaniPrirazeni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.deadend;
          postupTvoreniGrafu.push(krokAlgoritmu);
        } else {
          lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backtracking.deadend';
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.deadend;
          postupTvoreniGrafu.push(krokAlgoritmu);
        }
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backtracking.reseni';
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.reseni;
          postupTvoreniGrafu.push(krokAlgoritmu);
        } else {
          promenna++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backtracking.uzel';
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          postupTvoreniGrafu.push(krokAlgoritmu);
        }
      }
    }
    return postupTvoreniGrafu;
  }
}
