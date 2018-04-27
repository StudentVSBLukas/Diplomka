import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export class Algoritmus {
  constructor(public nazev: string, public definice: string, public run: any) {}
}


@Component({
  selector: 'app-dialog-algoritmus',
  templateUrl: './dialog-algoritmus.component.html',
  styleUrls: ['./dialog-algoritmus.component.css']
})
export class DialogAlgoritmusComponent implements OnInit {

  @Input() algoritmus: Algoritmus;
  @Output() close = new EventEmitter<Algoritmus>();

  constructor() { }

  ngOnInit() {
  }

  zavritDialog() {
    this.close.emit(this.algoritmus);
  }
}
