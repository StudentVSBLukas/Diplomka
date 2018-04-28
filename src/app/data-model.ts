export class Promenna {
  nazev: string;
  domena: Array<number>;
  omezeni: Array<Omezeni>;
  aktivni: boolean;
  pozice: number;
  zalohaDomeny: Array<number>;
  constructor(nazev: string, domena: number[] = [], omezeni: Omezeni[] = []) {
    this.nazev = nazev;
    this.domena = domena || [];
    this.omezeni = omezeni || [];
    this.aktivni = true;
    this.pozice = -1;
    this.zalohaDomeny = [];
  }
  vratPrirazenouHodnotu(): number {
    return this.domena[this.pozice];
  }

}

export class Omezeni {
  static id_sequence = 0;

  // TODO predelat na Enum a zmenit i atribut ve tride Omezeni
  id: number;
  typOmezeni: string;
  hodnotyOmezeni: any;
  omezeniProPromennou: any;
  constructor(typOmezeni: string, hodnotyOmezeni: any[] = [], omezeniProPromennou: string = null) {
    this.id = Omezeni.id_sequence++;
    this.typOmezeni = typOmezeni;
    this.hodnotyOmezeni = hodnotyOmezeni;
    this.omezeniProPromennou = omezeniProPromennou;
  }
}

export enum TypKroku {
  akce,
  popis,
}

export class KrokAlgoritmu {
  nazev: string;
  hodnota: any;
  rodic: number;
  popis = new Array<LokalizovanaZprava>();
  stav: string; // TODO enum
  typ: TypKroku;
  omezeni: Omezeni;
  hodnotaDomenKroku = new Array<any>();
  
  constructor() {
    this.typ = TypKroku.akce;
  }
}

export class LokalizovanaZprava {

  constructor (public klic: string = null, public parametry: any = null) {}
}
