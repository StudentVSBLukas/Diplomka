import { Promenna, Omezeni } from '../data-model';
import { PromennaService } from '../services/promenna.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog-omezeni',
  templateUrl: './dialog-omezeni.component.html',
  styleUrls: ['./dialog-omezeni.component.css']
})
export class DialogOmezeniComponent implements OnInit {

  private _promenna: Promenna; // Input
  @Input() appendTo: any;
  @Output() close = new EventEmitter<Promenna>();


  filtrovanePromenne: Array<Promenna>;
  // TODO vytahnout do enums
  typyOmezeni = [
    {label: 'omezeni.typ.<', value: '<'},
    {label: 'omezeni.typ.>', value: '>'},
    {label: 'omezeni.typ.=', value: '='},
    {label: 'omezeni.typ.!', value: '!'},
    {label: 'omezeni.typ.p', value: 'p'},
    {label: 'omezeni.typ.z', value: 'z'}
  ];

  constructor(private promennaService: PromennaService) {
  }

  ngOnInit() {
    this.filtrovanePromenne = this.promennaService.list().filter(
      (p: Promenna) => p.nazev !== this.promenna.nazev
    );
  }

  @Input()
  set promenna(p: Promenna) {
    this._promenna = this.prevedPromennou(p);
  }

  get promenna(): Promenna {
    return this._promenna;
  }

  // TODO presunout na Promennou (spravny typ na vybranaPromenna)
  odeberOmezeni(promenna: Promenna, omezeni: Omezeni) {
    const index = promenna.omezeni.indexOf(omezeni);
    if (index !== -1) {
      promenna.omezeni.splice(index, 1);
    }
  }

  pridejOmezeni(promenna: Promenna, typ: string, cilovaPromenna: Promenna) {
    const omezeni = new Omezeni(typ);
    omezeni.omezeniProPromennou = cilovaPromenna;
    promenna.omezeni.push(omezeni);
  }

  resetDialogOmezeni() {
    this.promenna = this.promennaService.vrat(this._promenna.nazev);
  }

  submitDialogOmezeni() {
    const promenna = this.promennaService.vrat(this._promenna.nazev);
    this.upravPromennou(promenna, this._promenna);

    this.close.emit(promenna);
  }

  closeDialogOmezeni() {
    this.close.emit(null);
  }

  // TODO Promenna Converter class
  private prevedPromennou(p: Promenna) {
    const vysledek = Object.assign({}, p);

    vysledek.omezeni = p.omezeni.map( function(item) {
      const o =  Object.assign({}, item);

      if (this.jeJednoducheOmezeni(o.typOmezeni)) {
        o.hodnotyOmezeni = item.hodnotyOmezeni.map(
          (hodnota: string) => this.promennaService.vrat(hodnota)
        );
      } else {
        o.hodnotyOmezeni = item.hodnotyOmezeni.join(' ');
        o.omezeniProPromennou = this.promennaService.vrat(item.omezeniProPromennou);
      }

      return o;
    }, this);

    return vysledek;
  }

  private upravPromennou(original: Promenna, cil: Promenna) {
    Object.assign(original, cil);

    original.omezeni = cil.omezeni.map( function(item) {
      const o =  Object.assign({}, item);

      if (this.jeJednoducheOmezeni(o.typOmezeni)) {
        o.hodnotyOmezeni = item.hodnotyOmezeni.map(
          (promenna: Promenna) => promenna.nazev
        );
      } else {
        const dvojiceHodnot = item.hodnotyOmezeni.match(/\s*(-?\d+\s*,\s*-?\d+)/g);
        o.hodnotyOmezeni = dvojiceHodnot.map(
          (dvojice: string) => dvojice.split(',').map(Number)
        );
        o.omezeniProPromennou = item.omezeniProPromennou.nazev;
      }

      return o;
    }, this);

    return original;
  }

  // TODO zbavit se tohoto - upravit patricne atributy omezeni
  jeJednoducheOmezeni(typOmezeni: string) {
    return typOmezeni === '<' || typOmezeni === '>' || typOmezeni === '=' || typOmezeni === '!';
  }
}
