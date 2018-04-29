import { Promenna, KrokAlgoritmu, LokalizovanaZprava, TypOmezeni, StavKroku, TypKroku } from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';

@Injectable()
export class ForwardCheckingService implements Algoritmus {
  nazev = 'popis.forwardCheck.nazev';
  definice = 'popis.forwardCheck.definice';

  constructor() { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni: number): Array<KrokAlgoritmu> {
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

      var krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = AlgoritmusUtils.najdiRodice(seznamPromennych[promenna - 1], postupTvoreniGrafu);
      postupTvoreniGrafu.push(krokAlgoritmu);

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.forwardCheck.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);

      lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.forwardCheck.kontrolaOmezeni';
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
          lokalizovanaZprava.klic = 'popis.forwardCheck.pokracovaniPrirazeni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.deadend;
          postupTvoreniGrafu.push(krokAlgoritmu);
        } else {
          lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.forwardCheck.deadend';
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
          lokalizovanaZprava.klic = 'popis.forwardCheck.uzel';
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.reseni;
          krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
          postupTvoreniGrafu.push(krokAlgoritmu);
        } else {
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.forwardCheck.splneniOmezeni';
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          postupTvoreniGrafu.push(krokAlgoritmu);

          var tmp = this._forwardCheck(promenna + 1, zpracovavanaPromenna, seznamPromennych, vstup);
          for (var i = 0; i < tmp[2].length; i++) {
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            krokAlgoritmu.popis.push(tmp[2][i]);
            postupTvoreniGrafu.push(krokAlgoritmu);
          }
          //pokud je prazdna domena nastane uvaznuti
          if (tmp[0] === null) {
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
            seznamPromennych = tmp[0];
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            var lokalizovanaZprava = new LokalizovanaZprava();
            lokalizovanaZprava.klic = 'popis.forwardCheck.uzel';
            lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
            krokAlgoritmu.popis.push(lokalizovanaZprava);
            postupTvoreniGrafu.push(krokAlgoritmu);
            promenna++;
          }
          krokAlgoritmu.hodnotaDomenKroku = tmp[1];
        }
      }
      for (var i = 0; i < seznamPromennych.length; i++) {
        hodnotyDomen.push(seznamPromennych[i].domena.slice());
      }
    }
    return postupTvoreniGrafu;
  }

  _forwardCheck(promenna, zpracovavanaPromenna, seznamPromennych, vstup) {

    var hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
    seznamPromennych = this._forwardCheckZaloha(promenna, seznamPromennych, vstup);
    var typOmezeni;
    var hodnotaDomen;
    var popisPrubehuOmezeni = new Array<LokalizovanaZprava>();
    var porovnavanaHodnota;
    for (var i = promenna; i < seznamPromennych.length; i++) {
      for (var l = 0; l < seznamPromennych[i].omezeni.length; l++) {
        typOmezeni = seznamPromennych[i].omezeni[l].typOmezeni;
        if (seznamPromennych[i].omezeni[l].jeJednoduche()) {
          for (var j = 0; j < seznamPromennych[i].omezeni[l].omezeniProPromennou.length; j++) {
            if (seznamPromennych[i].omezeni[l].omezeniProPromennou[j] === vstup[promenna - 1]) {
              switch (typOmezeni) {
                case TypOmezeni.mensi:
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    porovnavanaHodnota = seznamPromennych[i].domena[k];
                    if (!(porovnavanaHodnota < hodnota)) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      var popis = new LokalizovanaZprava();
                      popis.klic = 'popis.forwardCheck.nesplneno';
                      popis.parametry = { 'nazev': zpracovavanaPromenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hodnota': hodnota, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': TypOmezeni.vetsi }
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
                case TypOmezeni.vetsi:
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    porovnavanaHodnota = seznamPromennych[i].domena[k];
                    if (!(porovnavanaHodnota > hodnota)) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      var popis = new LokalizovanaZprava();
                      popis.klic = 'popis.forwardCheck.nesplneno';
                      popis.parametry = { 'nazev': zpracovavanaPromenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hodnota': hodnota, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': TypOmezeni.mensi }
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
                case TypOmezeni.rovno:
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    porovnavanaHodnota = seznamPromennych[i].domena[k];
                    if (hodnota !== porovnavanaHodnota) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      var popis = new LokalizovanaZprava();
                      popis.klic = 'popis.forwardCheck.nesplneno';
                      popis.parametry = { 'nazev': zpracovavanaPromenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hodnota': hodnota, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': TypOmezeni.rovno }
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
                case TypOmezeni.nerovno:
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    porovnavanaHodnota = seznamPromennych[i].domena[k];
                    if (hodnota === porovnavanaHodnota) {
                      k--;
                      var popis = new LokalizovanaZprava();
                      popis.klic = 'popis.forwardCheck.nesplneno';
                      popis.parametry = { 'nazev': zpracovavanaPromenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hodnota': hodnota, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': TypOmezeni.nerovno }
                      popisPrubehuOmezeni.push(popis);
                      seznamPromennych[i].domena.splice(k, 1);
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
        } else if (!seznamPromennych[i].omezeni[l].jeJednoduche()) {
          if (seznamPromennych[i].omezeni[l].omezeniProPromennou[0] === vstup[promenna - 1]) {
            switch (typOmezeni) {
              case TypOmezeni.povoleno:
                var nalezeno;
                for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                  nalezeno = false;
                  for (var j = 0; j < seznamPromennych[i].omezeni[l].hodnotyOmezeni.length; j++) {
                    const dvojice = seznamPromennych[i].omezeni[l].hodnotyOmezeni[j];
                    porovnavanaHodnota = seznamPromennych[i].domena[k];
                    if (hodnota === dvojice[1] && seznamPromennych[i].domena[k] === dvojice[0]) {
                      nalezeno = true;
                    }
                  }
                  if (!nalezeno) {
                    seznamPromennych[i].domena.splice(k, 1);
                    k--;
                    var popis = new LokalizovanaZprava();
                    popis.klic = 'popis.forwardCheck.povolenoNesplneno';
                    popis.parametry = { 'nazev': zpracovavanaPromenna.nazev, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hodnota': hodnota, 'porovnavanaHodnota': porovnavanaHodnota }
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
              case TypOmezeni.zakazano:
                for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    nalezeno = false;
                    for (var j = 0; j < seznamPromennych[i].omezeni[l].hodnotyOmezeni.length; j++) {
                      const dvojice = seznamPromennych[i].omezeni[l].hodnotyOmezeni[j];
                      porovnavanaHodnota = seznamPromennych[i].domena[k];
                      if (hodnota === dvojice[1] && seznamPromennych[i].domena[k] === dvojice[0]) {
                        seznamPromennych[i].domena.splice(k, 1);
                        k--;
                        var popis = new LokalizovanaZprava();
                        popis.klic = 'popis.forwardCheck.zakazaneNesplneno';
                        popis.parametry = { 'nazev': zpracovavanaPromenna, 'porovnavanaPromenna': seznamPromennych[i].nazev, 'hodnota': hodnota, 'porovnavanaHodnota': seznamPromennych[i].domena[k] }
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
