import { Promenna, Omezeni, KrokAlgoritmu, LokalizovanaZprava, TypKroku, TypOmezeni } from '../data-model';
import { APP_ALGORITMY, Algoritmus } from '../services/algoritmus';
import { AlgoritmusTestUtils } from '../services/algoritmus-test-utils';
import { PromennaService } from '../services/promenna.service';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { Component, OnInit, ElementRef, ViewChild, Inject } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { saveAs } from 'file-saver/FileSaver';
import { ConfirmationService } from 'primeng/components/common/api';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
  animations: [
  trigger('slideInOut', [
    transition('void => *', [
      style({transform: 'translateX(0)'}),
      animate(250)
    ]),
    transition('* => void', [
      animate(250, style({transform: 'translateX(-100%)'}))
    ])
  ])
]
})
export class MainPageComponent implements OnInit {

  listPromennych = [];

  algoritmy;
  vybranyAlgoritmus;
  iConsistencyFaktor = 1;
  pocetReseni;

  lokalizace = ['cz', 'gb'];

  zobrazPromenne = true;
  zobrazAlgoritmusDialog = false;
  zobrazImportDialog = false;

  postup;

  constructor(private promennaService: PromennaService, private translate: TranslateService,
    @Inject(APP_ALGORITMY) algoritmy: Array<Algoritmus>, private confirm: ConfirmationService) {
    this.listPromennych = promennaService.list();
    this.algoritmy = algoritmy.map(
      (a: Algoritmus) => ({ label: '-', value: a })
    );
    this.vybranyAlgoritmus = algoritmy[0];

    translate.setDefaultLang('cz');
    translate.use('cz');
  }


  ngOnInit() {
  }

  pridejPromennou() {
    const promenna = this.promennaService.vytvor();
    this.listPromennych = this.promennaService.list();
  }

  odstranPromenne() {
    this.confirm.confirm({
        message: this.translate.instant('confirm.promenne'),
        accept: () => {
          this.promennaService.smazVse();
          this.listPromennych = this.promennaService.list();
        }
    });
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

  toggleZobrazPromenne() {
    this.zobrazPromenne = !this.zobrazPromenne;
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