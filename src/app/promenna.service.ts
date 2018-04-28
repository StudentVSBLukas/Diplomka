import { Promenna } from './data-model';
import { Injectable } from '@angular/core';

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
    return this.najdi(this.listPromennych, nazev);
  }

  najdi(seznamPromennych: Array<Promenna>, nazev: string) {
    for (let i = 0; i < seznamPromennych.length; i++) {
      const promenna = seznamPromennych[i];
      if (promenna.nazev === nazev) {
        return promenna;
      }
    }

    return null;
  }

  index(seznamPromennych: Array<Promenna>, nazev: string): number {
    for (let i = 0; i < seznamPromennych.length; i++) {
      if (seznamPromennych[i].nazev === nazev) {
        return i;
      }
    }

    return -1;
  }

  vytvor(): Promenna {
    const promenna = new Promenna(this.generateIdentifier(), [], null);
    this.listPromennych.push(promenna);

    return promenna;
  }

  uprav(promenna: Promenna) {
    const index = this.index(this.listPromennych, promenna.nazev);
    if (index !== -1) {
      this.listPromennych[index] = promenna;
    }
  }

  smaz(promenna: Promenna) {
    const index = this.listPromennych.indexOf(promenna);
    if (index !== -1) {
      this.listPromennych.splice(index, 1);
    }

    // TODO odstranit vsechna omezeni s promennou
  }

  export(): string {
    return JSON.stringify(this.listPromennych, null, 2);
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
