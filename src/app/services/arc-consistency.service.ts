import {Promenna, KrokAlgoritmu, LokalizovanaZprava, TypKroku, TypOmezeni, StavKroku} from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';
import { BacktrackingService } from './backtracking.service';

@Injectable()
export class ArcConsistencyService implements Algoritmus {
  nazev = 'popis.arcConsistency.nazev';
  definice = 'popis.arcConsistency.definice';

  constructor(private backtracking: BacktrackingService) { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni:  number): Array<KrokAlgoritmu> {
    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var startKrok = new KrokAlgoritmu();
    startKrok.hodnota = 'Arc consistency';
    startKrok.popis.push(new LokalizovanaZprava('popis.arcConsistency.start'));
    postupTvoreniGrafu.push(startKrok);


    var zmeneno;
    let selhani;
    for (var i = 0; i < seznamPromennych.length; i++) {
      zmeneno = false;
      var promenna = seznamPromennych[i];
      for (var j = 0; j < promenna.omezeni.length; j++) {
        switch (promenna.omezeni[j].typOmezeni) {
          case TypOmezeni.mensi:
            for (var k = 0; k < promenna.omezeni[j].omezeniProPromennou.length; k++) {
              var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, promenna.omezeni[j].omezeniProPromennou[k]);
              let krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              selhani = this._arcConsistencyLesser(promenna, porovnavanaPromenna);
              switch (selhani[0]) {
                case 'uprava':
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                    postupTvoreniGrafu.push(krokAlgoritmu);
                  }
                  break;
                case 'prazdna domena':
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
              
              krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              selhani = this._arcConsistencyGreater(porovnavanaPromenna, promenna);
              switch (selhani[0]) {
                case 'uprava':
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                    postupTvoreniGrafu.push(krokAlgoritmu);
                  }
                  break;
                case 'prazdna domena':
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
            }
            break;
          case TypOmezeni.vetsi:
            for (var k = 0; k < promenna.omezeni[j].omezeniProPromennou.length; k++) {
              var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, promenna.omezeni[j].omezeniProPromennou[k]);
              let krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              selhani = this._arcConsistencyGreater(promenna, porovnavanaPromenna);
              switch (selhani[0]) {
                case 'uprava':
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                    postupTvoreniGrafu.push(krokAlgoritmu);
                  }
                  break;
                case 'prazdna domena':
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
              
              krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              selhani = this._arcConsistencyLesser(porovnavanaPromenna, promenna);
              switch (selhani[0]) {
                case 'uprava':
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                    postupTvoreniGrafu.push(krokAlgoritmu);
                  }
                  break;
                case 'prazdna domena':
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
            }
            break;
          case TypOmezeni.rovno:
            for (var k = 0; k < promenna.omezeni[j].omezeniProPromennou.length; k++) {
              var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, promenna.omezeni[j].omezeniProPromennou[k]);
              let krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              selhani = this._arcConsistencyEqual(promenna, porovnavanaPromenna);
              switch (selhani[0]) {
                case 'uprava':
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                    postupTvoreniGrafu.push(krokAlgoritmu);
                  }
                  break;
                case 'prazdna domena':
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
              
              krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              selhani = this._arcConsistencyEqual(porovnavanaPromenna, promenna);
              switch (selhani[0]) {
                case 'uprava':
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                    postupTvoreniGrafu.push(krokAlgoritmu);
                  }
                  break;
                case 'prazdna domena':
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
            }
            break;
          case TypOmezeni.nerovno:
            for (var k = 0; k < promenna.omezeni[j].omezeniProPromennou.length; k++) {
              var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, promenna.omezeni[j].omezeniProPromennou[k]);
              let krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              selhani = this._arcConsistencyNotEqual(promenna, porovnavanaPromenna);
              switch (selhani[0]) {
                case 'uprava':
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                    postupTvoreniGrafu.push(krokAlgoritmu);
                  }
                  break;
                case 'prazdna domena':
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
              
              krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              selhani = this._arcConsistencyNotEqual(porovnavanaPromenna, promenna);
              switch (selhani[0]) {
                case 'uprava':
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                    postupTvoreniGrafu.push(krokAlgoritmu);
                  }
                  break;
                case 'prazdna domena':
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
            }
            break;
          case TypOmezeni.povoleno:
            var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, promenna.omezeni[j].omezeniProPromennou[0]);
            let krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            selhani = this._arcConsistencyPovoleneDvojice(promenna, porovnavanaPromenna, 0, 1, j, 1);
            switch (selhani[0]) {
              case 'uprava':
                for (var l = 0; l < selhani[1].length; l++) {
                  krokAlgoritmu.popis.push(selhani[1][l]);
                  postupTvoreniGrafu.push(krokAlgoritmu);
                }
                break;
              case 'prazdna domena':
                return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
            }
            
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            selhani = this._arcConsistencyPovoleneDvojice(promenna, porovnavanaPromenna, 1, 0, j, 2);
            switch (selhani[0]) {
              case 'uprava':
                for (var l = 0; l < selhani[1].length; l++) {
                  krokAlgoritmu.popis.push(selhani[1][l]);
                  postupTvoreniGrafu.push(krokAlgoritmu);
                }
                break;
              case 'prazdna domena':
                return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
            }
            break;
          case TypOmezeni.zakazano:
            var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, promenna.omezeni[j].omezeniProPromennou[0]);
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            selhani = this._arcConsistencyZakazanDvojice(promenna, porovnavanaPromenna, 0, j, 1);
            switch (selhani[0]) {
              case 'uprava':
                for (var l = 0; l < selhani[1].length; l++) {
                  krokAlgoritmu.popis.push(selhani[1][l]);
                  postupTvoreniGrafu.push(krokAlgoritmu);
                }
                break;
              case 'prazdna domena':
                return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
            }
            
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            selhani = this._arcConsistencyZakazanDvojice(promenna, porovnavanaPromenna, 0, j, 2);
            switch (selhani[0]) {
              case 'uprava':
                for (var l = 0; l < selhani[1].length; l++) {
                  krokAlgoritmu.popis.push(selhani[1][l]);
                  postupTvoreniGrafu.push(krokAlgoritmu);
                }
                break;
              case 'prazdna domena':
                return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
            }
            break;
        }
      }
      if (zmeneno) {
        i = -1;
      }
    }

    var backtrackingPostup = this.backtracking.run(seznamPromennych, pozadovanychReseni);
    return postupTvoreniGrafu.concat(backtrackingPostup);
  }

  // a = prvni promenna prozkoumavanych prvku, b = ddruha promenna
  _arcConsistencyLesser(promennaA, promennaB) {
    var remove;
    var popisUpravy = new Array<LokalizovanaZprava>();
    var provedlaSeUprava = 'nic';
    for (var i = 0; i < promennaA.domena.length; i++) {
      remove = true;
      for (var j = 0; j < promennaB.domena.length; j++) {
        if (promennaA.domena[i] < promennaB.domena[j]) {
          remove = false;
          break;
        }
      }
      if (remove) {
        promennaA.domena.splice(i, 1);
        i--;
        provedlaSeUprava = 'uprava';
        var zprava = new LokalizovanaZprava();
        zprava.klic = 'popis.arcConsistency.prazdnaDomena';
        zprava.parametry = { 'nazev': promennaA.nazev, 'hodnota': promennaA.domena[i], 'porovnavanaPromenna': promennaB.nazev, 'typ': TypOmezeni.rovno }
        popisUpravy.push(zprava)
        if (promennaA.domena.length === 0) {
          var zprava = new LokalizovanaZprava();
          zprava.klic = 'popis.arcConsistency.prazdnaDomena';
          zprava.parametry = { 'nazev': promennaA.nazev }
          popisUpravy.push(zprava)
          return ['prazdna domena', popisUpravy];
        }
      }
    }
    return [provedlaSeUprava, popisUpravy]
  }

  _arcConsistencyGreater(promennaA, promennaB) {
    var remove;
    var popisUpravy = new Array<LokalizovanaZprava>();
    var provedlaSeUprava = 'nic';
    for (var i = 0; i < promennaA.domena.length; i++) {
      remove = true;
      for (var j = 0; j < promennaB.domena.length; j++) {
        if (promennaA.domena[i] > promennaB.domena[j]) {
          remove = false;
          break;
        }
      }
      if (remove) {
        promennaA.domena.splice(i, 1);
        i--;
        provedlaSeUprava = 'uprava';
        var zprava = new LokalizovanaZprava();
        zprava.klic = 'popis.arcConsistency.prazdnaDomena';
        zprava.parametry = { 'nazev': promennaA.nazev, 'hodnota': promennaA.domena[i], 'porovnavanaPromenna': promennaB.nazev, 'typ': TypOmezeni.rovno }
        popisUpravy.push(zprava)
        if (promennaA.domena.length === 0) {
          var zprava = new LokalizovanaZprava();
          zprava.klic = 'popis.arcConsistency.prazdnaDomena';
          zprava.parametry = { 'nazev': promennaA.nazev }
          popisUpravy.push(zprava)
          return ['prazdna domena', popisUpravy];
        }
      }
    }
    return [provedlaSeUprava, popisUpravy]
  }

  _arcConsistencyEqual(promennaA, promennaB) {
    var remove;
    var popisUpravy = new Array<LokalizovanaZprava>();
    var provedlaSeUprava = 'nic';
    for (var i = 0; i < promennaA.domena.length; i++) {
      remove = true;
      for (var j = 0; j < promennaB.domena.length; j++) {
        if (promennaA.domena[i] === promennaB.domena[j]) {
          remove = false;
          break;
        }
      }
      if (remove) {
        promennaA.domena.splice(i, 1);
        i--;
        provedlaSeUprava = 'uprava';
        var zprava = new LokalizovanaZprava();
        zprava.klic = 'popis.arcConsistency.prazdnaDomena';
        zprava.parametry = { 'nazev': promennaA.nazev, 'hodnota': promennaA.domena[i], 'porovnavanaPromenna': promennaB.nazev, 'typ': TypOmezeni.rovno }
        popisUpravy.push(zprava)
        if (promennaA.domena.length === 0) {
          var zprava = new LokalizovanaZprava();
          zprava.klic = 'popis.arcConsistency.prazdnaDomena';
          zprava.parametry = { 'nazev': promennaA.nazev }
          popisUpravy.push(zprava)
          return ['prazdna domena', popisUpravy];
        }
      }
    }
    return [provedlaSeUprava, popisUpravy]
  }

  _arcConsistencyNotEqual(promennaA, promennaB) {
    var remove;
    var popisUpravy = new Array<LokalizovanaZprava>();
    var provedlaSeUprava = 'nic';
    for (var i = 0; i < promennaA.domena.length; i++) {
      remove = true;
      for (var j = 0; j < promennaB.domena.length; j++) {
        if (promennaA.domena[i] !== promennaB.domena[j]) {
          remove = false;
          break;
        }
      }
      if (remove) {
        promennaA.domena.splice(i, 1);
        i--;
        provedlaSeUprava = 'uprava';
        var zprava = new LokalizovanaZprava();
        zprava.klic = 'popis.arcConsistency.prazdnaDomena';
        zprava.parametry = { 'nazev': promennaA.nazev, 'hodnota': promennaA.domena[i], 'porovnavanaPromenna': promennaB.nazev, 'typ': '!=' }
        popisUpravy.push(zprava)
        if (promennaA.domena.length === 0) {
          var zprava = new LokalizovanaZprava();
          zprava.klic = 'popis.arcConsistency.prazdnaDomena';
          zprava.parametry = { 'nazev': promennaA.nazev }
          popisUpravy.push(zprava)
          return ['prazdna domena', popisUpravy];
        }
      }
    }
    return [provedlaSeUprava, popisUpravy]
  }

  // a = prvni promenna prozkoumavanych prvku, b = druha promenna, index = pro
  // ktere omezeni se metoda vykonava, c,d jsou indexy pro hodnotu omezeni pro
  // prvni volani jsou hodnoty c=0,d=1, pro druhe volani jsou tz=tyto hodnoty
  // obracene
  _arcConsistencyPovoleneDvojice(promennaA, promennaB, c, d, index, volani) {
    var remove, pomoc;
    var vlastniDvojice = [];
    var indexyHodnot = [];
    if (volani === 1) {
      var domenaA = promennaA.domena;
      var domenaB = promennaB.domena;
    } else {
      var domenaA = promennaB.domena;
      var domenaB = promennaA.domena;
    }

    for (var i = 0; i < promennaA.omezeni[index].hodnotyOmezeni.length; i++) {
      vlastniDvojice.push(promennaA.omezeni[index].hodnotyOmezeni[i][c]);
    }

    for (var i = 0; i < domenaA.length; i++) {
      remove = true;
      indexyHodnot = this._indexOfAll(vlastniDvojice, domenaA[i]);
      if (indexyHodnot.length > 0) {
        for (var j = 0; j < indexyHodnot.length; j++) {
          pomoc = promennaA.omezeni[index].hodnotyOmezeni[indexyHodnot[j]][d];
          if (domenaB.indexOf(pomoc) !== -1) {
            remove = false;
            break;
          }
        }
      }
      if (remove && volani === 1) {
        promennaA.domena.splice(i, 1);
        i--;
        if (promennaA.domena.length === 0) {
          return 'popis.arcConsistency.prazdnaDomena';
        }
      } else if (remove && volani === 2) {
        promennaB.domena.splice(i, 1);
        i--;
        if (promennaB.domena.length === 0) {
          return 'popis.arcConsistency.prazdnaDomena';
        }
      }
    }
  }

  _arcConsistencyZakazanDvojice(promennaA, promennaB, d, index, volani) {
    var remove, pomoc;
    var vlastniDvojice = [];
    var indexyHodnot = [];
    var povoleneDvojice = [];
    if (volani === 1) {
      var domenaA = promennaA.domena;
      var domenaB = promennaB.domena;
    } else {
      var domenaA = promennaB.domena;
      var domenaB = promennaA.domena;
    }

    for (var i = 0; i < domenaA.length; i++) {
      for (var j = 0; j < domenaB.length; j++) {
        povoleneDvojice.push([domenaA[i], domenaB[j]]);
      }
    }

    if (volani === 1) {
      for (var i = 0; i < promennaA.omezeni[index].hodnotyOmezeni.length; i++) {
        vlastniDvojice.push([promennaA.omezeni[index].hodnotyOmezeni[i][0], promennaA.omezeni[index].hodnotyOmezeni[i][1]]);
      }
    } else if (volani === 2) {
      for (var i = 0; i < promennaA.omezeni[index].hodnotyOmezeni.length; i++) {
        vlastniDvojice.push([promennaA.omezeni[index].hodnotyOmezeni[i][1], promennaA.omezeni[index].hodnotyOmezeni[i][0]]);
      }
    }

    for (var i = 0; i < povoleneDvojice.length; i++) {
      for (var j = 0; j < vlastniDvojice.length; j++) {
        if (vlastniDvojice[j][0] === povoleneDvojice[i][0] && vlastniDvojice[j][1] === povoleneDvojice[i][1]) {
          povoleneDvojice.splice(i, 1);
          i--;
          break;
        }
      }
    }

    vlastniDvojice = [];
    for (var i = 0; i < povoleneDvojice.length; i++) {
      vlastniDvojice.push(povoleneDvojice[i][0]);
      povoleneDvojice[i] = povoleneDvojice[i][1];
    }

    for (var i = 0; i < domenaA.length; i++) {
      remove = true;
      indexyHodnot = this._indexOfAll(vlastniDvojice, domenaA[i]);
      if (indexyHodnot.length > 0) {
        for (var j = 0; j < indexyHodnot.length; j++) {
          pomoc = povoleneDvojice[indexyHodnot[j]];
          if (domenaB.indexOf(pomoc) !== -1) {
            remove = false;
            break;
          }
        }
      }
      if (remove && volani === 1) {
        promennaA.domena.splice(i, 1);
        if (promennaA.domena.length === 0) {
          return 'popis.arcConsistency.prazdnaDomena';
        }
        i--;
      } else if (remove && volani === 2) {
        promennaB.domena.splice(i, 1);
        if (promennaB.domena.length === 0) {
          return 'popis.arcConsistency.prazdnaDomena';
        }
        i--;
      }
    }
  }

  _arcConsistencyFail(seznamPromennych: Array<Promenna>, promenna: Promenna, popis: string) {
    const krokAlgoritmu = new KrokAlgoritmu();
    // krokAlgoritmu.popis = popis;
    krokAlgoritmu.nazev = promenna.nazev;
    krokAlgoritmu.hodnota = null;
    krokAlgoritmu.rodic = 0;
    krokAlgoritmu.stav = StavKroku.deadend;

    return [krokAlgoritmu];
  }

  _indexOfAll(array, symbol) {
    var indexy = [];
    var idx = array.indexOf(symbol);
    while (idx !== -1) {
      indexy.push(idx);
      idx = array.indexOf(symbol, idx + 1);
    }
    return indexy;
  }

}
