import { PromennaService } from '../services/promenna.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog-import',
  templateUrl: './dialog-import.component.html',
  styleUrls: ['./dialog-import.component.css']
})
export class DialogImportComponent implements OnInit {

  @Output() close = new EventEmitter<boolean>();

  constructor(private promennaService: PromennaService) { }

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

  zavritDialog(importovano: boolean) {
    this.close.emit(importovano);
  }

}
