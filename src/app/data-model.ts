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

export class KrokAlgoritmu {
  promenna: number; // Index v seznamu promennych
  nazev: string;
  hodnota: string;
  rodic: number;
  popis = new Array<LokalizovanaZprava>();
  stav: string; // TODO enum
  omezeni: Omezeni;
  hodnotaDomenKroku = new Array<any>();
}

export class LokalizovanaZprava {
  klic: string;
  parametry: any;
}