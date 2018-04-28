import {Promenna, KrokAlgoritmu, LokalizovanaZprava, StavKroku} from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';

@Injectable()
export class BacktrackingService implements Algoritmus {
  nazev = 'popis.backtracking.nazev';
  definice = 'popis.backtracking.definice';

  constructor() { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni:  number): Array<KrokAlgoritmu> {
    // TODO Test ze zadani
//    seznamPromennych = [];
//    seznamPromennych.push(new Promenna('A', [1, 2, 3], [new Omezeni(TypOmezeni.nerovno, ['B', 'C', 'D', 'G'], null)]));
//    seznamPromennych.push(new Promenna('B', [2, 3], [new Omezeni(TypOmezeni.nerovno, ['F'], null)]));
//    seznamPromennych.push(new Promenna('C', [1, 2], [new Omezeni(TypOmezeni.nerovno, ['G'], null)]));
//    seznamPromennych.push(new Promenna('D', [1, 2], [new Omezeni(TypOmezeni.nerovno, ['E', 'G'], null)]));
//    seznamPromennych.push(new Promenna('E', [2, 3], [new Omezeni(TypOmezeni.nerovno, ['F', 'G'], null)]));
//    seznamPromennych.push(new Promenna('F', [1, 3, 4]));
//    seznamPromennych.push(new Promenna('G', [1, 2]));

    AlgoritmusUtils.prevedOmezeni(seznamPromennych);
    
    var postupTvoreniGrafu = new Array();
    var startKrok = new KrokAlgoritmu();
    startKrok.hodnota = 'Backtracking'; 
    startKrok.popis.push(new LokalizovanaZprava('popis.backtracking.start'));
    postupTvoreniGrafu.push(startKrok);    

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

      const krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = AlgoritmusUtils.najdiRodice(seznamPromennych[promenna - 1], postupTvoreniGrafu);
      postupTvoreniGrafu.push(krokAlgoritmu);


      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.backtracking.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);

      const poruseneOmezeni = AlgoritmusUtils.porovnej(zpracovavanaPromenna, seznamPromennych);
      if (poruseneOmezeni) {
        for (var i = 0; i < poruseneOmezeni.length; i++) {
          krokAlgoritmu.popis.push(poruseneOmezeni[i]);
        }
      }
      if (poruseneOmezeni) {
        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.backtracking.deadend';
        lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
        krokAlgoritmu.popis.push(lokalizovanaZprava);
        krokAlgoritmu.stav = StavKroku.deadend;
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backtracking.reseni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.reseni;
        } else {
          promenna++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backtracking.uzel';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
        }
      }

    }

    return postupTvoreniGrafu;
  }

}
