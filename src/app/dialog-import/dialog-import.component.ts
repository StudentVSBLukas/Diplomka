import { ImportService } from '../services/import.service';
import { PromennaService } from '../services/promenna.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog-import',
  templateUrl: './dialog-import.component.html',
  styleUrls: ['./dialog-import.component.css']
})
export class DialogImportComponent implements OnInit {

  @Output() close = new EventEmitter<boolean>();

  priklady: any;
  vybranyPriklad;

  constructor(private promennaService: PromennaService, private importService: ImportService) {
    importService.nacistPriklady().subscribe(
      data => this.priklady = data.map(
        (soubor: string) => ({ label: soubor.replace(/\.[^/.]+$/, ''), value: soubor })
      )
    );
  }

  ngOnInit() {
  }

  importSouboru(vstupniSoubory: any) {
    const file: File = vstupniSoubory.files[0];
    const reader = new FileReader();

    reader.onloadend = (e: any) => { // Akce po nacteni
      const json = JSON.parse(reader.result);
      this.promennaService.import(json);
      this.zavritDialog(true);
    };

    // Spusteni nacteni
    reader.readAsText(file);
  }

  importPrikladu(soubor: string) {
    this.importService.nacistPriklad(soubor).subscribe(
      data => {
        this.promennaService.import(data);
        this.zavritDialog(true);
      }
    );
  }

  zavritDialog(importovano: boolean = false) {
    this.close.emit(importovano);
  }

}
