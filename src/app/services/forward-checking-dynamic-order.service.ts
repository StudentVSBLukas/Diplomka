import { Promenna, KrokAlgoritmu, LokalizovanaZprava, StavKroku, TypKroku, Omezeni, TypOmezeni } from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';
import { ForwardCheckingService } from './forward-checking.service';

@Injectable()
export class ForwardCheckingDynamicOrderService extends ForwardCheckingService {
  nazev = 'popis.forwarCheckDynamicOrder.nazev';
  definice = 'popis.forwarCheckDynamicOrder.definice';

  constructor() {
    super();
  }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni: number): Array<KrokAlgoritmu> {
    // TODO Test ze zadani
    //    seznamPromennych = [];
    //    seznamPromennych.push(new Promenna('A', [5, 4], []));
    //    seznamPromennych.push(new Promenna('B', [2], []));
    //    seznamPromennych.push(new Promenna('C', [3], []));
    //    seznamPromennych.push(new Promenna('D', [4], []));
    //    seznamPromennych.push(new Promenna('E', [1, 2, 3, 4, 5], [new Omezeni(TypOmezeni.rovno, ['A', 'D'], null)]));

    // seznamPromennych = [];
    // seznamPromennych.push(new Promenna('A', [1, 2, 3], []));
    // seznamPromennych.push(new Promenna('B', [4, 5, 6], [new Omezeni(TypOmezeni.mensi, ['C', 'D'], null)]));
    // seznamPromennych.push(new Promenna('C', [1, 5, 7], ));
    // seznamPromennych.push(new Promenna('D', [3, 4, 8], [new Omezeni(TypOmezeni.mensi, ['C'], null)]));

    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var startKrok = new KrokAlgoritmu();
    startKrok.hodnota = 'Forward checking + DVO';
    startKrok.popis.push(new LokalizovanaZprava('popis.forwarCheckDynamicOrder.start'));
    postupTvoreniGrafu.push(startKrok);


    var vstup = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      vstup.push(seznamPromennych[i].nazev);
    }

    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && (!pozadovanychReseni || pocetReseni < pozadovanychReseni)) {


      var krokAlgoritmu = new KrokAlgoritmu();
      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiPred';
      krokAlgoritmu.popis.push(lokalizovanaZprava);
      krokAlgoritmu.typ = TypKroku.popis;
      krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
      postupTvoreniGrafu.push(krokAlgoritmu);
      for (var i = 0; i < seznamPromennych.length; i++) {
        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiInfo';
        lokalizovanaZprava.parametry = { 'nazev': seznamPromennych[i].nazev, 'delka': seznamPromennych[i].domena.length }
        krokAlgoritmu.popis.push(lokalizovanaZprava);
      }

      var krokAlgoritmu = new KrokAlgoritmu();
      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.zacinamSerazovat';
      krokAlgoritmu.popis.push(lokalizovanaZprava);
      krokAlgoritmu.typ = TypKroku.popis;
      krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
      postupTvoreniGrafu.push(krokAlgoritmu);


      seznamPromennych = this._dynamicOrder(promenna, seznamPromennych);
      AlgoritmusUtils.prevedOmezeni(seznamPromennych);
      var vstup = new Array();
      for (var i = 0; i < seznamPromennych.length; i++) {
        vstup.push(seznamPromennych[i].nazev);
      }

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiPo';
      krokAlgoritmu.popis.push(lokalizovanaZprava);
      krokAlgoritmu.typ = TypKroku.popis;
      krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
      postupTvoreniGrafu.push(krokAlgoritmu);
      for (var i = 0; i < seznamPromennych.length; i++) {
        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiInfo';
        lokalizovanaZprava.parametry = { 'nazev': seznamPromennych[i].nazev, 'delka': seznamPromennych[i].domena.length }
        krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
        krokAlgoritmu.popis.push(lokalizovanaZprava);
      }

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
      krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
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
      krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
      postupTvoreniGrafu.push(krokAlgoritmu);

      const poruseneOmezeni = AlgoritmusUtils.porovnej(zpracovavanaPromenna, seznamPromennych);
      if (poruseneOmezeni) {
        krokAlgoritmu = new KrokAlgoritmu();
        krokAlgoritmu.typ = TypKroku.popis;
        krokAlgoritmu.popis.push(poruseneOmezeni);
        krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
        postupTvoreniGrafu.push(krokAlgoritmu);
        if (zpracovavanaPromenna.domena.length > zpracovavanaPromenna.pozice + 1) {
          lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.forwardCheck.pokracovaniPrirazeni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.deadend;
          krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
          postupTvoreniGrafu.push(krokAlgoritmu);
        } else {
          lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.forwardCheck.deadend';
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.deadend;
          krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
          postupTvoreniGrafu.push(krokAlgoritmu);
        }
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.forwardCheck.reseni';
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
          krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
          postupTvoreniGrafu.push(krokAlgoritmu);

          var tmp = this._forwardCheck(promenna + 1, zpracovavanaPromenna, seznamPromennych, vstup);
          for (var i = 0; i < tmp[2].length; i++) {
            krokAlgoritmu = new KrokAlgoritmu();
            krokAlgoritmu.typ = TypKroku.popis;
            krokAlgoritmu.popis.push(tmp[2][i]);
            krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
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
              krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
              postupTvoreniGrafu.push(krokAlgoritmu);
            } else {
              lokalizovanaZprava = new LokalizovanaZprava();
              lokalizovanaZprava.klic = 'popis.backtracking.deadend';
              krokAlgoritmu = new KrokAlgoritmu();
              krokAlgoritmu.typ = TypKroku.popis;
              krokAlgoritmu.popis.push(lokalizovanaZprava);
              krokAlgoritmu.stav = StavKroku.deadend;
              krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
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
            krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
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


  _dynamicOrder(promenna, seznamPromennych) {
    var nejmensiDelkaDomeny;
    var pozicePromenneSNejmensiDelkouDomeny;
    for (var i = promenna; i < seznamPromennych.length; i++) {
      nejmensiDelkaDomeny = seznamPromennych[i].domena.length;
      pozicePromenneSNejmensiDelkouDomeny = i;
      for (var j = i + 1; j < seznamPromennych.length; j++) {
        if (seznamPromennych[j].domena.length < nejmensiDelkaDomeny) {
          nejmensiDelkaDomeny = seznamPromennych[j].domena.length;
          pozicePromenneSNejmensiDelkouDomeny = j;
        }
      }
      var pom = seznamPromennych[pozicePromenneSNejmensiDelkouDomeny];
      seznamPromennych[pozicePromenneSNejmensiDelkouDomeny] = seznamPromennych[i];
      seznamPromennych[i] = pom;
    }
    return seznamPromennych;
  }
}