import {Promenna, KrokAlgoritmu, LokalizovanaZprava} from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';

@Injectable()
export class ForwardCheckingService implements Algoritmus {
  nazev = 'popis.forwardCheck.nazev';
  definice = 'popis.forwardCheck.definice';

  constructor() { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni:  number): Array<KrokAlgoritmu> {
    // TODO Test ze zadani
//    seznamPromennych = [];
//    seznamPromennych.push(new Promenna('A', [1, 2, 3], [new Omezeni('!', ['B', 'C', 'D', 'G'], null)]));
//    seznamPromennych.push(new Promenna('B', [2, 3], [new Omezeni('!', ['F'], null)]));
//    seznamPromennych.push(new Promenna('C', [1, 2], [new Omezeni('!', ['G'], null)]));
//    seznamPromennych.push(new Promenna('D', [1, 2], [new Omezeni('!', ['E', 'G'], null)]));
//    seznamPromennych.push(new Promenna('E', [2, 3], [new Omezeni('!', ['F', 'G'], null)]));
//    seznamPromennych.push(new Promenna('F', [1, 3, 4]));
//    seznamPromennych.push(new Promenna('G', [1, 2]));

    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var startKrok = new KrokAlgoritmu();
    startKrok.hodnota = 'Forward checking';
    startKrok.popis.push(new LokalizovanaZprava('popis.forwardCheck.start'));
    postupTvoreniGrafu.push(startKrok);


    var vstup = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      vstup.push(seznamPromennych[i].nazev);
    }

    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && (!pozadovanychReseni || pocetReseni < pozadovanychReseni)) {
      var hodnotyDomen = new Array();
      var zpracovavanaPromenna = seznamPromennych[promenna];
      zpracovavanaPromenna.pozice++;
      if (zpracovavanaPromenna.pozice > zpracovavanaPromenna.domena.length - 1) {
        zpracovavanaPromenna.pozice = -1;
        if (promenna > 0) {
          seznamPromennych = this._forwardCheckBack(promenna, seznamPromennych, vstup);
        }
        promenna--;
        continue;
      }

      const krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = AlgoritmusUtils.najdiRodice(seznamPromennych[promenna - 1], postupTvoreniGrafu);

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.forwardCheck.prirazeni';
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
        lokalizovanaZprava.klic = 'popis.forwardCheck.deadend';
        lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
        krokAlgoritmu.popis.push(lokalizovanaZprava);
        krokAlgoritmu.stav = 'deadend';
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          krokAlgoritmu.stav = 'reseni';
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.forwardCheck.reseni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
        } else {
          var tmp = this._forwardCheck(promenna + 1, zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice], seznamPromennych, vstup);
          for (var i = 0; i < tmp[2].length; i++) {
            krokAlgoritmu.popis.push(tmp[2][i]);
          }
          //pokud je prazdna domena nastane uvaznuti
          if (tmp[0] === null) {
            // krokAlgoritmu.popis = 'popis.forwardCheck.checkFail';
            krokAlgoritmu.stav = 'deadend';
          } else {
            seznamPromennych = tmp[0];
            var lokalizovanaZprava = new LokalizovanaZprava();
            lokalizovanaZprava.klic = 'popis.forwardCheck.uzel';
            lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
            krokAlgoritmu.popis.push(lokalizovanaZprava);
            promenna++;
          }
          krokAlgoritmu.hodnotaDomenKroku = tmp[1];
        }
      }
      for (var i = 0; i < seznamPromennych.length; i++) {
        hodnotyDomen.push(seznamPromennych[i].domena.slice());
      }
      postupTvoreniGrafu.push(krokAlgoritmu);
    }
    return postupTvoreniGrafu;
  }

  _forwardCheck(promenna, hodnota, seznamPromennych, vstup) {

    seznamPromennych = this._forwardCheckZaloha(promenna, seznamPromennych, vstup);
    var typOmezeni;
    var hodnotaDomen;
    var popisPrubehuOmezeni = new Array<LokalizovanaZprava>();
    for (var i = promenna; i < seznamPromennych.length; i++) {
      for (var l = 0; l < seznamPromennych[i].omezeni.length; l++) {
        typOmezeni = seznamPromennych[i].omezeni[l].typOmezeni;
        if (typOmezeni === '<' || typOmezeni === '>' || typOmezeni === '=' || typOmezeni === '!') {
          for (var j = 0; j < seznamPromennych[i].omezeni[l].omezeniProPromennou.length; j++) {
            if (seznamPromennych[i].omezeni[l].omezeniProPromennou[j] === vstup[promenna - 1]) {
              switch (typOmezeni) {
                case '<':
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    if (!(seznamPromennych[i].domena[k] < hodnota)) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      var popis = new LokalizovanaZprava();
                      popis.klic = 'popis.forwardCheck.nesplneno';
                      popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hondnota': hodnota, 'porovnavanaHodnota': seznamPromennych[i].domena[k], 'typOmezeni': typOmezeni }
                      popisPrubehuOmezeni.push(popis);
                      if (seznamPromennych[i].domena.length === 0) {
                        hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                        this._forwardCheckBack(promenna, seznamPromennych, vstup);
                        var popis = new LokalizovanaZprava();
                        popis.klic = 'popis.forwardCheck.prazdnaDomena';
                        popis.parametry = { 'porovnavanaPromenna': seznamPromennych[i].nazev }
                        popisPrubehuOmezeni.push(popis);
                        return [null, hodnotaDomen, popisPrubehuOmezeni];
                      }
                    }
                  }
                  break;
                case '>':
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    if (!(seznamPromennych[i].domena[k] > hodnota)) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      var popis = new LokalizovanaZprava();
                      popis.klic = 'popis.forwardCheck.nesplneno';
                      popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hondnota': hodnota, 'porovnavanaHodnota': seznamPromennych[i].domena[k], 'typOmezeni': typOmezeni }
                      popisPrubehuOmezeni.push(popis);
                      if (seznamPromennych[i].domena.length === 0) {
                        hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                        this._forwardCheckBack(promenna, seznamPromennych, vstup);
                        var popis = new LokalizovanaZprava();
                        popis.klic = 'popis.forwardCheck.prazdnaDomena';
                        popis.parametry = { 'porovnavanaPromenna': seznamPromennych[i].nazev }
                        popisPrubehuOmezeni.push(popis);
                        return [null, hodnotaDomen, popisPrubehuOmezeni];
                      }
                    }
                  }
                  break;
                case '=':
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    if (hodnota !== seznamPromennych[i].domena[k]) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      var popis = new LokalizovanaZprava();
                      popis.klic = 'popis.forwardCheck.nesplneno';
                      popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hondnota': hodnota, 'porovnavanaHodnota': seznamPromennych[i].domena[k], 'typOmezeni': typOmezeni }
                      popisPrubehuOmezeni.push(popis);
                      if (seznamPromennych[i].domena.length === 0) {
                        hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                        this._forwardCheckBack(promenna, seznamPromennych, vstup);
                        var popis = new LokalizovanaZprava();
                        popis.klic = 'popis.forwardCheck.prazdnaDomena';
                        popis.parametry = { 'porovnavanaPromenna': seznamPromennych[i].nazev }
                        popisPrubehuOmezeni.push(popis);
                        return [null, hodnotaDomen, popisPrubehuOmezeni];
                      }
                    }
                  }
                  break;
                case '!':
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    if (hodnota === seznamPromennych[i].domena[k]) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      var popis = new LokalizovanaZprava();
                      popis.klic = 'popis.forwardCheck.nesplneno';
                      popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hondnota': hodnota, 'porovnavanaHodnota': seznamPromennych[i].domena[k], 'typOmezeni': typOmezeni }
                      popisPrubehuOmezeni.push(popis);
                      if (seznamPromennych[i].domena.length === 0) {
                        hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                        this._forwardCheckBack(promenna, seznamPromennych, vstup);
                        var popis = new LokalizovanaZprava();
                        popis.klic = 'popis.forwardCheck.prazdnaDomena';
                        popis.parametry = { 'porovnavanaPromenna': seznamPromennych[i].nazev }
                        popisPrubehuOmezeni.push(popis);
                        return [null, hodnotaDomen, popisPrubehuOmezeni];
                      }
                    }
                  }
                  break;
              }
            }
          }
        } else if (typOmezeni === 'p' || typOmezeni === 'z') {
          if (seznamPromennych[i].omezeni[l].omezeniProPromennou[0] === vstup[promenna - 1]) {
            switch (typOmezeni) {
              case 'p':
                var nalezeno;
                for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                  nalezeno = false;
                  for (var j = 0; j < seznamPromennych[i].omezeni[l].hodnotyOmezeni.length; j++) {
                    const dvojice = seznamPromennych[i].omezeni[l].hodnotyOmezeni[j];
                    if (hodnota === dvojice[1] && seznamPromennych[i].domena[k] === dvojice[0]) {
                      nalezeno = true;
                    }
                  }
                  if (!nalezeno) {
                    seznamPromennych[i].domena.splice(k, 1);
                    k--;
                    var popis = new LokalizovanaZprava();
                    popis.klic = 'popis.forwardCheck.povolenoNesplneno';
                    popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hondnota': hodnota, 'porovnavanaHodnota': seznamPromennych[i].domena[k] }
                    popisPrubehuOmezeni.push(popis);
                    if (seznamPromennych[i].domena.length === 0) {
                      hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                      this._forwardCheckBack(promenna, seznamPromennych, vstup);
                      var popis = new LokalizovanaZprava();
                      popis.klic = 'popis.forwardCheck.prazdnaDomena';
                      popis.parametry = { 'porovnavanaPromenna': seznamPromennych[i].nazev }
                      popisPrubehuOmezeni.push(popis);
                      return [null, hodnotaDomen, popisPrubehuOmezeni];
                    }
                  }
                }
                break;
              case 'z':
                for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    nalezeno = false;
                    for (var j = 0; j < seznamPromennych[i].omezeni[l].hodnotyOmezeni.length; j++) {
                      const dvojice = seznamPromennych[i].omezeni[l].hodnotyOmezeni[j];
                      if (hodnota === dvojice[1] && seznamPromennych[i].domena[k] === dvojice[0]) {
                        seznamPromennych[i].domena.splice(k, 1);
                        k--;
                        var popis = new LokalizovanaZprava();
                        popis.klic = 'popis.forwardCheck.zakazeneSplneno';
                        popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hondnota': hodnota, 'porovnavanaHodnota': seznamPromennych[i].domena[k] }
                        popisPrubehuOmezeni.push(popis);
                        if (seznamPromennych[i].domena.length === 0) {
                          hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                          this._forwardCheckBack(promenna, seznamPromennych, vstup);
                          var popis = new LokalizovanaZprava();
                          popis.klic = 'popis.forwardCheck.prazdnaDomena';
                          popis.parametry = { 'porovnavanaPromenna': seznamPromennych[i].nazev }
                          popisPrubehuOmezeni.push(popis);
                          return [null, hodnotaDomen, popisPrubehuOmezeni];
                        }
                        break;
                      }
                    }
                  }
                }
                break;
            }
          }
        }
      }
    }
    hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
    return [seznamPromennych, hodnotaDomen, popisPrubehuOmezeni];
  }

  _forwardCheckZaloha(promenna, seznamPromennych, vstup) {
    for (var i = promenna; i < seznamPromennych.length; i++) {
      var a = [vstup[promenna - 1]];
      a.push(seznamPromennych[i].domena.slice());
      seznamPromennych[i].zalohaDomeny.push(a);
    }
    return seznamPromennych;
  }

  _forwardCheckBack(promenna, seznamPromennych, vstup) {
    var predchoziPromenna = vstup[promenna - 1];
    for (var i = promenna; i < seznamPromennych.length; i++) {
      var promenna = seznamPromennych[i];
      var zaloha = promenna.zalohaDomeny;
      var posledniZaloha = zaloha[zaloha.length - 1];
      if (posledniZaloha.length > -1) {
        if (posledniZaloha[0] === predchoziPromenna) {
          promenna.domena = posledniZaloha[1].slice();
          zaloha.pop();
        }
      }
    }
    return seznamPromennych;
  }

  _forwardChechHodnotaDomen(seznamPromennych) {
    const hodnotyDomen = new Array();
    for (let i = 0; i < seznamPromennych.length; i++) {
      const promenna = seznamPromennych[i];
      const kopie = new Promenna(promenna.nazev, promenna.domena.slice());
      hodnotyDomen.push(kopie);
    }
    return hodnotyDomen;
  }

}
