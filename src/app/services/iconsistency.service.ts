import {Promenna, KrokAlgoritmu, LokalizovanaZprava, TypOmezeni} from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';
import { BacktrackingService } from './backtracking.service';

@Injectable()
export class IconsistencyService implements Algoritmus {
  nazev = 'popis.iConsistency.nazev';
  definice = 'popis.iConsistency.definice';

  constructor(private backtracking: BacktrackingService) { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni:  number, iPocet: number): Array<KrokAlgoritmu> {
    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var startKrok = new KrokAlgoritmu();
    startKrok.hodnota = 'iConsistency';
    startKrok.popis.push(new LokalizovanaZprava('popis.iConsistency.start'));
    postupTvoreniGrafu.push(startKrok);


    if (iPocet < 1) {
      // TODO CHYBOVA HLASKA ZE CISLO MUSI BYT ASPON 1
    }
    //Zjisteni u kazde promenne, s jakymi promennymi musi splnovat omezeni
    var seznamVsechPromennychOmezeni = [];
    for (var i = 0; i < seznamPromennych.length; i++) {
      var promenna = seznamPromennych[i];
      var seznamPromennychproOmezeni = [];
      for (var j = 0; j < promenna.omezeni.length; j++) {
      var typOmezeni = promenna.omezeni[j].typOmezeni;
        for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
          if (seznamPromennychproOmezeni.indexOf(promenna.omezeni[j].omezeniProPromennou[k]) == -1) {
            seznamPromennychproOmezeni.push(promenna.omezeni[j].omezeniProPromennou[k]);
          }
        }
      }
      seznamVsechPromennychOmezeni.push(seznamPromennychproOmezeni);
    }
    while (this._iConsistencyKontrola(iPocet, seznamPromennych, seznamVsechPromennychOmezeni)
    ) { }
    
    var backtrackingPostup = this.backtracking.run(seznamPromennych, pozadovanychReseni);
    backtrackingPostup.shift();
    return postupTvoreniGrafu.concat(backtrackingPostup);
  }

  _iConsistencyKontrola(iPocet, seznamPromennych, seznamVsechPromennychOmezeni) {
    var provedenaZmenaDomeny = false;
    for (var i = seznamPromennych.length - 1; i >= 0;) {
      var promennaZ = seznamPromennych[i];
      //TODO kontrolu preradi az pred odber, musi splnovat vsechna omezeni pokud je iConsistency>pocet omezeni
      // if (seznamVsechPromennychOmezeni[i].length < iPocet) {
      //   i--;
      //   continue;
      // }
      if (++promennaZ.pozice >= promennaZ.domena.length) {
        i--;
        continue;
      }
      var z = promennaZ.domena[promennaZ.pozice];
      var pocetUspesnychPromennych = 0;
      for (var j = 0; j < i; j++) {
        seznamPromennych[j].pozice = -1;
      }
      for (var j = (i - 1); j >= 0; j--) {
        var promennaY = seznamPromennych[j];
        if (seznamVsechPromennychOmezeni[i].indexOf(promennaY.nazev) == -1) {
          continue;
        }
        if (++promennaY.pozice >= promennaY.domena.length) {
          continue;
        }
        var y = promennaY.domena[promennaY.pozice];
        if (this._iConsistencyKontrolaOmezeni(promennaZ, seznamPromennych, promennaY.nazev)) {
          pocetUspesnychPromennych++;
          if (pocetUspesnychPromennych == iPocet) {
            break;
          } else {
            continue;
          }
        }
        j++;
      }
      if (pocetUspesnychPromennych < iPocet) {
        if (pocetUspesnychPromennych == seznamVsechPromennychOmezeni[i].length) {
        } else {
          //TODO zprava ze nebylo nalezeno dostatecny pocet prvku, proto odstranuju
          // mozna nalezeno jen x misto i pozdovanych
          promennaZ.domena.splice(promennaZ.pozice, 1);
          promennaZ.pozice--;
          provedenaZmenaDomeny = true;
        }
      }
    }

    for (let i = 0; i < seznamPromennych.length; i++) {
      seznamPromennych[i].pozice = -1;
    }
    return provedenaZmenaDomeny;
  }

  _iConsistencyKontrolaOmezeni(promenna, seznamPromennych, iOmezeni) {
    var cislo = promenna.domena[promenna.pozice];
    for (var i = 0; i < promenna.omezeni.length; i++) {
      var omezeni = promenna.omezeni[i];

      switch (omezeni.typOmezeni) {
        case TypOmezeni.mensi:
          for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
            var porovnavanaPromenna = omezeni.omezeniProPromennou[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo < porovnavanaHodnota)) {
              return false;
            }
          }
          break;
        case TypOmezeni.vetsi:
          for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
            var porovnavanaPromenna = omezeni.omezeniProPromennou[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo > porovnavanaHodnota)) {
              return false;
            }
          }
          break;
        case TypOmezeni.rovno:
          for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
            var porovnavanaPromenna = omezeni.omezeniProPromennou[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo !== porovnavanaHodnota) {
              return false;
            }
          }
          break;
        case TypOmezeni.nerovno:
          for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
            var porovnavanaPromenna = omezeni.omezeniProPromennou[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo === porovnavanaHodnota) {
              return false;
            }
          }
          break;
        case TypOmezeni.povoleno:
          var porovnavanaPromenna = omezeni.omezeniProPromennou[0];
          if (porovnavanaPromenna != iOmezeni) {
            continue;
          }
          var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
          var nalezeno = false;
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var a = omezeni.hodnotyOmezeni[j][0];
            var b = omezeni.hodnotyOmezeni[j][1];
            if (cislo === a && porovnavanaHodnota === b) {
              nalezeno = true;
              break;
            }
          }
          if (!nalezeno) {
            return false;
          }
          break;
        case TypOmezeni.zakazano:
          var porovnavanaPromenna = omezeni.omezeniProPromennou[0];
          if (porovnavanaPromenna != iOmezeni) {
            continue;
          }
          var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            if (cislo === omezeni.hodnotyOmezeni[j][0] && porovnavanaHodnota === omezeni.hodnotyOmezeni[j][1]) {
              return false;
            }
          }
          break;
      }
    }
    return true;
  }

}
