import { Promenna, Omezeni, KrokAlgoritmu, LokalizovanaZprava, TypKroku, TypOmezeni } from '../data-model';
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
    const ogt = new Omezeni(TypOmezeni.mensi, ['B']);
    const one = new Omezeni(TypOmezeni.nerovno, ['C']);
    const op = new Omezeni(TypOmezeni.povoleno, ['B'], [[4, 5], [2, 1]]);
    a.omezeni = [ogt, one, op];

    //    const c = this.listPromennych[2];
    //    c.domena.push(7);
    //    c.omezeni.push(new Omezeni(TypOmezeni.zakazano, [[7,5]], 'B'));
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
      kopiePromenne.omezeni = p.omezeni.map(function (o) {
        const kopieOmezeni = Object.assign(new Omezeni(o.typOmezeni), o);
        kopieOmezeni.omezeniProPromennou = o.omezeniProPromennou.filter(
          (cilovaPromenna: string) => this.promennaService.vrat(cilovaPromenna).aktivni
        );
        kopieOmezeni.hodnotyOmezeni = o.hodnotyOmezeni.map(
            hodnota => Object.assign({}, hodnota)
        );

        return kopieOmezeni;
      }, this).filter(
        (o: Omezeni) => o.omezeniProPromennou.length
      );

      return kopiePromenne;
    }, this);
    return zadani;
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
}