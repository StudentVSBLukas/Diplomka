import {Promenna, LokalizovanaZprava, KrokAlgoritmu} from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';

@Injectable()
export class BackjumpingService implements Algoritmus {
  nazev = 'popis.backjumping.nazev';
  definice = 'popis.backjumping.definice';

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
    startKrok.hodnota = 'Backjumping';
    startKrok.popis.push(new LokalizovanaZprava('popis.backjumping.start'));
    postupTvoreniGrafu.push(startKrok);


    var leafend = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      leafend.push(false);
    }
    var pocetReseni = 0;
    var promenna = 0;
    while ((!pozadovanychReseni || pocetReseni < pozadovanychReseni)) {
      var zpracovavanaPromenna = seznamPromennych[promenna];
      if (promenna === 0) {
        zpracovavanaPromenna.pozice++;
        if (zpracovavanaPromenna.pozice === zpracovavanaPromenna.domena.length) {
          break;
        }
        var krokAlgoritmu2 = new KrokAlgoritmu();
        krokAlgoritmu2.nazev = zpracovavanaPromenna.nazev;
        krokAlgoritmu2.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
        krokAlgoritmu2.rodic = 0;
        postupTvoreniGrafu.push(krokAlgoritmu2);


        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.backjumping.prirazeni';
        lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu2.nazev, 'hodnota': krokAlgoritmu2.hodnota }
        krokAlgoritmu2.popis.push(lokalizovanaZprava);

        if (promenna === seznamPromennych.length - 1) {
          pocetReseni++;
          krokAlgoritmu2.stav = 'reseni';
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backjumping.reseni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu2.nazev, 'hodnota': krokAlgoritmu2.hodnota }
          krokAlgoritmu2.popis.push(lokalizovanaZprava);
          leafend[promenna] = true;
        } else {
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backjumping.uzel';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu2.nazev, 'hodnota': krokAlgoritmu2.hodnota }
          krokAlgoritmu2.popis.push(lokalizovanaZprava);
          leafend[promenna] = true;
          promenna++;
        }
      } else {
        zpracovavanaPromenna.pozice++;

        var krokAlgoritmu2 = new KrokAlgoritmu();
        krokAlgoritmu2.nazev = zpracovavanaPromenna.nazev;
        krokAlgoritmu2.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
        krokAlgoritmu2.rodic = 0;


        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.backjumping.prirazeni';
        lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu2.nazev, 'hodnota': krokAlgoritmu2.hodnota }
        krokAlgoritmu2.popis.push(lokalizovanaZprava);


        if (zpracovavanaPromenna.pozice === zpracovavanaPromenna.domena.length) {
          zpracovavanaPromenna.pozice = -1;
          var backjump = 0;
          if (leafend[promenna]) {
            leafend[promenna] = false;
            promenna--;
            var lokalizovanaZprava = new LokalizovanaZprava();
            lokalizovanaZprava.klic = 'popis.backjumping.deadend';
            lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu2.nazev, 'hodnota': krokAlgoritmu2.hodnota }
            krokAlgoritmu2.popis.push(lokalizovanaZprava);
            continue;
          }
          if (zpracovavanaPromenna.omezeni.length === 0) {
            backjump = promenna - 1;
          } else {
            for (var i = 0; i < zpracovavanaPromenna.omezeni.length; i++) {
              const omezeni = zpracovavanaPromenna.omezeni[i];
              for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
                const jump = AlgoritmusUtils.index(seznamPromennych, omezeni.omezeniProPromennou[j]);
                backjump = Math.max(backjump, jump);
              }
            }
          }
          for (var i = promenna; i > backjump; i--) {
            seznamPromennych[i].pozice = -1;
            leafend[i] = false;
          }
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backjumping.backjump';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu2.nazev, 'hodnota': krokAlgoritmu2.hodnota }
          krokAlgoritmu2.popis.push(lokalizovanaZprava);
          promenna = backjump;
        } else {
          var krokAlgoritmu2 = new KrokAlgoritmu();
          krokAlgoritmu2.nazev = zpracovavanaPromenna.nazev;
          krokAlgoritmu2.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
          krokAlgoritmu2.rodic = AlgoritmusUtils.najdiRodice(seznamPromennych[promenna - 1], postupTvoreniGrafu);
          const poruseneOmezeni = AlgoritmusUtils.porovnej(zpracovavanaPromenna, seznamPromennych);
          if (poruseneOmezeni) {
            for (var i = 0; i < poruseneOmezeni.length; i++) {
              krokAlgoritmu2.popis.push(poruseneOmezeni[i]);
            }
          }
          if (!poruseneOmezeni) {
            if (promenna === seznamPromennych.length - 1) {
              pocetReseni++;
              krokAlgoritmu2.stav = 'reseni';
              var lokalizovanaZprava = new LokalizovanaZprava();
              lokalizovanaZprava.klic = 'popis.backjumping.reseni';
              lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu2.nazev, 'hodnota': krokAlgoritmu2.hodnota }
              krokAlgoritmu2.popis.push(lokalizovanaZprava);
              leafend[promenna] = true;
            } else {
              var lokalizovanaZprava = new LokalizovanaZprava();
              lokalizovanaZprava.klic = 'popis.backjumping.uzel';
              lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu2.nazev, 'hodnota': krokAlgoritmu2.hodnota }
              krokAlgoritmu2.popis.push(lokalizovanaZprava);
              leafend[promenna] = true;
              promenna++;
            }
            postupTvoreniGrafu.push(krokAlgoritmu2);
          } else {
            var lokalizovanaZprava = new LokalizovanaZprava();
            lokalizovanaZprava.klic = 'popis.backjumping.deadendNedokonceny';
            lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu2.nazev, 'hodnota': krokAlgoritmu2.hodnota }
            krokAlgoritmu2.popis.push(lokalizovanaZprava);
            krokAlgoritmu2.stav = 'deadend';
            postupTvoreniGrafu.push(krokAlgoritmu2);

          }
        }
      }
    }
    return postupTvoreniGrafu;
  }
}
