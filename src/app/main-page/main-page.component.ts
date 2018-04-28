import { Promenna, Omezeni, KrokAlgoritmu, LokalizovanaZprava, TypKroku } from '../data-model';
import { APP_ALGORITMY, Algoritmus } from '../services/algoritmus';
import { PromennaService } from '../services/promenna.service';
import { Component, OnInit, ElementRef, ViewChild, Inject } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { saveAs } from 'file-saver/FileSaver';
import AlgoritmusUtils from '../services/algoritmus-utils';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  listPromennych = [];

  algoritmy;
  vybranyAlgoritmus;
  iConsistencyFaktor = 1;
  pocetReseni;

  lokalizace = ['cz', 'gb'];

  zobrazAlgoritmusDialog = false;
  zobrazImportDialog = false;

  postup;

  constructor(private promennaService: PromennaService, private translate: TranslateService,
    @Inject(APP_ALGORITMY) algoritmy: Array<Algoritmus>) {
    this.listPromennych = promennaService.list();
    this.algoritmy = algoritmy.map(
      (a: Algoritmus) => ({ label: '-', value: a })
    );
    this.vybranyAlgoritmus = algoritmy[0];

    translate.setDefaultLang('cz');
    translate.use('cz');
  }


  ngOnInit() {
    for (let i = 0; i < 3; i++) {
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

    this.postup = this.vybranyAlgoritmus.run(zadani, this.pocetReseni, this.iConsistencyFaktor);
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

    // TODO odstranit
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

    AlgoritmusUtils.prevedOmezeni(seznamPromennych);

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