import { Promenna, Omezeni, KrokAlgoritmu, LokalizovanaZprava, TypKroku } from '../data-model';
import { Algoritmus } from '../dialog-algoritmus/dialog-algoritmus.component';
import { PromennaService } from '../promenna.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { saveAs } from 'file-saver/FileSaver';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  listPromennych = [];

  algoritmy = [
    { label: '-', value: new Algoritmus('popis.backtracking.nazev', 'popis.backtracking.definice', this.backtracking) },
    { label: '-', value: new Algoritmus('popis.backjumping.nazev', 'popis.backjumping.definice', this.backjumping) },
    { label: '-', value: new Algoritmus('popis.forwardCheck.nazev', 'popis.forwardCheck.definice', this.forwardChecking) },
    { label: '-', value: new Algoritmus('popis.arcConsistency.nazev', 'popis.arcConsistency.definice', this.arcConsistency) },
    { label: '-', value: new Algoritmus('popis.random.nazev', 'popis.random.definice', this.randomBacktracking) },
    { label: '-', value: new Algoritmus('popis.dynamicOrder.nazev', 'popis.dynamicOrder.definice', this.dynamicOrderBacktracking) },
    { label: '-', value: new Algoritmus('popis.iConsistency.nazev', 'popis.iConsistency.definice', this.iConsistency) }
  ];
  vybranyAlgoritmus = this.algoritmy[0].value;
  iConsistencyFaktor = 1;
  pocetReseni;

  lokalizace = ['cz', 'gb'];

  zobrazAlgoritmusDialog = false;
  zobrazImportDialog = false;

  postup;

  constructor(private promennaService: PromennaService, private translate: TranslateService) {
    this.listPromennych = promennaService.list();

    translate.setDefaultLang('cz');
    translate.use('cz');
  }


  ngOnInit() {
    for (var i = 0; i < 3; i++) {
      const p = this.promennaService.vytvor();
      p.domena = [i + 1, i + 2, i + 4];
    }

    // TODO odstranit zakladni nastaveni vstupu
    const a = this.listPromennych[0];
    const ogt = new Omezeni('<', ['B'], null);
    const one = new Omezeni('!', ['C'], null);
    const op = new Omezeni('p', [[4, 5], [2, 1]], 'B');
    a.omezeni = [ogt, one, op];

    //    const c = this.listPromennych[2];
    //    c.domena.push(7);
    //    c.omezeni.push(new Omezeni('z', [[7,5]], 'B'));
  }

  pridejPromennou() {
    const promenna = this.promennaService.vytvor();
    this.listPromennych = this.promennaService.list();
  }

  zobrazAlgoritmus() {
    this.zobrazAlgoritmusDialog = true;
  }

  skryjAlgoritmus() {
    this.zobrazAlgoritmusDialog = false;
  }

  zobrazImport() {
    this.zobrazImportDialog = true;
  }

  // TODO zbavit se tohoto - upravit patricne atributy omezeni
  jeJednoducheOmezeni(typOmezeni: string) {
    return typOmezeni === '<' || typOmezeni === '>' || typOmezeni === '=' || typOmezeni === '!';
  }

  run() {
    const zadani = this.pripravAktivniPromenne();

    this.postup = this.vybranyAlgoritmus.run.call(this, this.pocetReseni, zadani, this.iConsistencyFaktor);
  }

  /*
   * Filtruje neaktivní proměnné a jejich omezení
   */
  pripravAktivniPromenne() {
    // Filtruje neaktivni promenne
    const zadani = this.listPromennych.filter(
      (p: Promenna) => p.aktivni
    ).map(function (p: Promenna) {
      const kopiePromenne = new Promenna(p.nazev);
      kopiePromenne.domena = p.domena.slice();

      // Filtruje omezeni s neaktivnimi promennymi
      kopiePromenne.omezeni = p.omezeni.filter(
        (o: Omezeni) => !o.omezeniProPromennou || this.promennaService.vrat(o.omezeniProPromennou).aktivni
      ).map(function (o) {
        const kopieOmezeni = Object.assign({}, o);
        if (this.jeJednoducheOmezeni(o.typOmezeni)) {
          kopieOmezeni.hodnotyOmezeni = o.hodnotyOmezeni.filter(
            (hodnota: string) => this.promennaService.vrat(hodnota).aktivni
          );
        } else {
          kopieOmezeni.hodnotyOmezeni = o.hodnotyOmezeni.map(
            hodnota => Object.assign({}, hodnota)
          );
          kopieOmezeni.omezeniProPromennou = o.omezeniProPromennou;
        }

        return kopieOmezeni;
      }, this).filter(
        (o: Omezeni) => o.hodnotyOmezeni.length
        );

      return kopiePromenne;
    }, this);
    return zadani;
  }


  backtracking(pozadovanychReseni, seznamPromennych) {
    // TODO Test ze zadani
    seznamPromennych = [];
    seznamPromennych.push(new Promenna('A', [1, 2, 3], [new Omezeni('!', ['B', 'C', 'D', 'G'], null)]));
    seznamPromennych.push(new Promenna('B', [2, 3], [new Omezeni('!', ['F'], null)]));
    seznamPromennych.push(new Promenna('C', [1, 2], [new Omezeni('!', ['G'], null)]));
    seznamPromennych.push(new Promenna('D', [1, 2], [new Omezeni('!', ['E', 'G'], null)]));
    seznamPromennych.push(new Promenna('E', [2, 3], [new Omezeni('!', ['F', 'G'], null)]));
    seznamPromennych.push(new Promenna('F', [1, 3, 4]));
    seznamPromennych.push(new Promenna('G', [1, 2]));

    this._prevodOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var pocetReseni = 0;
    var promenna = 0;
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
      krokAlgoritmu.rodic = this._lastIndex(seznamPromennych[promenna - 1], postupTvoreniGrafu) + 1;
      postupTvoreniGrafu.push(krokAlgoritmu);


      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.backtracking.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);

      const poruseneOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
      if (poruseneOmezeni != undefined) {
        for (var i = 0; i < poruseneOmezeni.length; i++) {
          krokAlgoritmu.popis.push(poruseneOmezeni[i]);
        }
      }
      if (poruseneOmezeni) {
        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.backtracking.deadend';
        lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
        krokAlgoritmu.popis.push(lokalizovanaZprava);
        krokAlgoritmu.stav = 'deadend';
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backtracking.reseni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          krokAlgoritmu.stav = 'reseni';
        } else {
          promenna++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.backtracking.uzel';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
        }
      }

    }

    return postupTvoreniGrafu;
  }

  backjumping(pozadovanychReseni, seznamPromennych) {
    // TODO Test ze zadani
    seznamPromennych = [];
    seznamPromennych.push(new Promenna('A', [1, 2, 3], [new Omezeni('!', ['B', 'C', 'D', 'G'], null)]));
    seznamPromennych.push(new Promenna('B', [2, 3], [new Omezeni('!', ['F'], null)]));
    seznamPromennych.push(new Promenna('C', [1, 2], [new Omezeni('!', ['G'], null)]));
    seznamPromennych.push(new Promenna('D', [1, 2], [new Omezeni('!', ['E', 'G'], null)]));
    seznamPromennych.push(new Promenna('E', [2, 3], [new Omezeni('!', ['F', 'G'], null)]));
    seznamPromennych.push(new Promenna('F', [1, 3, 4]));
    seznamPromennych.push(new Promenna('G', [1, 2]));

    this._prevodOmezeni(seznamPromennych);

    var leafend = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      leafend.push(false);
    }
    var postupTvoreniGrafu = new Array();
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
              // TODO odstranit spolu s jeJednoducheOmezeni
              if (omezeni.typOmezeni === 'p' || omezeni.typOmezeni === 'z') {
                const jump = this.promennaService.index(seznamPromennych, omezeni.omezeniProPromennou);
                backjump = Math.max(backjump, jump);
              } else {
                for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
                  const jump = this.promennaService.index(seznamPromennych, omezeni.hodnotyOmezeni[j]);
                  backjump = Math.max(backjump, jump);
                }
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
          krokAlgoritmu2.rodic = this._lastIndex(seznamPromennych[promenna - 1], postupTvoreniGrafu) + 1;
          const poruseneOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
          if (poruseneOmezeni != undefined) {
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

  forwardChecking(pozadovanychReseni, seznamPromennych) {
    // TODO Test ze zadani
    seznamPromennych = [];
    seznamPromennych.push(new Promenna('A', [1, 2, 3], [new Omezeni('!', ['B', 'C', 'D', 'G'], null)]));
    seznamPromennych.push(new Promenna('B', [2, 3], [new Omezeni('!', ['F'], null)]));
    seznamPromennych.push(new Promenna('C', [1, 2], [new Omezeni('!', ['G'], null)]));
    seznamPromennych.push(new Promenna('D', [1, 2], [new Omezeni('!', ['E', 'G'], null)]));
    seznamPromennych.push(new Promenna('E', [2, 3], [new Omezeni('!', ['F', 'G'], null)]));
    seznamPromennych.push(new Promenna('F', [1, 3, 4]));
    seznamPromennych.push(new Promenna('G', [1, 2]));

    this._prevodOmezeni(seznamPromennych);

    var vstup = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      vstup.push(seznamPromennych[i].nazev);
    }

    var postupTvoreniGrafu = new Array();
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
      krokAlgoritmu.rodic = this._lastIndex(seznamPromennych[promenna - 1], postupTvoreniGrafu) + 1;

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.forwardCheck.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);

      const poruseneOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
      if (poruseneOmezeni != undefined) {
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

  forwardCheckingDynamicValueOrdering(pozadovanychReseni, seznamPromennych) {
    // TODO Test ze zadani
    //    seznamPromennych = [];
    //    seznamPromennych.push(new Promenna('A', [5, 4], []));
    //    seznamPromennych.push(new Promenna('B', [2], []));
    //    seznamPromennych.push(new Promenna('C', [3], []));
    //    seznamPromennych.push(new Promenna('D', [4], []));
    //    seznamPromennych.push(new Promenna('E', [1, 2, 3, 4, 5], [new Omezeni('=', ['A', 'D'], null)]));

    this._prevodOmezeni(seznamPromennych);

    var vstup = new Array();

    var postupTvoreniGrafu = new Array();
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
      this._prevodOmezeni(seznamPromennych);
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
      krokAlgoritmu.rodic = this._lastIndex(seznamPromennych[promenna - 1], postupTvoreniGrafu) + 1;

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.forwardCheck.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);


      const poruseneOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
      if (poruseneOmezeni != undefined) {
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


  _forwardCheck(promenna, hodnota, seznamPromennych, vstup) {

    seznamPromennych = this._forwardCheckZaloha(promenna, seznamPromennych, vstup);
    var typOmezeni;
    var hodnotaDomen;
    var popisPrubehuOmezeni = new Array<LokalizovanaZprava>();
    for (var i = promenna; i < seznamPromennych.length; i++) {
      for (var l = 0; l < seznamPromennych[i].omezeni.length; l++) {
        typOmezeni = seznamPromennych[i].omezeni[l].typOmezeni;
        if (typOmezeni === '<' || typOmezeni === '>' || typOmezeni === '=' || typOmezeni === '!') {
          for (var j = 0; j < seznamPromennych[i].omezeni[l].hodnotyOmezeni.length; j++) {
            if (seznamPromennych[i].omezeni[l].hodnotyOmezeni[j] === vstup[promenna - 1]) {
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
          if (seznamPromennych[i].omezeni[l].omezeniProPromennou === vstup[promenna - 1]) {
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

  arcConsistency(pozadovanychReseni, seznamPromennych) {
    // TODO Test ze zadani
    //    seznamPromennych = [];
    //    seznamPromennych.push(new Promenna('A', [5], []));
    //    // seznamPromennych.push(new Promenna("A", [5, 4], []))
    //    seznamPromennych.push(new Promenna('B', [2], []));
    //    seznamPromennych.push(new Promenna('C', [3], []));
    //    seznamPromennych.push(new Promenna('D', [4], []));
    //    // seznamPromennych.push(new Promenna("E", [1, 2, 3, 4, 5], [new Omezeni("=", ["A", "D"], null)]))
    //    // seznamPromennych.push(new Promenna("E", [1, 2, 3, 4, 5], [new Omezeni("p", [[1,1],[2,2],[3,3],[4,4],[5,5]], "A"),new Omezeni("p", [[1,1],[2,2],[3,3],[4,4],[5,5]], "D")]))
    //    seznamPromennych.push(new Promenna('E', [4, 5], [new Omezeni('z', [[5, 5]], 'A'), new Omezeni('z', [[4, 4]], 'D')]));


    this._prevodOmezeni(seznamPromennych);

    var zmeneno;
    let selhani;
    var postupTvoreniGrafu = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      zmeneno = false;
      var promenna = seznamPromennych[i];
      for (var j = 0; j < promenna.omezeni.length; j++) {
        switch (promenna.omezeni[j].typOmezeni) {
          case '<':
            for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
              var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
              const krokAlgoritmu = new KrokAlgoritmu();
              selhani = this._arcConsistencyLesser(promenna, porovnavanaPromenna);
              switch (selhani[0]) {
                case "uprava":
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                  }
                  break;
                case "prazdna domena":
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
              selhani = this._arcConsistencyGreater(porovnavanaPromenna, promenna);
              switch (selhani[0]) {
                case "uprava":
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                  }
                  break;
                case "prazdna domena":
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
            }
            break;
          case '>':
            for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
              var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
              const krokAlgoritmu = new KrokAlgoritmu();
              selhani = this._arcConsistencyGreater(promenna, porovnavanaPromenna);
              switch (selhani[0]) {
                case "uprava":
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                  }
                  break;
                case "prazdna domena":
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
              selhani = this._arcConsistencyLesser(porovnavanaPromenna, promenna);
              switch (selhani[0]) {
                case "uprava":
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                  }
                  break;
                case "prazdna domena":
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
            }
            break;
          case '=':
            for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
              var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
              const krokAlgoritmu = new KrokAlgoritmu();
              selhani = this._arcConsistencyEqual(promenna, porovnavanaPromenna);
              switch (selhani[0]) {
                case "uprava":
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                  }
                  break;
                case "prazdna domena":
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
              selhani = this._arcConsistencyEqual(porovnavanaPromenna, promenna);
              switch (selhani[0]) {
                case "uprava":
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                  }
                  break;
                case "prazdna domena":
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
            }
            break;
          case '!':
            for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
              var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
              const krokAlgoritmu = new KrokAlgoritmu();
              selhani = this._arcConsistencyNotEqual(promenna, porovnavanaPromenna);
              switch (selhani[0]) {
                case "uprava":
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                  }
                  break;
                case "prazdna domena":
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
              selhani = this._arcConsistencyNotEqual(porovnavanaPromenna, promenna);
              switch (selhani[0]) {
                case "uprava":
                  for (var l = 0; l < selhani[1].length; l++) {
                    krokAlgoritmu.popis.push(selhani[1][l]);
                  }
                  break;
                case "prazdna domena":
                  return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
              }
            }
            break;
          case 'p':
            var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
            const krokAlgoritmu = new KrokAlgoritmu();
            selhani = this._arcConsistencyPovoleneDvojice(promenna, porovnavanaPromenna, 0, 1, j, 1);
            switch (selhani[0]) {
              case "uprava":
                for (var l = 0; l < selhani[1].length; l++) {
                  krokAlgoritmu.popis.push(selhani[1][l]);
                }
                break;
              case "prazdna domena":
                return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
            }
            selhani = this._arcConsistencyPovoleneDvojice(promenna, porovnavanaPromenna, 1, 0, j, 2);
            switch (selhani[0]) {
              case "uprava":
                for (var l = 0; l < selhani[1].length; l++) {
                  krokAlgoritmu.popis.push(selhani[1][l]);
                }
                break;
              case "prazdna domena":
                return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
            }
            break;
          case 'z':
            var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
            selhani = this._arcConsistencyZakazanDvojice(promenna, porovnavanaPromenna, 0, j, 1);
            switch (selhani[0]) {
              case "uprava":
                for (var l = 0; l < selhani[1].length; l++) {
                  krokAlgoritmu.popis.push(selhani[1][l]);
                }
                break;
              case "prazdna domena":
                return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
            }
            selhani = this._arcConsistencyZakazanDvojice(promenna, porovnavanaPromenna, 0, j, 2);
            switch (selhani[0]) {
              case "uprava":
                for (var l = 0; l < selhani[1].length; l++) {
                  krokAlgoritmu.popis.push(selhani[1][l]);
                }
                break;
              case "prazdna domena":
                return this._arcConsistencyFail(seznamPromennych, promenna, selhani);
            }
            break;
        }
      }
      if (zmeneno) {
        i = -1;
      }
    }

    return this.backtracking(pozadovanychReseni, seznamPromennych);
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
        zprava.parametry = { 'nazev': promennaA.nazev, 'hodnota': promennaA.domena[i], 'porovnavanaPromenna': promennaB.nazev, "typ": "=" }
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
        zprava.parametry = { 'nazev': promennaA.nazev, 'hodnota': promennaA.domena[i], 'porovnavanaPromenna': promennaB.nazev, "typ": "=" }
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
        zprava.parametry = { 'nazev': promennaA.nazev, 'hodnota': promennaA.domena[i], 'porovnavanaPromenna': promennaB.nazev, "typ": "=" }
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
        zprava.parametry = { 'nazev': promennaA.nazev, 'hodnota': promennaA.domena[i], 'porovnavanaPromenna': promennaB.nazev, "typ": "!=" }
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
    krokAlgoritmu.stav = 'deadend';

    return [krokAlgoritmu];
  }

  randomBacktracking(pozadovanychReseni, seznamPromennych) {
    // TODO Test ze zadani
    //    seznamPromennych = [];
    //    // seznamPromennych.push(new Promenna("A", [1,2,3,4,5], []))
    //    // seznamPromennych.push(new Promenna("B", [1,2,3,4,5], [new Omezeni("=", ["A"], null)]))
    //    seznamPromennych.push(new Promenna('A', [1, 2], []));
    //    seznamPromennych.push(new Promenna('B', [4, 5], [new Omezeni('=', ['A'], null)]));
    //    seznamPromennych.push(new Promenna('C', [1, 2, 3, 4, 5], []));
    //    seznamPromennych.push(new Promenna('D', [1, 2, 3, 4, 5], []));
    //    seznamPromennych.push(new Promenna('E', [1, 2, 3, 4, 5], [new Omezeni('>', ['A'], null)]));
    //    //this._prevodOmezeni(seznamPromennych);
    //    seznamPromennych[0].zalohaDomeny = seznamPromennych[0].domena.slice();
    //    seznamPromennych[1].zalohaDomeny = seznamPromennych[1].domena.slice();
    //    seznamPromennych[2].zalohaDomeny = seznamPromennych[2].domena.slice();
    //    seznamPromennych[3].zalohaDomeny = seznamPromennych[3].domena.slice();
    //    seznamPromennych[4].zalohaDomeny = seznamPromennych[4].domena.slice();
    this._prevodOmezeni(seznamPromennych);

    // Zaloha domeny - vzdy se vracime k vstupnimu stavu
    seznamPromennych.forEach(
      (p: Promenna) => p.zalohaDomeny = p.domena.slice()
    );

    var postupTvoreniGrafu = new Array();
    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && (!pozadovanychReseni || pocetReseni < pozadovanychReseni)) {
      var zpracovavanaPromenna = seznamPromennych[promenna];
      zpracovavanaPromenna.pozice = Math.floor(Math.random() * zpracovavanaPromenna.domena.length);
      if (zpracovavanaPromenna.domena.length == 0) {
        zpracovavanaPromenna.pozice = -1;
        zpracovavanaPromenna.domena = zpracovavanaPromenna.zalohaDomeny.slice();
        promenna--;
        const vracenaPromenna = seznamPromennych[promenna];
        if (vracenaPromenna) { vracenaPromenna.domena.splice(vracenaPromenna.pozice, 1); }
        continue;
      }

      const krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = this._lastIndex(seznamPromennych[promenna - 1], postupTvoreniGrafu) + 1;

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.random.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);

      postupTvoreniGrafu.push(krokAlgoritmu);

      const poruseneOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
      if (poruseneOmezeni != undefined) {
        for (var i = 0; i < poruseneOmezeni.length; i++) {
          krokAlgoritmu.popis.push(poruseneOmezeni[i]);
        }
      }
      if (poruseneOmezeni) {
        var lokalizovanaZprava = new LokalizovanaZprava();
        lokalizovanaZprava.klic = 'popis.random.deadend';
        lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
        krokAlgoritmu.popis.push(lokalizovanaZprava);
        krokAlgoritmu.stav = 'deadend';
        zpracovavanaPromenna.domena.splice(zpracovavanaPromenna.pozice, 1);
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          krokAlgoritmu.stav = 'reseni';
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.random.reseni';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
          zpracovavanaPromenna.domena.splice(zpracovavanaPromenna.pozice, 1);
        } else {
          promenna++;
          var lokalizovanaZprava = new LokalizovanaZprava();
          lokalizovanaZprava.klic = 'popis.random.uzel';
          lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
          krokAlgoritmu.popis.push(lokalizovanaZprava);
        }
      }

    }
    return postupTvoreniGrafu;
  }

  dynamicOrderBacktracking(pozadovanychReseni, seznamPromennych) {
    // TODO Test ze zadani
    //    seznamPromennych = [];
    //    seznamPromennych.push(new Promenna('A', [1, 2, 3, 4, 5], []));
    //    seznamPromennych.push(new Promenna('B', [4, 3, 2], []));
    //    seznamPromennych.push(new Promenna('C', [3, 1], []));
    //    seznamPromennych.push(new Promenna('D', [4], []));
    //    seznamPromennych.push(new Promenna('E', [1, 5], []));

    this._prevodOmezeni(seznamPromennych);

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
      krokAlgoritmu.rodic = this._lastIndex(seznamPromennych[promenna - 1], postupTvoreniGrafu) + 1;

      var lokalizovanaZprava = new LokalizovanaZprava();
      lokalizovanaZprava.klic = 'popis.dynamicOrder.prirazeni';
      lokalizovanaZprava.parametry = { 'nazev': krokAlgoritmu.nazev, 'hodnota': krokAlgoritmu.hodnota }
      krokAlgoritmu.popis.push(lokalizovanaZprava);
      postupTvoreniGrafu.push(krokAlgoritmu);

      const poruseneOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
      if (poruseneOmezeni != undefined) {
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

  iConsistency(pocetReseni, iPocet, seznamPromennych) {
    // TODO Test ze zadani
    //    seznamPromennych = [];
    //    // seznamPromennych.push(new Promenna("A", [1, 2], []))
    //    // seznamPromennych.push(new Promenna("B", [3, 4], []))
    //    // seznamPromennych.push(new Promenna("C", [5, 6], []))
    //    // seznamPromennych.push(new Promenna("D", [7, 8], []))
    //    // seznamPromennych.push(new Promenna("E", [9, 0], [new Omezeni("=", ["A", "B", "D"], null)]))
    //    seznamPromennych.push(new Promenna('A', [1], []));
    //    seznamPromennych.push(new Promenna('B', [2], []));
    //    seznamPromennych.push(new Promenna('C', [3, 4], []));
    //    seznamPromennych.push(new Promenna('D', [4, 5], []));
    //    seznamPromennych.push(new Promenna('E', [4, 5], [new Omezeni('=', ['C', 'D'], null)]));
    //    iPocet = 3;

    this._prevodOmezeni(seznamPromennych);

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
        if (typOmezeni == 'p' || typOmezeni == 'z') {
          if (seznamPromennychproOmezeni.indexOf(promenna.omezeni[j].omezeniProPromennou) == -1) {
            seznamPromennychproOmezeni.push(promenna.omezeni[j].omezeniProPromennou);
          }
        } else {
          for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
            if (seznamPromennychproOmezeni.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]) == -1) {
              seznamPromennychproOmezeni.push(promenna.omezeni[j].hodnotyOmezeni[k]);
            }
          }
        }
      }
      seznamVsechPromennychOmezeni.push(seznamPromennychproOmezeni);
    }
    while (this._iConsistencyKontrola(iPocet, seznamPromennych, seznamVsechPromennychOmezeni)
    ) { }
    return this.backtracking(pocetReseni, seznamPromennych);
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
        case '<':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo < porovnavanaHodnota)) {
              return false;
            }
          }
          break;
        case '>':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo > porovnavanaHodnota)) {
              return false;
            }
          }
          break;
        case '=':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo !== porovnavanaHodnota) {
              return false;
            }
          }
          break;
        case '!':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo === porovnavanaHodnota) {
              return false;
            }
          }
          break;
        case 'p':
          var porovnavanaPromenna = omezeni.omezeniProPromennou;
          if (porovnavanaPromenna != iOmezeni) {
            continue;
          }
          var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
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
        case 'z':
          var porovnavanaPromenna = omezeni.omezeniProPromennou;
          if (porovnavanaPromenna != iOmezeni) {
            continue;
          }
          var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
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

  testPrevoduOmezeni() {

    // TODO Test ze zadani
    var seznamPromennych = [];
    seznamPromennych.push(new Promenna('A', [1, 2, 3, 4, 5], [new Omezeni('p', [[1, 2], [3, 4]], 'C')]));
    // seznamPromennych.push(new Promenna("A", [1,2,3,4, 5], [new Omezeni("=",["C","E"],null)]))
    seznamPromennych.push(new Promenna('B', [4, 3, 2], []));
    seznamPromennych.push(new Promenna('C', [3, 1], [new Omezeni('p', [[6, 5]], 'A')]));
    // seznamPromennych.push(new Promenna("C", [3,1], [new Omezeni("=",["B"],null)]))
    seznamPromennych.push(new Promenna('D', [4], []));
    seznamPromennych.push(new Promenna('E', [1, 5], []));

    this._prevodOmezeni(seznamPromennych);

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

  _lastIndex(promenna: Promenna, postupTvoreniGrafu: Array<KrokAlgoritmu>) {
    if (!promenna) {
      return -1;
    }
    for (var i = postupTvoreniGrafu.length - 1; i >= 0; i--) {
      if (postupTvoreniGrafu[i].nazev === promenna.nazev) {
        return i;
      }
    }

    return -1;
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

  _prevodOmezeni(seznamPromennych) {
    var zmeneno = false;

    for (var i = 0; i < seznamPromennych.length; i++) {
      var promenna = seznamPromennych[i];
      for (var j = 0; j < promenna.omezeni.length; j++) {
        var omezeni = promenna.omezeni[j];
        switch (omezeni.typOmezeni) {
          case '<':
            for (var l = 0; l < omezeni.hodnotyOmezeni.length; l++) {
              var porovnavaneOmezeni = omezeni.hodnotyOmezeni[l];
              if (this.promennaService.index(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '>') {
                    porovnavanaPromenna.omezeni[m].hodnotyOmezeni.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni.push(new Omezeni('>', [promenna.nazev], null));
                }
                zmeneno = false;
                omezeni.hodnotyOmezeni.splice(l, 1);
                l--;
              }
            }
            if (omezeni.hodnotyOmezeni.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case '>':
            for (var l = 0; l < omezeni.hodnotyOmezeni.length; l++) {
              var porovnavaneOmezeni = omezeni.hodnotyOmezeni[l];
              if (this.promennaService.index(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '<') {
                    porovnavanaPromenna.omezeni[m].hodnotyOmezeni.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni.push(new Omezeni('<', [promenna.nazev], null));
                }
                zmeneno = false;
                omezeni.hodnotyOmezeni.splice(l, 1);
                l--;
              }
            }
            if (omezeni.hodnotyOmezeni.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case '=':
            for (var l = 0; l < omezeni.hodnotyOmezeni.length; l++) {
              var porovnavaneOmezeni = omezeni.hodnotyOmezeni[l];
              if (this.promennaService.index(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '=') {
                    porovnavanaPromenna.omezeni[m].hodnotyOmezeni.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni.push(new Omezeni('=', [promenna.nazev], null));
                }
                zmeneno = false;
                omezeni.hodnotyOmezeni.splice(l, 1);
                l--;
              }
            }
            if (omezeni.hodnotyOmezeni.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case '!':
            for (var l = 0; l < omezeni.hodnotyOmezeni.length; l++) {
              var porovnavaneOmezeni = omezeni.hodnotyOmezeni[l];
              if (this.promennaService.index(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '!') {
                    porovnavanaPromenna.omezeni[m].hodnotyOmezeni.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni.push(new Omezeni('!', [promenna.nazev], null));
                }
                zmeneno = false;
                omezeni.hodnotyOmezeni.splice(l, 1);
                l--;
              }
            }
            if (omezeni.hodnotyOmezeni.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case 'p':
            var pomocnaPromenna;
            if (this.promennaService.index(seznamPromennych, omezeni.omezeniProPromennou) > i) {
              var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, omezeni.omezeniProPromennou);
              var seznamDvojic = omezeni.hodnotyOmezeni;
              for (var k = 0; k < seznamDvojic.length; k++) {
                var dvojice = seznamDvojic[k];
                pomocnaPromenna = dvojice[0];
                dvojice[0] = dvojice[1];
                dvojice[1] = pomocnaPromenna;
              }
              var jesteNeexistujeOmezeni = true;
              for (var k = 0; k < porovnavanaPromenna.omezeni.length; k++) {
                if (porovnavanaPromenna.omezeni[k].omezeniProPromennou == promenna.nazev) {
                  jesteNeexistujeOmezeni = false;
                  for (var l = 0; l < seznamDvojic.length; l++) {
                    porovnavanaPromenna.omezeni[k].hodnotyOmezeni.push(seznamDvojic[l]);
                  }
                }
              }
              if (jesteNeexistujeOmezeni) {
                porovnavanaPromenna.omezeni.push(new Omezeni('p', seznamDvojic, promenna.nazev));
              }
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case 'z':
            var pomocnaPromenna;
            if (this.promennaService.index(seznamPromennych, omezeni.omezeniProPromennou) > i) {
              var porovnavanaPromenna = this.promennaService.najdi(seznamPromennych, omezeni.omezeniProPromennou);
              var seznamDvojic = omezeni.hodnotyOmezeni;
              for (var k = 0; k < seznamDvojic.length; k++) {
                var dvojice = seznamDvojic[k];
                pomocnaPromenna = dvojice[0];
                dvojice[0] = dvojice[1];
                dvojice[1] = pomocnaPromenna;
              }
              var jesteNeexistujeOmezeni = true;
              for (var k = 0; k < porovnavanaPromenna.omezeni.length; k++) {
                if (porovnavanaPromenna.omezeni[k].omezeniProPromennou == promenna.nazev) {
                  jesteNeexistujeOmezeni = false;
                  for (var l = 0; l < seznamDvojic.length; l++) {
                    porovnavanaPromenna.omezeni[k].hodnotyOmezeni.push(seznamDvojic[l]);
                  }
                }
              }
              if (jesteNeexistujeOmezeni) {
                porovnavanaPromenna.omezeni.push(new Omezeni('z', seznamDvojic, promenna.nazev));
              }
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
        }
      }
    }
    return seznamPromennych;
  }

  _porovnej(promenna, seznamPromennych) {
    if (!promenna.omezeni) {
      return null;
    }

    var popisPrubehuOmezeni = new Array<LokalizovanaZprava>();

    var cislo = promenna.domena[promenna.pozice];
    for (var i = 0; i < promenna.omezeni.length; i++) {
      var omezeni = promenna.omezeni[i];

      switch (omezeni.typOmezeni) {
        case '<':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo < porovnavanaHodnota)) {
              omezeni.omezeniProPromennou = porovnavanaPromenna;
              var popis = new LokalizovanaZprava();
              popis.klic = 'popis.omezeni.nesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.splneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
            popisPrubehuOmezeni.push(popis);
          }
          break;
        case '>':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo > porovnavanaHodnota)) {
              omezeni.omezeniProPromennou = porovnavanaPromenna;
              var popis = new LokalizovanaZprava();
              popis.klic = 'popis.omezeni.nesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.splneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
            popisPrubehuOmezeni.push(popis);
          }
          break;
        case '=':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo !== porovnavanaHodnota) {
              omezeni.omezeniProPromennou = porovnavanaPromenna;
              var popis = new LokalizovanaZprava();
              popis.klic = 'popis.omezeni.nesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.splneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
            popisPrubehuOmezeni.push(popis);
          }
          break;
        case '!':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo === porovnavanaHodnota) {
              omezeni.omezeniProPromennou = porovnavanaPromenna;
              var popis = new LokalizovanaZprava();
              popis.klic = 'popis.omezeni.nesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.splneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
            popisPrubehuOmezeni.push(popis);
          }
          break;
        case 'p':
          var porovnavanaPromenna = omezeni.omezeniProPromennou;
          var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
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
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.povolenoNesplneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota }
            popisPrubehuOmezeni.push(popis);
            return popisPrubehuOmezeni;
          }
          var popis = new LokalizovanaZprava();
          popis.klic = 'popis.omezeni.povolenoSplneno';
          popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota }
          popisPrubehuOmezeni.push(popis);
          break;
        case 'z':
          var porovnavanaPromenna = omezeni.omezeniProPromennou;
          var porovnavanaHodnota = this.promennaService.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            if (cislo === omezeni.hodnotyOmezeni[j][0] && porovnavanaHodnota === omezeni.hodnotyOmezeni[j][1]) {
              popis.klic = 'popis.omezeni.zakazaneNesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
          }
          var popis = new LokalizovanaZprava();
          popis.klic = 'popis.omezeni.zakazeneSplneno';
          popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota }
          popisPrubehuOmezeni.push(popis);
          break;
      }
    }
  }

  exportZadani() {
    const json = this.promennaService.export();
    const blob = new Blob([json], {type: 'application/json'});
    saveAs(blob, 'Zadani.json');
  }

  importZadani(importovano: boolean) {
    this.zobrazImportDialog = false;
    
    if (importovano) {
      this.listPromennych = this.promennaService.list();
    }
  }

  // TODO odstranit
  debug(o: any) {
    return true;
  }
}
