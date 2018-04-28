import {Promenna, KrokAlgoritmu, LokalizovanaZprava, TypKroku} from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';

@Injectable()
export class DynamicOrderService implements Algoritmus {
  nazev = 'popis.dynamicOrder.nazev';
  definice = 'popis.dynamicOrder.definice';

  constructor() { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni:  number): Array<KrokAlgoritmu> {
    // TODO Test ze zadani
    //    seznamPromennych = [];
    //    seznamPromennych.push(new Promenna('A', [1, 2, 3, 4, 5], []));
    //    seznamPromennych.push(new Promenna('B', [4, 3, 2], []));
    //    seznamPromennych.push(new Promenna('C', [3, 1], []));
    //    seznamPromennych.push(new Promenna('D', [4], []));
    //    seznamPromennych.push(new Promenna('E', [1, 5], []));

    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var pocetReseni = 0;
    var promenna = 0;

    const krokAlgoritmu = new KrokAlgoritmu();

    var lokalizovanaZprava = new LokalizovanaZprava();
    lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiPred';
    krokAlgoritmu.popis.push(lokalizovanaZprava);
    krokAlgoritmu.typ = TypKroku.popis;
    postupTvoreniGrafu.push(krokAlgoritmu);
    for (var i = 0; i < seznamPromennych.length; i++) {
      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiInfo';
      lokalizovanaZprava.parametry = { 'nazev': seznamPromennych[i].nazev, 'delka': seznamPromennych[i].domena.length }
      krokAlgoritmu.popis.push(lokalizovanaZprava);
    }

    seznamPromennych = this._dynamicOrder(promenna, seznamPromennych);

    const krokAlgoritmu2 = new KrokAlgoritmu();
    var lokalizovanaZprava = new LokalizovanaZprava();
    lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiPo';
    krokAlgoritmu2.popis.push(lokalizovanaZprava);
    krokAlgoritmu2.typ = TypKroku.popis;
    postupTvoreniGrafu.push(krokAlgoritmu2);
    for (var i = 0; i < seznamPromennych.length; i++) {
      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.poradiInfo';
      lokalizovanaZprava.parametry = { 'nazev': seznamPromennych[i].nazev, 'delka': seznamPromennych[i].domena.length }
      krokAlgoritmu2.popis.push(lokalizovanaZprava);
    }


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

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);
      postupTvoreniGrafu.push(krokAlgoritmu);

      const poruseneOmezeni = AlgoritmusUtils.porovnej(zpracovavanaPromenna, seznamPromennych);
      if (poruseneOmezeni) {
        for (var i = 0; i < poruseneOmezeni.length; i++) {
          krokAlgoritmu.popis.push(poruseneOmezeni[i]);
        }
      }
      if (poruseneOmezeni) {
        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.dynamicOrder.deadend';
        lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
        krokAlgoritmu.popis.push(lokalizovanaZprava);
        krokAlgoritmu.stav = 'deadend';
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          krokAlgoritmu.stav = 'reseni';
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.dynamicOrder.reseni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
        } else {
          promenna++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.dynamicOrder.uzel';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
        }
      }

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
