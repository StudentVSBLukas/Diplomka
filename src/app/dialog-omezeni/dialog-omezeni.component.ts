import { Promenna, Omezeni, TypOmezeni } from '../data-model';
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


  filtrovanePromenne: Array<any>;
  // TODO vytahnout do enums
  typyOmezeni = [
    { label: 'omezeni.typ.<', value: TypOmezeni.mensi },
    { label: 'omezeni.typ.>', value: TypOmezeni.vetsi },
    { label: 'omezeni.typ.=', value: TypOmezeni.rovno },
    { label: 'omezeni.typ.!', value: TypOmezeni.nerovno },
    { label: 'omezeni.typ.p', value: TypOmezeni.povoleno },
    { label: 'omezeni.typ.z', value: TypOmezeni.zakazano }
  ];

  constructor(private promennaService: PromennaService) {
  }

  ngOnInit() {
    this.filtrovanePromenne = this.promennaService.list().filter(
      (p: Promenna) => p.nazev !== this.promenna.nazev
    ).map(
      (p: Promenna) => ({ label: p.nazev, value: p.nazev })
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

  pridejOmezeni(promenna: Promenna, typ: TypOmezeni, cilovaPromenna: string) {
    const omezeni = new Omezeni(typ);
    if (cilovaPromenna) {
      omezeni.omezeniProPromennou.push(cilovaPromenna);
    }
    omezeni.hodnotyOmezeni = <any>'';
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

    vysledek.omezeni = p.omezeni.map(function (item) {
      const o = Object.assign({}, item);

      o.omezeniProPromennou = item.omezeniProPromennou.slice();
      o.hodnotyOmezeni = <any>item.hodnotyOmezeni.join(' ');

      return o;
    }, this);

    return vysledek;
  }

  private upravPromennou(original: Promenna, cil: Promenna) {
    Object.assign(original, cil);

    original.omezeni = cil.omezeni.map(function (item) {
      const o = Object.assign({}, item);

      o.omezeniProPromennou = item.omezeniProPromennou.slice();

      const dvojiceHodnot = (<any>item.hodnotyOmezeni).match(/\s*(-?\d+\s*,\s*-?\d+)/g) || [];
      o.hodnotyOmezeni = dvojiceHodnot.map(
        (dvojice: string) => dvojice.split(',').map(Number)
      );

      return o;
    }, this);

    return original;
  }

  jeJednoducheOmezeni(typOmezeni: TypOmezeni) {
    return typOmezeni === TypOmezeni.mensi || typOmezeni === TypOmezeni.vetsi
      || typOmezeni === TypOmezeni.rovno || typOmezeni === TypOmezeni.nerovno;
  }
}
