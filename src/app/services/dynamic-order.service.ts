import { Promenna, KrokAlgoritmu, LokalizovanaZprava, TypKroku, StavKroku } from '../data-model';
import { Algoritmus } from './algoritmus';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';

@Injectable()
export class DynamicOrderService implements Algoritmus {
  nazev = 'popis.dynamicOrder.nazev';
  definice = 'popis.dynamicOrder.definice';

  constructor() { }

  run(seznamPromennych: Array<Promenna>, pozadovanychReseni: number): Array<KrokAlgoritmu> {
      AlgoritmusUtils.prevedOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var startKrok = new KrokAlgoritmu();
    startKrok.hodnota = 'Dynamic value ordering';
    startKrok.popis.push(new LokalizovanaZprava('popis.dynamicOrder.start'));
    postupTvoreniGrafu.push(startKrok);

    var pocetReseni = 0;
    var promenna = 0;

    var krokAlgoritmu = new KrokAlgoritmu();
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

    var krokAlgoritmu = new KrokAlgoritmu();
    var lokalizovanaZprava = new LokalizovanaZprava();
    lokalizovanaZprava.klic = 'popis.dynamicOrder.zacinamSerazovat';
    krokAlgoritmu.popis.push(lokalizovanaZprava);
    krokAlgoritmu.typ = TypKroku.popis;
    postupTvoreniGrafu.push(krokAlgoritmu);


    seznamPromennych = this._dynamicOrder(promenna, seznamPromennych);
    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

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

      var krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = AlgoritmusUtils.najdiRodice(seznamPromennych[promenna - 1], postupTvoreniGrafu);
      postupTvoreniGrafu.push(krokAlgoritmu);

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);

      lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.kontrolaOmezeni';
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
          lokalizovanaZprava.klic = 'popis.dynamicOrder.pokracovaniPrirazeni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          postupTvoreniGrafu.push(krokAlgoritmu);
        } else {
          lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.dynamicOrder.deadend';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
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
          lokalizovanaZprava.klic = 'popis.dynamicOrder.reseni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.typ = TypKroku.popis;
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = StavKroku.reseni;
          postupTvoreniGrafu.push(krokAlgoritmu);
        } else {
          promenna++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.dynamicOrder.uzel';
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
