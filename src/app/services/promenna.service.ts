import { Promenna, Omezeni } from '../data-model';
import { Injectable } from '@angular/core';
import AlgoritmusUtils from './algoritmus-utils';

@Injectable()
export class PromennaService {

  private listPromennych: Array<Promenna>;

  constructor() {
    this.listPromennych = [];
  }

  list(): Array<Promenna> {
    return this.listPromennych;
  }

  vrat(nazev: string): Promenna {
    return AlgoritmusUtils.najdi(this.listPromennych, nazev);
  }

  vytvor(): Promenna {
    const promenna = new Promenna(this.generateIdentifier(), [], null);
    this.listPromennych.push(promenna);

    return promenna;
  }

  uprav(promenna: Promenna) {
    const index = AlgoritmusUtils.index(this.listPromennych, promenna.nazev);
    if (index !== -1) {
      this.listPromennych[index] = promenna;
    }
  }

  smaz(promenna: Promenna) {
    const index = this.listPromennych.indexOf(promenna);
    if (index !== -1) {
      this.listPromennych.splice(index, 1);
    }

    this.listPromennych.forEach(
      (p: Promenna) => {
        // Odstranim z omezeni vazby na mazanou promennou
        p.omezeni.forEach(
          (o: Omezeni) => o.omezeniProPromennou = o.omezeniProPromennou.filter(
            (nazev: string) => nazev !== promenna.nazev
          )
        );

        // Odstranim omezeni, ktere nemaji vazby
        p.omezeni = p.omezeni.filter(
          (o: Omezeni) => o.omezeniProPromennou.length
        );
      }
    )
  }

  export(): string {
    return JSON.stringify(this.listPromennych, (key, value) => {
      if (key === 'pozice') { return undefined; }
      if (key === 'zalohaDomeny') { return undefined; }
      return value;
    }, 2);
  }

  import(vstup: Array<any>) {
    // Vytvoreni promennych ze vstupu
    const promenne = vstup.map(
      (p: any) => Object.assign(new Promenna(p.nazev), p)
    );

    // Vytvoreni omezeni ze vstupu
    promenne.forEach(
      (p: Promenna) => p.omezeni = p.omezeni.map(
        (o: any) => Object.assign(new Omezeni(o.typOmezeni), o)
      )
    );

    // TODO validovat vstup
    this.listPromennych = promenne;
  }

  private generateIdentifier() {
    if (this.listPromennych.length === 0) {
      return 'A';
    }

    const baseChar = ('A').charCodeAt(0) - 1;
    const lastIdentifier = this.listPromennych[this.listPromennych.length - 1].nazev;
    let lastIdentifierCode = 0;
    for (let length = lastIdentifier.length, i = 0, base = 1; i < length; i++, base *= 27) {
      lastIdentifierCode += base * (lastIdentifier.charCodeAt(length - i - 1) - baseChar);
    }
    lastIdentifierCode++;

    let letters = '';
    do {
      letters = String.fromCharCode(baseChar + Math.max(lastIdentifierCode % 27, 1)) + letters;
      lastIdentifierCode = ((lastIdentifierCode / 27) >> 0); // quick `floor`
    } while (lastIdentifierCode > 0);

    return letters;
  }
}
