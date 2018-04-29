import { Promenna, LokalizovanaZprava, KrokAlgoritmu, StavKroku, Omezeni, TypOmezeni, TypKroku } from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';

@Injectable()
export class BackjumpingService implements Algoritmus {
  nazev = 'popis.backjumping.nazev';
  definice = 'popis.backjumping.definice';

  constructor() { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni: number): Array<KrokAlgoritmu> {
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
        var krokAlgoritmu = new KrokAlgoritmu();
        krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
        krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
        krokAlgoritmu.rodic = 0;
        postupTvoreniGrafu.push(krokAlgoritmu);


        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.backjumping.prirazeni';
        lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
        krokAlgoritmu.popis.push(lokalizovanaZprava);

        if (promenna === seznamPromennych.length - 1) {
          pocetReseni++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backjumping.reseni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.reseni;
          postupTvoreniGrafu.push(krokAlgoritmu);
          leafend[promenna] = true;
        } else {
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backjumping.uzel';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          postupTvoreniGrafu.push(krokAlgoritmu);
          leafend[promenna] = true;
          promenna++;
        }
      } else {
        zpracovavanaPromenna.pozice++;

        if (zpracovavanaPromenna.pozice === zpracovavanaPromenna.domena.length) {
          zpracovavanaPromenna.pozice = -1;
          var backjump = 0;
          lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backjumping.jestliBackjumpu';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.deadend;
          postupTvoreniGrafu.push(krokAlgoritmu);
          if (leafend[promenna]) {
            leafend[promenna] = false;
            promenna--;
            lokalizovanaZprava = new LokalizovanaZprava();
            lokalizovanaZprava.klic = 'popis.backjumping.backjumpNe';
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            krokAlgoritmu.popis.push(lokalizovanaZprava);
            krokAlgoritmu.stav = StavKroku.deadend;
            postupTvoreniGrafu.push(krokAlgoritmu);
            continue;
          }
          if (zpracovavanaPromenna.omezeni.length === 0) {
            backjump = promenna - 1;
            lokalizovanaZprava = new LokalizovanaZprava();
            lokalizovanaZprava.klic = 'popis.backjumping.backjumpNeniOmezeni';
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            krokAlgoritmu.popis.push(lokalizovanaZprava);
            krokAlgoritmu.stav = StavKroku.deadend;
            postupTvoreniGrafu.push(krokAlgoritmu);
          } else {
            lokalizovanaZprava = new LokalizovanaZprava();
            lokalizovanaZprava.klic = 'popis.backjumping.backjumpAno';
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            krokAlgoritmu.popis.push(lokalizovanaZprava);
            krokAlgoritmu.stav = StavKroku.deadend;
            postupTvoreniGrafu.push(krokAlgoritmu);
            for (var i = 0; i < zpracovavanaPromenna.omezeni.length; i++) {
              const omezeni = zpracovavanaPromenna.omezeni[i];
              for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
                const jump = AlgoritmusUtils.index(seznamPromennych, omezeni.omezeniProPromennou[j]);
                backjump = Math.max(backjump, jump);
              }
            }
            lokalizovanaZprava = new LokalizovanaZprava();
            lokalizovanaZprava.klic = 'popis.backjumping.backjumpNalezenaPromenna';
            lokalizovanaZprava.parametry = { 'nazev': seznamPromennych[backjump].nazev }
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            krokAlgoritmu.popis.push(lokalizovanaZprava);
            krokAlgoritmu.stav = StavKroku.deadend;
            postupTvoreniGrafu.push(krokAlgoritmu);
          }
          for (var i = promenna; i > backjump; i--) {
            seznamPromennych[i].pozice = -1;
            leafend[i] = false;
          }
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backjumping.backjumpNastaveniPozic';
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.deadend;
          postupTvoreniGrafu.push(krokAlgoritmu);
          promenna = backjump;
        } else {

          var krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
          krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
          krokAlgoritmu.typ = TypKroku.akce;

          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backjumping.prirazeni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.rodic = AlgoritmusUtils.najdiRodice(seznamPromennych[promenna - 1], postupTvoreniGrafu);
          postupTvoreniGrafu.push(krokAlgoritmu);


          var krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
          krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
          krokAlgoritmu.rodic = AlgoritmusUtils.najdiRodice(seznamPromennych[promenna - 1], postupTvoreniGrafu);

          lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backjumping.kontrolaOmezeni';
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          postupTvoreniGrafu.push(krokAlgoritmu);

          const poruseneOmezeni = AlgoritmusUtils.porovnej(zpracovavanaPromenna, seznamPromennych);
          if (!poruseneOmezeni) {
              if (promenna === seznamPromennych.length - 1) {
              pocetReseni++;
              var lokalizovanaZprava = new LokalizovanaZprava();
              lokalizovanaZprava.klic = 'popis.backjumping.reseni';
              krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              krokAlgoritmu.popis.push(lokalizovanaZprava);
              krokAlgoritmu.stav = StavKroku.reseni;
              postupTvoreniGrafu.push(krokAlgoritmu);
              leafend[promenna] = true;
            } else {
              var lokalizovanaZprava = new LokalizovanaZprava();
              lokalizovanaZprava.klic = 'popis.backjumping.uzel';
              krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              krokAlgoritmu.popis.push(lokalizovanaZprava);
              postupTvoreniGrafu.push(krokAlgoritmu);
              leafend[promenna] = true;
              promenna++;
            }
            postupTvoreniGrafu.push(krokAlgoritmu);
          } else {
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            krokAlgoritmu.popis.push(poruseneOmezeni);
            postupTvoreniGrafu.push(krokAlgoritmu);
              if (zpracovavanaPromenna.domena.length > zpracovavanaPromenna.pozice + 1) {
              lokalizovanaZprava = new LokalizovanaZprava();
              lokalizovanaZprava.klic = 'popis.backjumping.pokracovaniPrirazeni';
              krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              krokAlgoritmu.popis.push(lokalizovanaZprava);
              krokAlgoritmu.stav = StavKroku.deadend;
              postupTvoreniGrafu.push(krokAlgoritmu);
            } else {
              lokalizovanaZprava = new LokalizovanaZprava();
              lokalizovanaZprava.klic = 'popis.backjumping.deadend';
              krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              krokAlgoritmu.popis.push(lokalizovanaZprava);
              krokAlgoritmu.stav = StavKroku.deadend;
              postupTvoreniGrafu.push(krokAlgoritmu);
            }
          }
        }
      }
    }
    return postupTvoreniGrafu;
  }
}
