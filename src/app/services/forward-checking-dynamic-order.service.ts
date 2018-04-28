import {Promenna, KrokAlgoritmu, LokalizovanaZprava} from '../data-model';
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

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni:  number): Array<KrokAlgoritmu> {
    // TODO Test ze zadani
    //    seznamPromennych = [];
    //    seznamPromennych.push(new Promenna('A', [5, 4], []));
    //    seznamPromennych.push(new Promenna('B', [2], []));
    //    seznamPromennych.push(new Promenna('C', [3], []));
    //    seznamPromennych.push(new Promenna('D', [4], []));
    //    seznamPromennych.push(new Promenna('E', [1, 2, 3, 4, 5], [new Omezeni('=', ['A', 'D'], null)]));

    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var startKrok = new KrokAlgoritmu();
    startKrok.hodnota = 'Forward checking + DVO';
    startKrok.popis.push(new LokalizovanaZprava('popis.forwarCheckDynamicOrder.start'));
    postupTvoreniGrafu.push(startKrok);


    var vstup = new Array();

    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && (!pozadovanychReseni || pocetReseni < pozadovanychReseni)) {
      var hodnotyDomen = new Array();

      const krokAlgoritmu = new KrokAlgoritmu();

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiPred';
      krokAlgoritmu.popis.push(lokalizovanaZprava);
      for (var i = 0; i < seznamPromennych.length; i++) {
        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiInfo';
        lokalizovanaZprava.parametry = { 'nazev': seznamPromennych[i].nazev, 'delka': seznamPromennych[i].domena.length }
        krokAlgoritmu.popis.push(lokalizovanaZprava);
      }

      seznamPromennych = this._dynamicOrder(promenna, seznamPromennych);
      AlgoritmusUtils.prevedOmezeni(seznamPromennych);
      for (var i = 0; i < seznamPromennych.length; i++) {
        vstup.push(seznamPromennych[i].nazev);
      }

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiPo';
      krokAlgoritmu.popis.push(lokalizovanaZprava);
      for (var i = 0; i < seznamPromennych.length; i++) {
        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiInfo';
        lokalizovanaZprava.parametry = { 'nazev': seznamPromennych[i].nazev, 'delka': seznamPromennych[i].domena.length }
        krokAlgoritmu.popis.push(lokalizovanaZprava);
      }


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
          if (tmp[0] === null) {
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

  _dynamicOrder(promenna, seznamPromennych) {
    var nejmensiDelkaDomeny = 999999999;
    var pozicePromenneSNejmensiDelkouDomeny = 999999999;
    for (var i = promenna; i < seznamPromennych.length; i++) {
      if (seznamPromennych[i].domena.length < nejmensiDelkaDomeny) {
        nejmensiDelkaDomeny = seznamPromennych[i].domena.length;
        pozicePromenneSNejmensiDelkouDomeny = i;
      }
    }
    var pom = seznamPromennych[pozicePromenneSNejmensiDelkouDomeny];
    seznamPromennych[pozicePromenneSNejmensiDelkouDomeny] = seznamPromennych[promenna];
    seznamPromennych[promenna] = pom;
    return seznamPromennych;
  }

}