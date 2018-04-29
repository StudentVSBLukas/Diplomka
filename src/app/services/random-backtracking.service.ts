import { Promenna, KrokAlgoritmu, LokalizovanaZprava, StavKroku, TypOmezeni, Omezeni } from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';
import { TypKroku } from '../data-model';

@Injectable()
export class RandomBacktrackingService implements Algoritmus {
  nazev = 'popis.random.nazev';
  definice = 'popis.random.definice';

  constructor() { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni: number): Array<KrokAlgoritmu> {
    // TODO Test ze zadani
    //    seznamPromennych = [];
    //    // seznamPromennych.push(new Promenna("A", [1,2,3,4,5], []))
    //    // seznamPromennych.push(new Promenna("B", [1,2,3,4,5], [new Omezeni("=", ["A"], null)]))
    //    seznamPromennych.push(new Promenna('A', [1, 2], []));
    //    seznamPromennych.push(new Promenna('B', [4, 5], [new Omezeni(TypOmezeni.rovno, ['A'], null)]));
    //    seznamPromennych.push(new Promenna('C', [1, 2, 3, 4, 5], []));
    //    seznamPromennych.push(new Promenna('D', [1, 2, 3, 4, 5], []));
    //    seznamPromennych.push(new Promenna('E', [1, 2, 3, 4, 5], [new Omezeni(TypOmezeni.vetsi, ['A'], null)]));
    //    //AlgoritmusUtils.prevedOmezeni(seznamPromennych);
    //    seznamPromennych[0].zalohaDomeny = seznamPromennych[0].domena.slice();
    //    seznamPromennych[1].zalohaDomeny = seznamPromennych[1].domena.slice();
    //    seznamPromennych[2].zalohaDomeny = seznamPromennych[2].domena.slice();
    //    seznamPromennych[3].zalohaDomeny = seznamPromennych[3].domena.slice();
    //    seznamPromennych[4].zalohaDomeny = seznamPromennych[4].domena.slice();

    // seznamPromennych = [];
    // seznamPromennych.push(new Promenna('A', [1, 2, 3], [new Omezeni(TypOmezeni.nerovno, ['B', 'C', 'D', 'G'], null)]));
    // seznamPromennych.push(new Promenna('B', [2, 3], [new Omezeni(TypOmezeni.nerovno, ['F'], null)]));
    // seznamPromennych.push(new Promenna('C', [1, 2], [new Omezeni(TypOmezeni.nerovno, ['G'], null)]));
    // seznamPromennych.push(new Promenna('D', [1, 2], [new Omezeni(TypOmezeni.nerovno, ['E', 'G'], null)]));
    // seznamPromennych.push(new Promenna('E', [2, 3], [new Omezeni(TypOmezeni.nerovno, ['F', 'G'], null)]));
    // seznamPromennych.push(new Promenna('F', [1, 3, 4]));
    // seznamPromennych.push(new Promenna('G', [1, 2]));

    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var startKrok = new KrokAlgoritmu();
    startKrok.hodnota = 'Random backtracking';
    startKrok.popis.push(new LokalizovanaZprava('popis.random.start'));
    postupTvoreniGrafu.push(startKrok);


    // Zaloha domeny - vzdy se vracime k vstupnimu stavu
    seznamPromennych.forEach(
      (p: Promenna) => p.zalohaDomeny = p.domena.slice()
    );

    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && (!pozadovanychReseni || pocetReseni < pozadovanychReseni)) {
      var zpracovavanaPromenna = seznamPromennych[promenna];
      zpracovavanaPromenna.pozice = Math.floor(Math.random() * zpracovavanaPromenna.domena.length);
      if (zpracovavanaPromenna.domena.length == 0) {
        zpracovavanaPromenna.pozice = -1;
        zpracovavanaPromenna.domena = zpracovavanaPromenna.zalohaDomeny.slice();
        promenna--;
        const vracenaPromenna = seznamPromennych[promenna];
        if (vracenaPromenna) { vracenaPromenna.domena.splice(vracenaPromenna.pozice, 1); }
        continue;
      }

      var krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = AlgoritmusUtils.najdiRodice(seznamPromennych[promenna - 1], postupTvoreniGrafu);
      postupTvoreniGrafu.push(krokAlgoritmu);

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.random.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);

      lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.random.kontrolaOmezeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
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
          lokalizovanaZprava.klic = 'popis.random.pokracovaniPrirazeni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.stav = StavKroku.deadend;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          postupTvoreniGrafu.push(krokAlgoritmu);
        } else {
          lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.random.deadend';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.deadend;
          postupTvoreniGrafu.push(krokAlgoritmu);
        }
        zpracovavanaPromenna.domena.splice(zpracovavanaPromenna.pozice, 1);
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.random.reseni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.reseni;
          postupTvoreniGrafu.push(krokAlgoritmu);
          zpracovavanaPromenna.domena.splice(zpracovavanaPromenna.pozice, 1);
        } else {
          promenna++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.random.uzel';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
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

